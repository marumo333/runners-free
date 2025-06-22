import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password, role } = req.body;

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "有効なメールアドレスを入力してください。" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "パスワードは8文字以上で入力してください。" });
  }
  if (!["admin", "customer"].includes(role)) {
    return res.status(400).json({ error: "無効なユーザー種別です。" });
  }

  // サインアップ時に role を user_metadata にも保存
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  });
  if (signUpError) {
    return res.status(400).json({ error: signUpError.message });
  }

  const userId = data.user?.id;
  if (!userId) {
    return res.status(500).json({ error: "ユーザー登録に失敗しました。" });
  }

  const { error: profileError } = await supabase
    .from("users")
    .insert({ id: userId, role })
    .single();
  if (profileError) {
    return res.status(500).json({ error: "プロファイル作成に失敗しました。" });
  }

  return res.status(201).json({ error: null });
}
