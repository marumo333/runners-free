// app/api/review/apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient"; // サーバー側クライアント

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const portfolioUrl = formData.get("portfolioUrl")?.toString().trim() ?? "";

  // ─── バリデーション ───
  if (!file || !["image/png", "image/jpeg"].includes(file.type)) {
    return NextResponse.json(
      { error: "PNG または JPEG の画像を選択してください" },
      { status: 400 }
    );
  }

  try {
    new URL(portfolioUrl);
  } catch {
    return NextResponse.json(
      { error: "ポートフォリオ URL が不正です" },
      { status: 400 }
    );
  }

  // ─── ファイルを Supabase Storage に保存 ───
  const user = (await supabase.auth.getUser()).data.user;
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fileExt = file.type === "image/png" ? "png" : "jpg";
  const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
  const { error: uploadErr } = await supabase.storage
    .from("id-verifications")
    .upload(filePath, file, { upsert: false });

  if (uploadErr)
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  // ─── DB へ INSERT ───
  const { error: insertErr } = await supabase
    .from("review_applications")
    .insert({
      user_id: user.id,
      portfolio_url: portfolioUrl,
      id_image_path: filePath,
    });

  if (insertErr)
    return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
