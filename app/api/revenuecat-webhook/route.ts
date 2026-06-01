import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const maxDuration = 30

// RevenueCat sends events to this endpoint when subscriptions change.
// Docs: https://www.revenuecat.com/docs/integrations/webhooks
//
// Security: RevenueCat lets you set a custom Authorization header value in
// the dashboard. We compare it against REVENUECAT_WEBHOOK_SECRET (set in
// Vercel env vars) so only RevenueCat can call this endpoint.

type RCEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'PRODUCT_CHANGE'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'SUBSCRIBER_ALIAS'
  | 'SUBSCRIPTION_PAUSED'
  | 'TRANSFER'
  | 'TEST'

interface RCWebhookEvent {
  event: {
    type: RCEventType
    app_user_id: string
    original_app_user_id?: string
    expiration_at_ms?: number | null
    purchased_at_ms?: number
    environment?: 'SANDBOX' | 'PRODUCTION'
  }
  api_version?: string
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the request is actually from RevenueCat
    const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET
    if (!expectedSecret) {
      console.error('[RC webhook] REVENUECAT_WEBHOOK_SECRET env var is not set')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const authHeader = req.headers.get('authorization') ?? ''
    if (authHeader !== `Bearer ${expectedSecret}`) {
      console.warn('[RC webhook] Unauthorized request, header was:', authHeader.slice(0, 20))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse the event
    const body = (await req.json()) as RCWebhookEvent
    const event = body?.event
   if (!event || !event.type) {
      console.error('[RC webhook] Malformed event body:', JSON.stringify(body).slice(0, 500))
      return NextResponse.json({ error: 'Malformed event' }, { status: 400 })
    }

    console.log('[RC webhook] received event:', {
      type: event.type,
      app_user_id: event.app_user_id,
      expiration_at_ms: event.expiration_at_ms,
      environment: event.environment,
    })
   // 2.5 Build event ID for idempotency (but don't insert yet)
    const eventId = `${event.type}-${event.app_user_id}-${event.expiration_at_ms ?? event.purchased_at_ms}`
    const existing = await pool.query(
      'SELECT id FROM webhook_events WHERE id = $1',
      [eventId]
    )
    if (existing.rows.length > 0) {
      console.log('[RC webhook] duplicate event, skipping:', eventId)
      return NextResponse.json({ ok: true, duplicate: true })
    }

    // 3. Look up user by apple_sub first, then fall back to numeric ID
    let userId: number | null = null

    const byAppleSub = await pool.query<{ id: number }>(
      'SELECT id FROM users WHERE apple_sub = $1',
      [event.app_user_id],
    )
    if (byAppleSub.rows.length > 0) {
      userId = byAppleSub.rows[0].id
      console.log('[RC webhook] matched user by apple_sub:', userId)
    } else {
      const userIdNum = parseInt(event.app_user_id, 10)
      if (!isNaN(userIdNum)) {
        const byId = await pool.query<{ id: number }>(
          'SELECT id FROM users WHERE id = $1',
          [userIdNum],
        )
        if (byId.rows.length > 0) {
          userId = byId.rows[0].id
          console.log('[RC webhook] matched user by legacy numeric ID:', userId)
        }
      }
    }

    if (!userId) {
      console.warn('[RC webhook] user not found for app_user_id:', event.app_user_id)
      return NextResponse.json({ ok: true, skipped: 'user not found' })
    }

    // 4. Decide what is_premium and premium_expires_at should become
    const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null
    const now = new Date()

    let isPremium: boolean
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
      case 'UNCANCELLATION':
      case 'NON_RENEWING_PURCHASE':
        isPremium = expiresAt ? expiresAt > now : true
        break

      case 'CANCELLATION':
        isPremium = expiresAt ? expiresAt > now : false
        break

      case 'EXPIRATION':
      case 'BILLING_ISSUE':
      case 'SUBSCRIPTION_PAUSED':
        isPremium = false
        break

      case 'TRANSFER':
      case 'SUBSCRIBER_ALIAS':
        return NextResponse.json({ ok: true, ignored: event.type })

      case 'TEST':
        console.log('[RC webhook] test event received, no db change')
        return NextResponse.json({ ok: true, test: true })

      default:
        console.warn('[RC webhook] unhandled event type:', event.type)
        return NextResponse.json({ ok: true, ignored: event.type })
    }

    // 5. Update the database
    await pool.query(
      'UPDATE users SET is_premium = $1, premium_expires_at = $2 WHERE id = $3',
      [isPremium, expiresAt, userId],
    )
    console.log('[RC webhook] updated user', userId, '→ is_premium:', isPremium, 'expires:', expiresAt)

    // 6. Only mark event as processed after successful update
    await pool.query(
      'INSERT INTO webhook_events (id, event_type) VALUES ($1, $2)',
      [eventId, event.type]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    const e = err as Error
    console.error('[RC webhook] error:', e.message, e.stack)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}