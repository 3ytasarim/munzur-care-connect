/**
 * Server-only minimal SMTP client (Gmail, STARTTLS on port 587).
 * Works both on Node (dev) and on the Cloudflare Workers runtime
 * (via `cloudflare:sockets` with `startTls`).
 */

type SmtpSocket = {
  write: (data: string | Uint8Array) => Promise<void>;
  readLine: () => Promise<string>;
  startTls: () => Promise<SmtpSocket>;
  close: () => Promise<void>;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function connectWorkers(host: string, port: number): Promise<SmtpSocket | null> {
  let connect: ((address: { hostname: string; port: number }, options?: unknown) => unknown) | null =
    null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import(/* @vite-ignore */ "cloudflare:sockets");
    connect = mod.connect;
  } catch {
    return null;
  }
  if (!connect) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeWrapper = (socket: any): SmtpSocket => {
    const writer = socket.writable.getWriter();
    const reader = socket.readable.getReader();
    let buffer = "";

    const readLine = async (): Promise<string> => {
      for (;;) {
        const idx = buffer.indexOf("\r\n");
        if (idx >= 0) {
          const line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          return line;
        }
        const { value, done } = await reader.read();
        if (done) {
          const rest = buffer;
          buffer = "";
          return rest;
        }
        buffer += decoder.decode(value, { stream: true });
      }
    };

    return {
      write: async (data) => {
        await writer.write(typeof data === "string" ? encoder.encode(data) : data);
      },
      readLine,
      startTls: async () => {
        await writer.releaseLock();
        await reader.releaseLock();
        return makeWrapper(socket.startTls());
      },
      close: async () => {
        try {
          await socket.close();
        } catch {
          /* ignore */
        }
      },
    };
  };

  const socket = connect({ hostname: host, port }, { secureTransport: "starttls", allowHalfOpen: false });
  return makeWrapper(socket);
}

async function connectNode(host: string, port: number): Promise<SmtpSocket> {
  const net = await import("node:net");
  const tls = await import("node:tls");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrap = (socket: any): SmtpSocket => {
    let buffer = "";
    const waiters: Array<(line: string) => void> = [];

    const flush = () => {
      while (waiters.length) {
        const idx = buffer.indexOf("\r\n");
        if (idx < 0) return;
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        waiters.shift()!(line);
      }
    };

    socket.setEncoding("utf8");
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      flush();
    });

    return {
      write: (data) =>
        new Promise((resolve, reject) => {
          socket.write(typeof data === "string" ? data : decoder.decode(data), (err?: Error) =>
            err ? reject(err) : resolve(),
          );
        }),
      readLine: () =>
        new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("smtp_read_timeout")), 20_000);
          waiters.push((line) => {
            clearTimeout(timer);
            resolve(line);
          });
          flush();
        }),
      startTls: () =>
        new Promise<SmtpSocket>((resolve, reject) => {
          socket.removeAllListeners("data");
          const secure = tls.connect({ socket, servername: host }, () => resolve(wrap(secure)));
          secure.on("error", reject);
        }),
      close: async () => {
        try {
          socket.destroy();
        } catch {
          /* ignore */
        }
      },
    };
  };

  return new Promise<SmtpSocket>((resolve, reject) => {
    const socket = net.connect({ host, port }, () => resolve(wrap(socket)));
    socket.on("error", reject);
  });
}

async function readReply(socket: SmtpSocket): Promise<{ code: number; text: string }> {
  const lines: string[] = [];
  for (;;) {
    const line = await socket.readLine();
    lines.push(line);
    if (line.length < 4 || line[3] !== "-") break;
  }
  const first = lines[0] ?? "";
  return { code: Number.parseInt(first.slice(0, 3), 10), text: lines.join("\n") };
}

async function command(socket: SmtpSocket, cmd: string, expected: number[]) {
  await socket.write(`${cmd}\r\n`);
  const reply = await readReply(socket);
  if (!expected.includes(reply.code)) {
    throw new Error(`SMTP ${cmd.split(" ")[0]} failed: ${reply.code} ${reply.text}`);
  }
  return reply;
}

function base64(value: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).btoa;
  const bytes = encoder.encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return B ? B(binary) : Buffer.from(value, "utf8").toString("base64");
}

function dotStuff(body: string) {
  return body.replace(/\r?\n/g, "\r\n").replace(/\r\n\./g, "\r\n..");
}

function encodeHeader(value: string) {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(value) ? value : `=?UTF-8?B?${base64(value)}?=`;
}

export async function sendSmtpMail(input: {
  host?: string;
  port?: number;
  user: string;
  password: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const host = input.host ?? "smtp.gmail.com";
  const port = input.port ?? 587;

  let socket = (await connectWorkers(host, port)) ?? (await connectNode(host, port));

  try {
    const greeting = await readReply(socket);
    if (greeting.code !== 220) throw new Error(`SMTP greeting failed: ${greeting.text}`);

    await command(socket, "EHLO munzurdestek.com", [250]);
    await command(socket, "STARTTLS", [220]);
    socket = await socket.startTls();
    await command(socket, "EHLO munzurdestek.com", [250]);

    await command(socket, "AUTH LOGIN", [334]);
    await command(socket, base64(input.user), [334]);
    await command(socket, base64(input.password), [235]);

    await command(socket, `MAIL FROM:<${input.user}>`, [250]);
    await command(socket, `RCPT TO:<${input.to}>`, [250, 251]);
    await command(socket, "DATA", [354]);

    const boundary = `md_${Math.random().toString(36).slice(2)}`;
    const headers = [
      `From: ${input.from}`,
      `To: ${input.to}`,
      `Subject: ${encodeHeader(input.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ].join("\r\n");

    const body = [
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      input.text ?? input.html.replace(/<[^>]+>/g, " "),
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      input.html,
      `--${boundary}--`,
      "",
    ].join("\r\n");

    await socket.write(`${headers}\r\n\r\n${dotStuff(body)}\r\n.\r\n`);
    const sent = await readReply(socket);
    if (sent.code !== 250) throw new Error(`SMTP send failed: ${sent.code} ${sent.text}`);

    await socket.write("QUIT\r\n");
  } finally {
    await socket.close();
  }
}
