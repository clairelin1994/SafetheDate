import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { sendAlertEmail } from '@/lib/email'

interface OverdueRow {
  session_id: number
  user_email: string
  location: string | null
  with_whom: string | null
  activity_description: string | null
  deadline: Date
  contact_email: string
}

export async function GET(req: NextRequest) {
  // Verify the request comes from Vercel's cron runner (or an authorized caller)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all overdue active sessions along with their contacts in one query
    const result = await pool.query<OverdueRow>(`
      SELECT
        s.id           AS session_id,
        u.email        AS user_email,
        s.location,
        s.with_whom,
        s.activity_description,
        s.deadline,
        c.email        AS contact_email
      FROM sessions s
      JOIN users    u ON u.id = s.user_id
      JOIN contacts c ON c.session_id = s.id
      WHERE s.status = 'active'
        AND s.deadline < NOW()
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({ processed: 0 })
    }

    // Group contacts by session
    const sessionMap = new Map<number, OverdueRow & { contactEmails: string[] }>()
    for (const row of result.rows) {
      if (!sessionMap.has(row.session_id)) {
        sessionMap.set(row.session_id, { ...row, contactEmails: [] })
      }
      sessionMap.get(row.session_id)!.contactEmails.push(row.contact_email)
    }

    const sessionIds = [...sessionMap.keys()]

    // Mark sessions as alert_sent before sending emails to avoid duplicate sends
    // on concurrent cron invocations
    await pool.query(
      `UPDATE sessions SET status = 'alert_sent'
       WHERE id = ANY($1::int[]) AND status = 'active'`,
      [sessionIds],
    )

    // Send emails (fire and forget individual failures — log them but don't abort)
    const emailPromises: Promise<void>[] = []
    for (const session of sessionMap.values()) {
      for (const contactEmail of session.contactEmails) {
        emailPromises.push(
          sendAlertEmail({
            to: contactEmail,
            userEmail: session.user_email,
            location: session.location,
            withWhom: session.with_whom,
            activityDescription: session.activity_description,
            deadline: new Date(session.deadline),
          }).catch((err) => {
            console.error(
              `[cron] Failed to send alert email to ${contactEmail} for session ${session.session_id}:`,
              err,
            )
          }),
        )
      }
    }

    await Promise.all(emailPromises)

    console.log(`[cron] Processed ${sessionIds.length} overdue session(s)`)
    return NextResponse.json({ processed: sessionIds.length })
  } catch (err) {
    console.error('[cron] check-overdue error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
