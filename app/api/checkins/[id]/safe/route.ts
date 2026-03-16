import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = parseInt(params.id, 10)
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 })
    }

    // Verify the session belongs to the authenticated user and is still active
    const result = await pool.query(
      `UPDATE sessions
       SET status = 'completed'
       WHERE id = $1 AND user_id = $2 AND status = 'active'
       RETURNING id`,
      [sessionId, user.userId],
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Session not found or already closed.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/checkins/[id]/safe]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
