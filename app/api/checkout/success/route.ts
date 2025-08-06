import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Stripeセッション情報を取得
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    })

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // 注文詳細を返却
    return NextResponse.json({
      id: session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      payment_status: session.payment_status,
      created_at: new Date(session.created * 1000).toISOString(),
      customer_email: session.customer_details?.email,
      line_items: session.line_items?.data
    })

  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve order details' },
      { status: 500 }
    )
  }
}