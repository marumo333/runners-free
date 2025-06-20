// app/redirect/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabase";

export default function Redirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (error || !profile) {
        router.replace("/login");
        return;
      }

      if (profile.role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/customer");
      }
    })();
  }, [router]);

  return <p className="text-center mt-20">リダイレクト中…</p>;
}