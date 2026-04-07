import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Update this to your verified sending domain in Resend
const FROM_ADDRESS = 'Safe the Date <noreply@safethedate.net>'

interface AlertEmailParams {
  to: string
  userName?: string | null
  userEmail: string
  location?: string | null
  withWhom?: string | null
  activityDescription?: string | null
  deadline: Date
}

export async function sendAlertEmail(params: AlertEmailParams): Promise<void> {
  const { to, userName, userEmail, location, withWhom, activityDescription, deadline } = params

  const displayName = userName || userEmail
  const nameWithEmail = userName ? `${escapeHtml(userName)} (${escapeHtml(userEmail)})` : escapeHtml(userEmail)

  const detailRows = [
    location ? `<tr><td style="padding:4px 0;color:#555;"><strong>Location:</strong></td><td style="padding:4px 8px;">${escapeHtml(location)}</td></tr>` : '',
    withWhom ? `<tr><td style="padding:4px 0;color:#555;"><strong>With:</strong></td><td style="padding:4px 8px;">${escapeHtml(withWhom)}</td></tr>` : '',
    activityDescription ? `<tr><td style="padding:4px 0;color:#555;"><strong>Activity:</strong></td><td style="padding:4px 8px;">${escapeHtml(activityDescription)}</td></tr>` : '',
    `<tr><td style="padding:4px 0;color:#555;"><strong>Expected return:</strong></td><td style="padding:4px 8px;">${deadline.toLocaleString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} (UTC)</td></tr>`,
  ].join('')

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `💕 Safety Check — Please check on ${escapeHtml(displayName)}`,
    headers: {
      'Precedence': 'bulk',
      'X-Mailer': 'Safe the Date',
      'Reply-To': userEmail,
    },
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Safety Check Alert</title>
</head>
<body style="margin:0;padding:0;background:#fff0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(255,107,157,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:#ffffff;padding:24px 40px;border-bottom:1px solid #fce7f3;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:24px;line-height:1;padding-right:10px;">🌸</td>
                        <td style="font-size:20px;font-weight:700;color:#1f2937;letter-spacing:-0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Safe the Date</td>
                      </tr>
                    </table>
                    <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#FF6B9D;letter-spacing:0.5px;text-transform:uppercase;">Safety Check Alert</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Opening -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0;color:#FF6B9D;font-size:20px;font-weight:700;">Someone you care about may need help 💕</p>
              <p style="margin:12px 0 0;color:#555;font-size:16px;line-height:1.6;">
                <strong style="color:#1f2937;">${nameWithEmail}</strong> set up a safety check-in and has not confirmed they returned safely by their deadline.
              </p>
            </td>
          </tr>

          <!-- Activity Details -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #FF6B9D;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#FF6B9D,#ff8fab);padding:14px 20px;">
                    <p style="margin:0;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.5px;">🗓 ACTIVITY DETAILS</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;background:#fff7fa;">
                    <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;width:100%;">
                      ${detailRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 40px 36px;">
              <div style="background:#fff0f5;border-radius:10px;padding:20px 24px;border-left:4px solid #FF6B9D;">
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
                  💌 <strong>Please try reaching out to them directly.</strong> If you're unable to contact them and are concerned for their safety, don't hesitate to contact emergency services.
                </p>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#ffc2d4,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 10px;color:#aaa;font-size:12px;line-height:1.7;">
                ⚠️ <strong style="color:#888;">This is NOT an emergency service.</strong> Safe the Date is a personal reminder and notification tool only. In case of immediate danger, call 911 or your local emergency number.
              </p>
              <p style="margin:0;color:#ccc;font-size:11px;line-height:1.6;">
                You received this because someone listed you as an emergency contact.
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
  if (error) throw new Error(`Resend error (alert): ${error.message}`)
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${code} — Your Safe the Date login code`,
    headers: {
      'Precedence': 'transactional',
      'X-Mailer': 'Safe the Date',
    },
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Your Safe the Date login code</title>
</head>
<body style="margin:0;padding:0;background:#fff0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(255,107,157,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:#ffffff;padding:24px 40px;border-bottom:1px solid #fce7f3;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:24px;line-height:1;padding-right:10px;">🌸</td>
                        <td style="font-size:20px;font-weight:700;color:#1f2937;letter-spacing:-0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Safe the Date</td>
                      </tr>
                    </table>
                    <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#FF6B9D;letter-spacing:0.5px;text-transform:uppercase;">Your Login Code</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0;color:#1f2937;font-size:18px;font-weight:700;">Here's your sign-in code 🔐</p>
              <p style="margin:12px 0 0;color:#555;font-size:16px;line-height:1.6;">
                Use the code below to sign in. It expires in <strong style="color:#1f2937;">10 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Code box -->
          <tr>
            <td style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #FF6B9D;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#FF6B9D,#ff8fab);padding:14px 20px;">
                    <p style="margin:0;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.5px;">🔑 YOUR ONE-TIME CODE</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 20px;background:#fff7fa;text-align:center;">
                    <span style="display:inline-block;background:#ffffff;border:2px solid #FF6B9D;border-radius:12px;padding:18px 36px;font-size:42px;font-weight:800;letter-spacing:12px;color:#FF6B9D;font-family:'Courier New',monospace;">${code}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 40px 36px;">
              <div style="background:#fff0f5;border-radius:10px;padding:16px 20px;border-left:4px solid #FF6B9D;">
                <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                  If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
                </p>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#ffc2d4,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 10px;color:#aaa;font-size:12px;line-height:1.7;">
                🔒 <strong style="color:#888;">This code is valid for 10 minutes and can only be used once.</strong> Never share this code with anyone.
              </p>
              <p style="margin:0;color:#ccc;font-size:11px;line-height:1.6;">
                You received this because an account sign-in was requested for this email address on Safe the Date.
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
  if (error) throw new Error(`Resend error (OTP): ${error.message}`)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
