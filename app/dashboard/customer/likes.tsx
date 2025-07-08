"use client";
import { supabase } from "@/utils/supabase/supabaseClient";
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
          .select("image_id,user_id,shopposts(id,image_url)")
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
    <div>
      <h1>お気に入りの投稿</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}{" "}
      {/* Error message display */}
      {isLiked ? (
        likedImages.map((img) => (
          <div key={img.image_id}>
            <p>画像ID: {img.image_id}</p>
            {img.image_url ? (
              <img
                src={img.image_url}
                alt="お気に入りの商品"
                width={200}
                loading="lazy"
              />
            ) : (
              <p>画像が見つかりません</p>
            )}
          </div>
        ))
      ) : (
        <p>いいねした商品はありません</p>
      )}
    </div>
  );
}
