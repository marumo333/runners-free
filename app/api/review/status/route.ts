// app/api/review/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

export async function GET() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("review_applications")
    .select("status, reviewed_at")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: data?.status ?? null });
}
