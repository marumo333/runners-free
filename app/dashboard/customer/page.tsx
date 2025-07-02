"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React from "react";
import {useEffect,useState} from "react";

type AvatarData ={
    id: string;
  user_id: string;
  username: string;
  icon_url: string;
  created_at: string;
  url:string,
}

export default function Customer(){
    const [user,setUser] = useState<{ id: string; email: string; role?: string }|null>(null);
    const [loading,setLoading] = useState(true);

    const supabase = createClientComponentClient();
    // フォーム入力用
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // 保存済みプロフィール
  const [profile, setProfile] = useState<AvatarData | null>(null);

     // 1. ログインユーザー取得＆avatarsテーブルからレコードフェッチ
  useEffect(() => {
    const init = async () => {
        setLoading(true);
      // getUser
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("ユーザー取得失敗", userError);
        setLoading(false);
        return;
      }
      const u = userData.user;
      setUser({ id: u.id, email: u.email!, role: (u.user_metadata as any)?.role });

      // fetch existing avatar record
      const { data: avatarData, error: avatarError } = await supabase
        .from("avatars")
        .select("*")
        .eq("user_id", u.id)
        .single();

      if (avatarError) {
        console.warn("プロフィール未作成／フェッチ失敗", avatarError);
      } else {
        setProfile(avatarData);
        setUsername(avatarData.username);
      }

      setLoading(false);
    };

    init();
  }, []);

  if (loading) return <p>ローディング中…</p>;
  if (!user) return <p>ログインしてください。</p>;

  // 2. ファイル選択ハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(e.target.files?.[0] ?? null);
  };

  // 3. アップロード＋テーブル書き込み
  const profSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let publicUrl = profile?.icon_url ?? null;

    // ファイルが選択されていれば Storage にアップロード
    if (avatarFile) {
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: upError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });
      if (upError) {
        console.error("アップロード失敗", upError);
        return;
      }
      // 公開 URL 取得
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    // テーブルに upsert（初回 insert、２回目以降 update）
    const { error: dbError } = await supabase
      .from("avatars")
      .upsert(
        {
          user_id: user.id,
          username: username,
          icon_url: publicUrl!,
          // url カラムを使う場合はこちらにもセット
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      console.error("テーブル書き込み失敗", dbError);
      return;
    }

    // 成功したら最新レコードを再フェッチ
    const { data: newProfile } = await supabase
      .from("avatars")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(newProfile ?? null);
    alert("プロフィールを更新しました！");
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl mb-4">お客様の管理画面</h1>
      <p className="mb-2">ログインユーザー：{user.email} （{user.role}）</p>

      <form onSubmit={profSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Avatar Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500"
        >
          ユーザー情報を更新
        </button>
      </form>

      {profile && (
        <div className="mt-8 border rounded p-4 text-center">
          <p className="text-lg text-blue-600 mb-2">{profile.username}</p>
          <img
            src={profile.icon_url}
            alt="avatar"
            className="mx-auto w-24 h-24 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}