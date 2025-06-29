// app/redirect/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";

export default function Redirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/Login");
        return;
      }

      // profile はトリガーで必ず存在する想定
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      const role = profile?.role ?? "customer"; // 念のため fallback

      router.replace(
        role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
      );
    })();
  }, [router]);

  return <p className="text-center mt-20">リダイレクト中…</p>;
}
