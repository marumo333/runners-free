import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Stripeセッション情報を取得
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    //supabaseに購入履歴を保存
    const supabase = createRouteHandlerClient({ cookies });

    //既に保存されているかチェック
    const { data: existingOrder } = await supabase
      .from("purchase")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!existingOrder) {
      //購入履歴を保存
      const orderData = {
        session_id: sessionId,
        user_id: session.metadata?.user_id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || "jpy",
        payment_status: session.payment_status,
        items: session.metadata?.items
          ? JSON.parse(session.metadata.items)
          : [],
        stripe_payment_intent_id: session.payment_intent,
        customer_email: session.customer_details?.email,
      };

      const { error: insertError } = await supabase
        .from("Purchase")
        .insert(orderData);

      if (insertError) {
        console.error("購入履歴の保存エラー:", insertError);
      }
    }
    // 注文詳細を返却
    return NextResponse.json({
      id: session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      payment_status: session.payment_status,
      created_at: new Date(session.created * 1000).toISOString(),
      customer_email: session.customer_details?.email,
      line_items: session.line_items?.data,
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order details" },
      { status: 500 }
    );
  }
}
