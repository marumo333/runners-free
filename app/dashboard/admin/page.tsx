// app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";

type AvatarData = {
  id: string;
  user_id: string;
  username: string;
  icon_url: string;
  created_at: string;
  url: string;
};

export default function Admin() {
  const [user, setUser]       = useState<{ id: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<AvatarData | null>(null);

  // 初期化：ログインユーザーと既存プロフィール取得
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: uData, error: uErr } = await supabase.auth.getUser();
      if (uErr || !uData.user) {
        setLoading(false);
        return;
      }
      const u = uData.user;
      setUser({ id: u.id, email: u.email!, role: (u.user_metadata as any)?.role });

      const { data: avat, error: avatErr } = await supabase
        .from("avatars")
        .select("*")
        .eq("user_id", u.id)
        .maybeSingle();
      if (avat) {
        setProfile(avat);
        setUsername(avat.username);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-center py-10">ローディング中…</p>;
  if (!user)  return <p className="text-center py-10 text-red-500">ログインしてください。</p>;

  // ファイル選択ハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(e.target.files?.[0] ?? null);
  };

  // プロフィール更新
  const profSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let publicUrl = profile?.icon_url ?? "";

    if (avatarFile) {
      // ファイル名をサニタイズ（日本語や空白を除去）
      const safeName = avatarFile.name.replace(/[^\w\-.]/g, "_");
      const filePath = `${user.id}/${Date.now()}_${safeName}`;
      console.log("Uploading to avatars bucket at:", filePath);

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });
      if (upErr) {
        console.error("アップロード失敗:", upErr.message);
        alert(`アップロード失敗: ${upErr.message}`);
        return;
      }

      // パブリック URL 取得
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    // upsert（INSERT or UPDATE）
    const { error: dbErr } = await supabase
      .from("avatars")
      .upsert(
        { user_id: user.id, username, icon_url: publicUrl },
        { onConflict: "user_id" }
      );
    if (dbErr) {
      console.error("DB書き込み失敗:", dbErr.message);
      alert(`保存失敗: ${dbErr.message}`);
      return;
    }

    // 最新プロフィール再フェッチ
    const { data: newProf, error: newErr } = await supabase
      .from("avatars")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (newErr) {
      console.warn("再フェッチ失敗:", newErr.message);
    } else {
      setProfile(newProf);
    }

    alert("プロフィールを更新しました！");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          フリーランス管理画面
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          ログインユーザー：<span className="font-medium">{user.email}</span>（{user.role}）
        </p>

        <form onSubmit={profSubmit} className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your Name"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    アバター画像
  </label>

  {/* ドロップゾーン兼クリックボタン */}
  <label
    htmlFor="avatar"        
    className="flex flex-col items-center justify-center
               w-full h-32 rounded-lg cursor-pointer
               border-2 border-dashed border-gray-300
               hover:border-indigo-400 hover:bg-indigo-50
               focus-within:ring-2 focus-within:ring-indigo-400
               transition"
  >
    {avatarFile ? (
      <span className="text-sm text-indigo-600">{avatarFile.name}</span>
    ) : (
      <>
        {/* アイコン (Heroicons/Feather などお好みで) */}
        <svg className="w-8 h-8 mb-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 4v16m8-8H4"/>
        </svg>
        <span className="text-sm text-gray-600">
          クリックして選択 / ドロップ
        </span>
      </>
    )}
    {/* 実際の input は隠す */}
    <input
      id="avatar"
      type="file"
      accept="image/*"
      onChange={e => {
        setAvatarFile(e.target.files?.[0] ?? null);
        handleFileChange(e);          // ←既存の処理を呼び出し
      }}
      className="hidden"
    />
  </label>
</div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition"
          >
            プロフィールを更新
          </button>
        </form>

        {profile && (
          <div className="mt-10 bg-indigo-50 rounded-lg p-6 flex items-center space-x-6">
            <img
              src={profile.icon_url}
              alt="avatar"
              className="w-24 h-24 rounded-full border-2 border-indigo-300 object-cover"
            />
            <div>
              <p className="text-xl font-semibold text-indigo-700">
                {profile.username}
              </p>
              <p className="text-gray-500 text-sm">
                登録日：{new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
