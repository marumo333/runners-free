import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ message: "sessionIdがありません" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const userId = session.client_reference_id;
    const productId = session.metadata?.productId;

    if (!userId || !productId) {
      return NextResponse.json({ message: "Session情報にuserIdまたはproductIdがありません" }, { status: 400 });
    }

    // 購入レコード作成
    const purchase = await prisma.purchase.create({
      data: {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        productId,
      },
    });

    return NextResponse.json({ 
      message: "購入処理完了", 
      purchase 
    }, { status: 200 });

  } catch (err: any) {
    console.error("Error in checkout complete:", err);
    return NextResponse.json({ message: err.message || "サーバーエラー" }, { status: 500 });
  }
}
