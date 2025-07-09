// utils/supabase/supabaseClient.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/libs/database.types";

// globalThis にキャッシュして一度だけ生成
declare global {
  var __supabase_client: ReturnType<typeof createClientComponentClient<Database>> | undefined;
}

export const supabase =
  globalThis.__supabase_client ??
  (globalThis.__supabase_client = createClientComponentClient<Database>());

