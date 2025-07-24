"use client";
import { supabase } from "@/utils/supabase/supabaseClient";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface LikesImage {
  image_url: string;
  image_id: string;
}

interface Likes {
  userId: string;
}

export default function Like({ userId }: Likes) {
  const [likedImages, setLikedImages] = useState<LikesImage[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const { data, error } = await supabase
          .from("likes")
          .select('id,image_id,user_id,shopposts(id,image_url)')
          .eq("user_id", userId);
        console.log(data);
        console.log(error);
        if (error) {
          console.error("いいねの投稿を取得だきませんでした", error.message);
          return;
        }

        if (data && data.length > 0) {
          const formattedData = (data as any[]).map((item) => ({
            image_id: item.image_id,
            image_url: item.shopposts?.image_url || "",
          }));
          setLikedImages(formattedData);
          setIsLiked(true); //いいね済みのものを表示
        } else {
          setIsLiked(false);
        }
      } catch (err) {
        console.error("お気に入りの取得に失敗しました", err);
      }
    };
    if (userId) {
      fetchLikes();
    }
  }, [userId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">お気に入りの投稿</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLiked ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {likedImages.map((img) => (
            <div
              key={img.image_id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center"
            >
              <p className="mb-2 text-gray-700">画像ID: {img.image_id}</p>
              {img.image_url ? (
                <img
                  className="mb-4 rounded-md object-cover"
                  src={img.image_url}
                  alt="お気に入りの商品"
                  width={200}
                  height={200}
                  loading="lazy"
                />
              ) : (
                <p className="text-gray-500 mb-4">画像が見つかりません</p>
              )}
              <Link
              href={`/image/${img.image_id}`}
                className="
                  px-4 py-2 
                  bg-blue-500 text-white 
                  rounded-lg shadow 
                  hover:bg-blue-600 
                  focus:outline-none focus:ring-2 focus:ring-blue-300 
                  transition
                "
                onClick={() => {
                  
                }}
              >
                詳細を見る
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">いいねした商品はありません</p>
      )}
    </div>
  );
}
