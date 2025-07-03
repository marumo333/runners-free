"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";

type ReviewStatus = "pending" | "approved" | "rejected";

export default function Status() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  // ファイル選択時のハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };
  

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
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !url) {
      setError("ポートフォリオURLと画像ファイルは必須です。");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 画像アップロード
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase
        .storage
        .from("id-verifications")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
      if (uploadErr || !uploadData) throw uploadErr || new Error("アップロード失敗");

      // DB挿入
      const { error: insertErr } = await supabase
        .from("review_applications")
        .insert([{ 
          portfolio_url: url,
          id_image_path: uploadData.path,
          status: "pending",
          submitted_at: new Date().toISOString(),
        }]);
      if (insertErr) throw insertErr;

      // 完了後
      console.log("申請が完了しました。")
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

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
        {status === null && (
          <>
            <form className="mb-4 text-center" onSubmit={onSubmit}>
              <div>
                <input
                  className="mb-4 block w-full border px-3 py-2"
                  type="url"
                  placeholder="ポートフォリオURL"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />
                <input
                  className="mb-4 block w-full border px-3 py-2 file:bg-neutral-100 hover:file:bg-neutral-200"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  autoComplete="個人事業主証明書"
                  required
                />
                <button
                  type="submit"
                  disabled={!file || !url}
                  className="bg-blue-700 text-white py-2 px-5 rounded disabled:opacity-50"
                >
                  送信
                </button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
              </div>
            </form>
          </>
        )}
        <div className="text-lg">{renderStatus()}</div>
      </div>
    </div>
  );
}


