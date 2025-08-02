import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Supabaseで認証確認
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, name, price, quantity = 1 } = await request.json();

    // 入力値検証
    if (!productId || !name || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, name, price' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'priceが0円以下です' },
        { status: 400 }
      );
    }

    // Stripe Checkout Sessionを作成
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: user.id, // ユーザーIDを設定
      customer_email: user.email || undefined, // ユーザーメール
      metadata: {
        productId: productId,
        userId: user.id,
        quantity: quantity.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: name,
              metadata: {
                productId: productId,
              },
            },
            unit_amount: Math.round(price), // 円単位
          },
          quantity: quantity,
        },
      ],
      payment_method_types: ['card'],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=true`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30分で期限切れ
    });

    console.log('stripeのseeeionが作成されました。', session.id);

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });

  } catch (error: any) {
    console.error('stripeのseeeionに失敗しました。', error);
    
    return NextResponse.json(
      { 
        error: 'stripeのseeeionに失敗しました',
        details: error.message 
      },
      { status: 500 }
    );
  }
}