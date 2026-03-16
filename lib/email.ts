import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Update this to your verified sending domain in Resend
const FROM_ADDRESS = 'Safe the Date! <alerts@safeofthedate.com>'

interface AlertEmailParams {
  to: string
  userEmail: string
  location?: string | null
  withWhom?: string | null
  activityDescription?: string | null
  deadline: Date
}

export async function sendAlertEmail(params: AlertEmailParams): Promise<void> {
  const { to, userEmail, location, withWhom, activityDescription, deadline } = params

  const detailRows = [
    location ? `<tr><td style="padding:4px 0;color:#555;"><strong>Location:</strong></td><td style="padding:4px 8px;">${escapeHtml(location)}</td></tr>` : '',
    withWhom ? `<tr><td style="padding:4px 0;color:#555;"><strong>With:</strong></td><td style="padding:4px 8px;">${escapeHtml(withWhom)}</td></tr>` : '',
    activityDescription ? `<tr><td style="padding:4px 0;color:#555;"><strong>Activity:</strong></td><td style="padding:4px 8px;">${escapeHtml(activityDescription)}</td></tr>` : '',
    `<tr><td style="padding:4px 0;color:#555;"><strong>Expected return:</strong></td><td style="padding:4px 8px;">${deadline.toLocaleString()}</td></tr>`,
  ].join('')

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: '⚠️ Safety Check Alert — Please check on your contact',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#fff5f7;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f472b6,#fb7185);padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Safe the Date!</h1>
              <p style="margin:4px 0 0;color:#ffe4ec;font-size:14px;">Safety Check Alert</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;">
                Your contact <strong>${escapeHtml(userEmail)}</strong> has not confirmed returning safely.
              </p>
              <div style="background:#fff0f5;border-left:4px solid #f472b6;border-radius:4px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 12px;font-weight:700;color:#111827;">Activity Details</p>
                <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
                  ${detailRows}
                </table>
              </div>
              <p style="color:#374151;font-size:15px;">
                Please try contacting them directly. If you cannot reach them and are concerned for their safety, contact emergency services.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fdf2f8;padding:20px 32px;border-top:1px solid #fce7f3;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                ⚠️ <strong>This is NOT an emergency service.</strong> Safe the Date! is a personal reminder and notification tool only. In case of immediate danger, call 911 or your local emergency number.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
