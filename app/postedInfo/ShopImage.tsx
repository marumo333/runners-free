// app/components/ShopImage.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ImageItem {
  id: string;
  user_id: string;
  name: string;
  url: string;
  jan: number;
  content: string;
  tag: string;
  stock: number;
  price: number;
  status: "pending" | "approved" | "rejected";
}

export default function ShopImage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    (async () => {
      setLoading(true);
      // ビューから直接 status を含めて取得
      const { data, error } = await supabase
        .from("shopposts_with_status")
        .select("*");

      if (error) {
        console.error("投稿取得エラー:", error);
      } else {
        setImages(
          (data || []).map((item: {
            id: string;
            user_id: string;
            name: string;
            image_url: string;
            jan: string | number;
            content: string;
            tag: string;
            price: string;
            stock: number;
            status: string;
            created_at: string;
          }) => ({
            id: item.id,
            user_id: item.user_id,
            name: item.name,
            url: item.image_url,
            jan: Number(item.jan),
            content: item.content,
            tag: item.tag,
            stock: Number(item.stock),
            price: Number(item.price),
            status: item.status as "pending" | "approved" | "rejected",
          }))
        );
      }
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <>
      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {images.map((item) => (
          <li
            key={item.id}
            className="group relative bg-white rounded-md shadow p-2"
          >
            <span
              className={`
                absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded 
                ${
                  item.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : item.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              `}
            >
              {item.status === "approved"
                ? "承認済"
                : item.status === "rejected"
                ? "却下"
                : "審査中"}
            </span>
            <Link href={`/image/${item.id}`} className="block">
              <img
                src={item.url}
                alt={item.name}
                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm text-gray-700 font-semibold">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{item.tag}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ¥{item.price.toLocaleString()}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
