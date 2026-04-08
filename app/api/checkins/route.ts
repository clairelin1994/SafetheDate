import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { checkinSchema } from '@/utils/validation'

export const maxDuration = 30

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const result = await pool.query<{
      id: number
      location: string | null
      deadline: string
      status: string
    }>(
      `SELECT id, location, deadline, status
       FROM sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [user.userId],
    )
    const checkins = result.rows.map((row) => ({
      id: String(row.id),
      location: row.location ?? '',
      deadline: row.deadline,
      status: row.status === 'completed' ? 'safe' : row.status,
    }))
    return NextResponse.json(checkins)
  } catch (err) {
    console.error('[GET /api/checkins]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('[checkins POST] body received:', JSON.stringify(body))
    const parsed = checkinSchema.safeParse(body)
    if (!parsed.success) {
      console.log('[checkins POST] validation failed:', JSON.stringify(parsed.error.errors))
    }

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      )
    }

    const { location, withWhom, activityDescription, deadline, emergencyContacts } = parsed.data

    // Enforce 7-day free usage limit (premium users bypass this)
    const limitCheck = await pool.query<{
      is_premium: boolean
      premium_expires_at: string | null
      last_checkin_at: string | null
    }>(
      'SELECT is_premium, premium_expires_at, last_checkin_at FROM users WHERE id = $1',
      [user.userId],
    )
    const userRow = limitCheck.rows[0]
    const now = new Date()
    const isPremiumActive =
      userRow?.is_premium === true &&
      (!userRow.premium_expires_at || new Date(userRow.premium_expires_at) > now)

    if (!isPremiumActive) {
      const lastCheckinAt = userRow?.last_checkin_at
      if (lastCheckinAt) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        if (new Date(lastCheckinAt) > sevenDaysAgo) {
          return NextResponse.json(
            { error: 'FREE_LIMIT_REACHED', message: "You've used your free check-in this week. Upgrade to Premium for unlimited check-ins! 🌸" },
            { status: 429 },
          )
        }
      }
    }

    // Cancel any existing active sessions for this user before creating a new one
    await pool.query(
      `UPDATE sessions SET status = 'completed' WHERE user_id = $1 AND status = 'active'`,
      [user.userId],
    )

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const sessionResult = await client.query<{ id: number }>(
        `INSERT INTO sessions (user_id, location, with_whom, activity_description, deadline)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user.userId, location ?? null, withWhom ?? null, activityDescription ?? null, deadline],
      )

      const sessionId = sessionResult.rows[0].id

      for (const email of emergencyContacts) {
        await client.query(
          `INSERT INTO contacts (session_id, email) VALUES ($1, $2)`,
          [sessionId, email],
        )
      }

      await client.query(
        'UPDATE users SET last_checkin_at = NOW() WHERE id = $1',
        [user.userId],
      )

      await client.query('COMMIT')
      return NextResponse.json({ sessionId }, { status: 201 })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    const e = err as Error & { code?: string; detail?: string }
    console.error('[POST /api/checkins] error', {
      message: e.message,
      code: e.code,
      detail: e.detail,
      stack: e.stack,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
