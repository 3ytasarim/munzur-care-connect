/**
 * Server-only e-posta gönderimi (Gmail SMTP — uygulama şifresi ile).
 * GMAIL_USER / GMAIL_APP_PASSWORD tanımlı değilse gönderim atlanır.
 */
import { sendSmtpMail, type MailAttachment } from "./smtp.server";

type SendResult = { sent: boolean; reason?: string };

export function dataUrlToAttachment(
  dataUrl: string | null | undefined,
  filename: string,
  cid: string,
): MailAttachment | null {
  if (!dataUrl) return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  const contentType = match[1]!;
  const ext = contentType.split("/")[1]!.replace("jpeg", "jpg");
  return { filename: `${filename}.${ext}`, contentType, base64: match[2]!, cid };
}

export async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}): Promise<SendResult> {
  const user = process.env["GMAIL_USER"];
  const password = (process.env["GMAIL_APP_PASSWORD"] ?? "").replace(/\s+/g, "");
  if (!user || !password) {
    console.warn("[email] Gmail bilgileri yok, e-posta gönderilmedi:", input.subject);
    return { sent: false, reason: "missing_credentials" };
  }
  const from = process.env["MAIL_FROM"] ?? `MunzurDestek <${user}>`;

  try {
    await sendSmtpMail({
      user,
      password,
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] gönderim hatası", error);
    return { sent: false, reason: "smtp_error" };
  }
}


export function candidateApprovedEmail(input: { fullName: string; candidateCode: string }) {
  const subject = "Profiliniz aktif oldu — MunzurDestek";
  const html = `<!doctype html>
<html lang="tr"><body style="margin:0;background:#FAFAF7;font-family:Arial,Helvetica,sans-serif;color:#1F2933">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="font-size:22px;font-weight:700"><span style="color:#57B614">Munzur</span><span style="color:#1F2933">Destek</span></div>
    <div style="margin-top:20px;background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
      <h1 style="margin:0 0 12px;font-size:20px;color:#1F2933">Aktif Oldunuz 🎉</h1>
      <p style="margin:0 0 12px;line-height:1.6">Merhaba ${escapeHtml(input.fullName)},</p>
      <p style="margin:0 0 12px;line-height:1.6">
        Başvurunuzun incelemesi tamamlandı ve profiliniz <strong>onaylandı</strong>.
        Artık aday listemizde yayında görünüyorsunuz ve aileler size ulaşabilir.
      </p>
      <p style="margin:0 0 20px;line-height:1.6">Aday kodunuz: <strong>${escapeHtml(input.candidateCode)}</strong></p>
      <a href="https://munzurdestek.com/panel" style="display:inline-block;background:#57B614;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Panelime git</a>
      <p style="margin:20px 0 0;line-height:1.6;color:#6B7280;font-size:13px">
        Profil bilgilerinizi panelinizden güncel tutmanız, ailelerin sizi bulmasını kolaylaştırır.
      </p>
    </div>
  </div>
</body></html>`;
  const text = `Merhaba ${input.fullName},\n\nBaşvurunuz onaylandı ve profiliniz yayında. Aday kodunuz: ${input.candidateCode}\n\nMunzurDestek`;
  return { subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function candidateRegisteredAdminEmail(input: {
  fullName: string;
  candidateCode: string;
  email: string;
  phone: string;
  city: string;
  district?: string | null;
  neighborhood?: string | null;
  yearsOfExperience?: number | null;
  services: string[];
  workingTypes: string[];
  about?: string | null;
  photoCid?: string | null;
}) {
  const subject = `Aday Kaydı alındı - ${input.fullName}`;
  const rows: Array<[string, string]> = [
    ["Aday Kodu", input.candidateCode],
    ["Ad Soyad", input.fullName],
    ["E-posta", input.email],
    ["Telefon", input.phone],
    ["İl / İlçe / Mahalle", [input.city, input.district, input.neighborhood].filter(Boolean).join(" / ")],
    ["Deneyim", `${input.yearsOfExperience ?? 0} yıl`],
    ["Hizmetler", input.services.join(", ") || "-"],
    ["Çalışma Şekli", input.workingTypes.join(", ") || "-"],
    ["Hakkında", input.about || "-"],
  ];
  const photoBlock = input.photoCid
    ? `<div style="margin:0 0 16px"><img src="cid:${escapeHtml(input.photoCid)}" alt="Aday fotoğrafı" width="160" style="width:160px;height:auto;border-radius:12px;border:1px solid #E5E7EB;display:block" /></div>`
    : "";
  const html = `<!doctype html>
<html lang="tr"><body style="margin:0;background:#FAFAF7;font-family:Arial,Helvetica,sans-serif;color:#1F2933">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <div style="font-size:22px;font-weight:700"><span style="color:#57B614">Munzur</span><span style="color:#1F2933">Destek</span></div>
    <div style="margin-top:20px;background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
      <h1 style="margin:0 0 12px;font-size:20px">Yeni Aday Kaydı Alındı</h1>
      ${photoBlock}
      <p style="margin:0 0 16px;line-height:1.6"><strong>${escapeHtml(input.fullName)}</strong> adlı aday başvuru formunu doldurdu. Panelden inceleyip onaylayabilirsiniz.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:8px 0;color:#6B7280;width:150px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #F1F1EE">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
      <a href="https://munzurdestek.com/admin" style="display:inline-block;margin-top:20px;background:#57B614;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Admin panele git</a>
    </div>
  </div>
</body></html>`;
  const text = rows.map(([l, v]) => `${l}: ${v}`).join("\n");
  return { subject, html, text };
}

export function getAdminNotifyAddress() {
  return (
    process.env["ADMIN_NOTIFY_EMAIL"] ??
    process.env["GMAIL_USER"] ??
    "munzurdestek@gmail.com"
  );
}
