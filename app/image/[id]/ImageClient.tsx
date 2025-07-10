"use client";

import { Translator } from '@/libs/deepl'
// import { DeeplLanguages } from 'deepl'

type DeeplLanguages = 'EN-US' | 'JA' | 'FR' | 'DE' | 'ZH' | string;
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from 'next/navigation';
import LikeSection from "./likeSection"



interface ImageItem {
  id: string;
  name: string;
  url: string;
  jan: number;
  content: string;
  price: number;
}

export default function ImageClient({ id }: { id: string }) {
  const [imageDetail, setImageDetail] = useState<ImageItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [translate, setTranslate] = useState<string>("");
  const router = useRouter();

  const fetchImage = async (imageId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shopposts")
      .select("id,url,name, image_url, content,price,jan")
      .eq("id", imageId)
      .single();

    if (error || !data) {
      console.error("画像取得エラー:", error.message);
      setLoading(false);
      return;
    }
    setImageDetail({
      id: data.id,
      name: data.name,
      url: data.image_url,
      jan: data.jan,
      content: data.content,
      price: data.price,
    });
    setLoading(false);
  };

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUserId(data.user.id);
  };

  function clickTranslate(my_target_lang: DeeplLanguages) {
    if (!imageDetail) return;
    const textToTranslate = `
     商品名：${imageDetail.name}
     商品詳細：${imageDetail.content}
     価格：${imageDetail.price}
    `;
    Translator(textToTranslate, my_target_lang).then((result) => {
      setTranslate(result.text);
    });
  }






  const handleBack = () => {
    router.back();
  };



  useEffect(() => {
    fetchImage(id);
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!imageDetail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500">画像が見つかりません。</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg space-y-8">
      {/* 翻訳 */}
      <div className="space-y-2">
        <button
          onClick={() => clickTranslate('EN-US')}
          className="btn-success"
        >
          Translate to English
        </button>
        <div className="p-4 bg-gray-100 rounded-md border text-gray-700 whitespace-pre-wrap">
          <strong>Translation result:</strong><br />
          {translate || "ここに翻訳結果が表示されます"}
        </div>
      </div>
      {/* タイトル */}
      <h1 className="text-3xl font-bold text-blue-800 border-b pb-2">
        商品名: {imageDetail.name}
      </h1>

      {/* 商品情報 */}
      <div className="grid grid-cols-1 gap-4 text-gray-700">
        <Item label="JANコード" value={imageDetail.jan || "（なし）"} />
        <Item label="商品名" value={imageDetail.name || "（なし）"} />
        <Item label="商品詳細" value={imageDetail.content || "（なし）"} />
        <Item label="価格" value={imageDetail.price ?? "（なし）"} />
      </div>

      {/* 画像 */}
      <div className="flex justify-center">
        <img
          src={imageDetail.url}
          alt={imageDetail.name}
          className="object-contain w-full max-w-md rounded-lg border shadow-md"
        />
      </div>

      {/* ボタン */}
      <div className="flex flex-wrap justify-center gap-4">
        <button onClick={handleBack} className="btn-secondary">
          戻る
        </button>
        <button onClick={} className="btn-warning">
          カートに追加
        </button>

      </div>
      {/*Likeボタン*/}
      <LikeSection imageId={imageDetail.id} userId={userId} />
    </div>
  );
}

// コンポーネント：項目
function Item({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-lg">
      <strong>{label}：</strong>
      <span className="ml-2">{value}</span>
    </div>
  );
}
