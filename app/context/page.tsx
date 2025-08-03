"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, ShopPost } from "@/app/types/cart";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type CartContextType = {
  cart: CartItem[];
  addCart: (post: ShopPost | CartItem) => Promise<void>;
  removeCart: (post: ShopPost | CartItem) => Promise<void>;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
export default function Context({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  //ユーザーのカートを取得
  const fetchCart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
            id,
            user_id,
            quantity,
            shopposts!cart_items_product_id_fkey(
            id,
            url,
            jan,
            tag,
            name,
            price,
            image_url,
            stock,
            created_at,
            content
            )
            `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("カート取得エラー", error);
      return;
    }
    const CartItems: CartItem[] =
      data?.map((item) => {
        console.log("item:", item); // デバッグ用
        console.log("shopposts:", item.shopposts); // デバッグ用
        // shopposts が配列の場合は最初の要素を取得、オブジェクトの場合はそのまま使用
        const shoppost = Array.isArray(item.shopposts) ? item.shopposts[0] : item.shopposts;

        return {
          id: shoppost?.id || item.id, 
          user_id: item.user_id ?? "",
          image_url: shoppost?.image_url || "",
          name: shoppost?.name ?? null,
          url: shoppost?.url ?? "",
          jan: shoppost?.jan ?? null,
          content: shoppost?.content ?? null,
          tag: shoppost?.tag ?? null,
          stock: shoppost?.stock ?? null,
          price: shoppost?.price ?? null,
          created_at: shoppost?.created_at ?? "",
          quantity: item.quantity,
          shopposts: shoppost ? {
            ...shoppost,
            user_id: item.user_id ?? ""
          } : shoppost,
        };
      }) || [];
    setCart(CartItems);
  };

  //カートに追加
  const addCart = async (post: ShopPost|CartItem) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setLoading(true);

    // 既存のカートアイテムを確認
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("product_id", post.id)
    .maybeSingle();

  console.log("既存アイテム:", existingItem); // デバッグ用

  if (existingItem) {
    // 既存アイテムの数量を増加
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + 1 })
      .eq("user_id", user.id)
      .eq("product_id", post.id);
    
    if (error) {
      console.error("数量更新エラー:", error);
    } else {
      console.log("数量を更新しました:", existingItem.quantity + 1);
    }
    } else {
        // 新しいアイテムを追加
    const { error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id: post.id,
        quantity: 1,
      });
    
    if (error) {
      console.error("カート追加エラー:", error);
    } else {
      console.log("新しいアイテムを追加しました");
    }
    }
    await fetchCart();
    setLoading(false);
  };

  //カートから削除
  const removeCart = async (post: ShopPost|CartItem) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setLoading(true);

    //数量を取得
    const { data: cartItem } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("product_id", post.id)
      .maybeSingle();

    if (cartItem && cartItem.quantity > 1) {
      //数量を減らす
      await supabase
        .from("cart_items")
        .update({ quantity: cartItem.quantity - 1 })
        .eq("product_id", post.id)
        .eq("user_id", user.id);
    } else {
      // カートから商品を削除
      await supabase
        .from("cart_items")
        .delete()
        .eq("product_id", post.id)
        .eq("user_id", user.id);
    }
    await fetchCart();
    setLoading(false);
  };

  //初回ロード次にカートを取得
  useEffect(() => {
    fetchCart();
  }, []);
  return (
    <>
      <CartContext.Provider value={{ cart, addCart, removeCart, loading }}>
        {children}
      </CartContext.Provider>
    </>
  );
}
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
