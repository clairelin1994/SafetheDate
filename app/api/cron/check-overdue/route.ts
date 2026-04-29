export const maxDuration = 60
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { sendAlertEmail } from '@/lib/email'

interface OverdueRow {
  session_id: number
  user_name: string | null
  user_email: string
  location: string | null
  with_whom: string | null
  activity_description: string | null
  deadline: Date
  contact_email: string
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron] check-overdue started')

  try {
    // Fetch all overdue active sessions where alert has not been sent yet
    // 60-min lookback window to catch any sessions missed by previous cron runs
    const result = await pool.query<OverdueRow>(`
      SELECT
        s.id           AS session_id,
        u.name         AS user_name,
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
        AND s.deadline > NOW() - INTERVAL '60 minutes'
        AND s.alert_email_sent = false
    `)

    console.log(`[cron] overdue records found: ${result.rows.length}`)

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

    // Mark alert_email_sent = true immediately to prevent duplicate sends
    // on concurrent cron invocations (idempotency guard)
    await pool.query(
      `UPDATE sessions
       SET status = 'alert_sent',
           alert_email_sent = true,
           alert_email_sent_at = NOW(),
           alert_send_status = 'pending'
       WHERE id = ANY($1::int[])
         AND status = 'active'
         AND alert_email_sent = false`,
      [sessionIds],
    )

    // Send emails
    const emailPromises: Promise<void>[] = []
    for (const session of sessionMap.values()) {
      for (const contactEmail of session.contactEmails) {
        emailPromises.push(
          sendAlertEmail({
            to: contactEmail,
            userName: session.user_name,
            userEmail: session.user_email,
            location: session.location,
            withWhom: session.with_whom,
            activityDescription: session.activity_description,
            deadline: new Date(session.deadline),
          })
            .then(() => {
              console.log(`[cron] email sent OK → ${contactEmail} (session ${session.session_id})`)
            })
            .catch(async (err) => {
              console.error(`[cron] email FAILED → ${contactEmail} (session ${session.session_id}):`, err)
              // Update status to failed for this session
              await pool.query(
                `UPDATE sessions
                 SET alert_send_status = 'failed',
                     alert_send_error = $1
                 WHERE id = $2`,
                [String(err), session.session_id],
              ).catch((dbErr) => console.error('[cron] DB update error after email failure:', dbErr))
            }),
        )
      }
    }

    await Promise.all(emailPromises)

    // Mark successful sessions
    await pool.query(
      `UPDATE sessions
       SET alert_send_status = 'success'
       WHERE id = ANY($1::int[])
         AND alert_send_status = 'pending'`,
      [sessionIds],
    )

    console.log(`[cron] DB updated — ${sessionIds.length} session(s) marked alert_sent`)

    // Cleanup expired sessions older than 30 days
    const cleanupResult = await pool.query(`
      WITH expired_sessions AS (
        SELECT id FROM sessions
        WHERE status IN ('completed', 'alert_sent')
          AND deadline < NOW() - INTERVAL '30 days'
      )
      DELETE FROM contacts
      WHERE session_id IN (SELECT id FROM expired_sessions)
    `)
    const deletedContacts = cleanupResult.rowCount ?? 0

    const sessionCleanupResult = await pool.query(`
      DELETE FROM sessions
      WHERE status IN ('completed', 'alert_sent')
        AND deadline < NOW() - INTERVAL '30 days'
    `)
    const deletedSessions = sessionCleanupResult.rowCount ?? 0

    console.log(`[cron] cleanup done — deleted ${deletedSessions} session(s), ${deletedContacts} contact(s)`)

    return NextResponse.json({ processed: sessionIds.length, deletedSessions, deletedContacts })
  } catch (err) {
    console.error('[cron] check-overdue error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}