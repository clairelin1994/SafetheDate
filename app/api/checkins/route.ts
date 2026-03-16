import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { checkinSchema } from '@/utils/validation'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = checkinSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      )
    }

    const { location, withWhom, activityDescription, deadline, emergencyContacts } = parsed.data

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

      await client.query('COMMIT')
      return NextResponse.json({ sessionId }, { status: 201 })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('[POST /api/checkins]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
