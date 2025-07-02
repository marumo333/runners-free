"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";

type ReviewStatus = "pending" | "approved" | "rejected";

export default function Status() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザーとステータス取得
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: uData, error: uErr } = await supabase.auth.getUser();
      if (uErr || !uData.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser({ id: uData.user.id, email: uData.user.email! });

      try {
        const res = await fetch("/api/review/status");
        if (!res.ok) throw new Error("ステータス取得失敗");
        const data = await res.json();
        setStatus(data.status); // status: "pending" | "approved" | "rejected"
      } catch (err) {
        console.error(err);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ローディング状態
  if (loading) return <p className="text-center py-10">読み込み中...</p>;

  // ログインしていない場合
  if (!user) return <p className="text-center py-10 text-red-500">ログインが必要です</p>;

  // ステータス表示UI
  const renderStatus = () => {
    switch (status) {
      case "pending":
        return <p className="text-yellow-600 font-medium">審査中です</p>;
      case "approved":
        return <p className="text-green-600 font-bold">承認されました！</p>;
      case "rejected":
        return <p className="text-red-600 font-bold">却下されました</p>;
      default:
        return <p className="text-gray-500">申請情報が見つかりません</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-indigo-600">審査ステータス確認</h1>
        <div className="text-lg">{renderStatus()}</div>
      </div>
    </div>
  );
}

