// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    // 1) バリデーション
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上で入力してください。" }, { status: 400 });
    }
    if (!["admin", "customer"].includes(role)) {
      return NextResponse.json({ error: "無効なユーザー種別です。" }, { status: 400 });
    }

    // 2) サインアップ or ユーザー作成を振り分け
    let user: any;
    let createError: any;

    if (role === "customer") {
      // customer は signUp を使う（確認メール送信フローなど）
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: { data: { role } },
      });
      user = signUpData?.user;
      createError = signUpError;
    } else {
      // admin は管理者キーで直接作成
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { role },
        email_confirm: true,   // 必要なら true に
      });
      // adminData の型は User オブジェクトそのものなので user にセット
      user = adminData;
      createError = adminError;
    }

    if (createError) {
      console.error(`[register] create user error (${role}):`, createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 3) users テーブルに profile を作成
    const userId = user?.id;
    if (!userId) {
      console.error("[register] userId が取得できませんでした:", user);
      return NextResponse.json({ error: "ユーザー登録に失敗しました。" }, { status: 500 });
    }
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .insert({ id: userId, role })
      .maybeSingle();
    if (profileError) {
      console.error("[register] profile insert error:", profileError);
      return NextResponse.json({ error: "プロファイル作成に失敗しました。" }, { status: 500 });
    }

    // 4) 成功レスポンス
    return NextResponse.json({ error: null }, { status: 201 });
  } catch (err: any) {
    console.error("[register] Unexpected Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
