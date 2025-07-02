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
    if (!["admin", "customer", "staff"].includes(role)) {
      return NextResponse.json({ error: "無効なユーザー種別です。" }, { status: 400 });
    }

    // 2) staff 制限
    if (role === "staff" && email !== "marumon77@gmail.com") {
      return NextResponse.json({ error: "staff 権限で登録できるのは運営者のみです。" }, { status: 403 });
    }

    // 3) 処理分岐
    if (role === "customer") {
      const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: { data: { role } }
      });

      if (error) {
        console.error("[register] signUp error (customer):", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ message: "確認メールを送信しました。" }, { status: 200 });
    }

    // 4) admin/staff 用 createUser 処理
    const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
      email_confirm: true,
    });

    const user = createUserData?.user;

    if (createUserError) {
      console.error(`[register] create user error (${role}):`, createUserError);
      return NextResponse.json({ error: createUserError.message }, { status: 400 });
    }

    if (!user || !user.id) {
      console.error("[register] userId が取得できませんでした:", user);
      return NextResponse.json({ error: "ユーザー登録に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ message: "登録に成功しました", userId: user.id }, { status: 201 });

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
