// utils/supabase/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("[supabaseAdmin] URL:", SUPABASE_URL);
console.log("[supabaseAdmin] SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    `[supabaseAdmin] 環境変数未設定: ` +
    `SUPABASE_URL=${Boolean(SUPABASE_URL)}, ` +
    `SUPABASE_SERVICE_ROLE_KEY=${Boolean(SUPABASE_SERVICE_ROLE_KEY)}`
  );
}

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
