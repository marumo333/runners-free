"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { supabase } from "@/utils/supabase/supabaseClient";

type Row = {
  id: string;
  user_id: string;
  portfolio_url: string;
  id_image_path: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string | null;
};

/* 1. データ取得用 fetcher ― key を受け取る形に統一 */
const fetcher = async (_key: string): Promise<Row[]> => {
  const { data, error } = await supabase
    .from("review_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Row[];
};

export default function ReviewManagerPage() {
  const router = useRouter();

  /* 2. スタッフ判定（JWT の isStaff 参照）*/
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      console.log("isStaff JWT:", data.session?.user?.user_metadata?.isStaff);
      const isStaff = data.session?.user?.user_metadata?.isStaff;
      if (!isStaff) {
        router.replace("/");          // staff 以外リダイレクト
        return;
      }
      setSessionChecked(true);        // OK なら表示許可
    })();
  }, [router]);

  if (!sessionChecked) return null;    // 判定完了まで何も描画しない

  /*  3. SWR で一覧取得 */
  const { data, error, mutate } = useSWR<Row[]>("/review-manager", fetcher);

  /* 4. Realtime 購読*/
  useEffect(() => {
    const channel = supabase
      .channel("reviews")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "review_applications" },
        () => mutate()
      )
      .subscribe();

    return () => void supabase.removeChannel(channel);
  }, [mutate]);

  /* 5. ステータス更新*/
  const updateStatus = async (row: Row, status: Row["status"]) => {
    const { error } = await supabase
      .from("review_applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) return alert(error.message);
    mutate();                          // 即リフレッシュ
  };

  /*  6. UI*/
  if (error) return <p className="text-red-600">読み込み失敗: {error.message}</p>;
  if (!data)  return <p>読み込み中…</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">審査申請一覧（スタッフ）</h1>
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">申請日時</th>
            <th className="p-2 text-left">ユーザ</th>
            <th className="p-2 text-left">ポートフォリオ</th>
            <th className="p-2 text-left">画像</th>
            <th className="p-2 text-left">ステータス</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-2 whitespace-nowrap">
                {row.submitted_at
                  ? new Date(row.submitted_at).toLocaleString()
                  : "-"}
              </td>
              <td className="p-2">{row.user_id}</td>
              <td className="p-2 underline text-blue-600">
                <a href={row.portfolio_url} target="_blank" rel="noopener noreferrer">
                  Link
                </a>
              </td>
              <td className="p-2 underline text-blue-600">
                <a
                  href={
                    supabase.storage
                      .from("id-verifications")
                      .getPublicUrl(row.id_image_path).data.publicUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Image
                </a>
              </td>
              <td className="p-2 font-semibold">
                {row.status === "pending" && "審査中"}
                {row.status === "approved" && (
                  <span className="text-green-600">承認</span>
                )}
                {row.status === "rejected" && (
                  <span className="text-red-600">却下</span>
                )}
              </td>
              <td className="p-2 space-x-3">
                {row.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(row, "approved")}
                      className="px-3 py-1 rounded bg-green-600 text-white"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => updateStatus(row, "rejected")}
                      className="px-3 py-1 rounded bg-red-600 text-white"
                    >
                      却下
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
