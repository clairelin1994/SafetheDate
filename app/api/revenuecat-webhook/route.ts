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

    // 3. Look up the user. The iOS app calls Purchases.logIn(userId) with the
    //    numeric user.id from our database, so app_user_id should be a string
    //    representation of users.id.
    const userIdNum = parseInt(event.app_user_id, 10)
    if (isNaN(userIdNum)) {
      console.warn('[RC webhook] app_user_id is not numeric, skipping:', event.app_user_id)
      // Return 200 so RevenueCat doesn't retry forever for unknown users
      return NextResponse.json({ ok: true, skipped: 'non-numeric user id' })
    }

    const userCheck = await pool.query<{ id: number }>(
      'SELECT id FROM users WHERE id = $1',
      [userIdNum],
    )
    if (userCheck.rows.length === 0) {
      console.warn('[RC webhook] user not found in db, skipping:', userIdNum)
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
        // User has access. If we know an expiration date, only mark premium
        // when it's still in the future (defensive check for late-arriving events).
        isPremium = expiresAt ? expiresAt > now : true
        break

      case 'CANCELLATION':
        // CANCELLATION fires when a user turns off auto-renew, but they still
        // have access until expiration_at_ms. Keep them premium until then.
        isPremium = expiresAt ? expiresAt > now : false
        break

      case 'EXPIRATION':
      case 'BILLING_ISSUE':
      case 'SUBSCRIPTION_PAUSED':
        isPremium = false
        break

      case 'TRANSFER':
      case 'SUBSCRIBER_ALIAS':
        // These are identity-management events, not subscription changes.
        // Don't touch is_premium.
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
      [isPremium, expiresAt, userIdNum],
    )

    console.log('[RC webhook] updated user', userIdNum, '→ is_premium:', isPremium, 'expires:', expiresAt)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const e = err as Error
    console.error('[RC webhook] error:', e.message, e.stack)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}