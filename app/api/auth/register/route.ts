// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
export async function POST(req: Request) {
  const { email, password, role } = await req.json();

  // 1) バリデーション
  if (!/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json(
      { error: "有効なメールアドレスを入力してください。" },
      { status: 400 }
    );
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上で入力してください。" },
      { status: 400 }
    );
  }
  if (!["admin", "customer"].includes(role)) {
    return NextResponse.json(
      { error: "無効なユーザー種別です。" },
      { status: 400 }
    );
  }

  // 2) サインアップ
  const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  });
  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  // 3) users テーブルにも profile レコードを作る
  const userId = data.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました。" },
      { status: 500 }
    );
  }
  const { error: profileError } = await supabaseAdmin
    .from("users")
    .insert({ id: userId, role })
    .single();
  if (profileError) {
    return NextResponse.json(
      { error: "プロファイル作成に失敗しました。" },
      { status: 500 }
    );
  }

  // 4) 成功レスポンス
  return NextResponse.json({ error: null }, { status: 201 });
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
