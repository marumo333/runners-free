//supabase/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// 環境変数に SUPABASE_SERVICE_ROLE_KEY を設定しておく
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * サーバー側処理用クライアント
 * RLS をバイパスして、どのテーブルにも読み書き可能
 * ※ 絶対にブラウザに公開しないこと
 */
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
