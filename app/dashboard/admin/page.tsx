"use client";

import { supabase } from "@/utils/supabase/supabaseClient";
import React, { useEffect, useState } from "react";

type AvatarData = {
  id: string;
  user_id: string;
  username: string;
  icon_url: string;
  created_at: string;
  url: string;
};

export default function Admin() {
  const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<AvatarData | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setLoading(false);
        return;
      }
      const u = userData.user;
      setUser({ id: u.id, email: u.email!, role: (u.user_metadata as any)?.role });

      const { data: avatarData, error: avatarError } = await supabase
        .from("avatars")
        .select("*")
        .eq("user_id", u.id)
        .maybeSingle();
      if (avatarData) {
        setProfile(avatarData);
        setUsername(avatarData.username);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <p className="text-center py-10">ローディング中…</p>;
  if (!user) return <p className="text-center py-10 text-red-500">ログインしてください。</p>;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(e.target.files?.[0] ?? null);
  };

  const profSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let publicUrl = profile?.icon_url ?? "";

    if (avatarFile) {
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: upError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });
      if (upError) {
        console.error(upError);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    const { error: dbError } = await supabase
      .from("avatars")
      .upsert(
        { user_id: user.id, username, icon_url: publicUrl },
        { onConflict: "user_id" }
      );
    if (dbError) {
      console.error(dbError);
      return;
    }

    const { data: newProfile } = await supabase
      .from("avatars")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(newProfile ?? null);
    alert("プロフィールを更新しました！");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          フリーランス管理画面
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          ログインユーザー：<span className="font-medium">{user.email}</span> （役割：{user.role}）
        </p>

        <form onSubmit={profSubmit} className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Name"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アバター画像
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600"
            />
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
