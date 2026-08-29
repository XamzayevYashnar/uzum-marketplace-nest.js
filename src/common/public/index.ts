export function getEmailHtml(code: number){
    return `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2>Tasdiqlash kodi</h2>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;
                      background:#f4f4f5;padding:16px;text-align:center;border-radius:8px;margin:24px 0;">
            ${code}
          </div>
          <p style="color:#888;font-size:13px;">Kod 5 daqiqa amal qiladi.</p>
</div>
`
}