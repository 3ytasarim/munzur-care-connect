/**
 * Server-only e-posta gönderimi (Resend HTTP API).
 * RESEND_API_KEY tanımlı değilse gönderim sessizce atlanır; uygulama akışı bozulmaz.
 */

type SendResult = { sent: boolean; reason?: string };

export async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY yok, e-posta gönderilmedi:", input.subject);
    return { sent: false, reason: "missing_api_key" };
  }
  const from = process.env["MAIL_FROM"] ?? "MunzurDestek <bildirim@munzurdestek.com>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("[email] gönderim hatası", response.status, body);
      return { sent: false, reason: `http_${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] gönderim istisnası", error);
    return { sent: false, reason: "network_error" };
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
