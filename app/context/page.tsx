"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, ShopPost } from "@/app/types/cart";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type CartContextType = {
  cart: CartItem[];
  addCart: (post: ShopPost | CartItem) => void;
  removeCart: (post: ShopPost | CartItem) => void;
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
            shopposts(
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
      data?.map((item) => ({
        id: item.shopposts[0]?.id,
        user_id: item.user_id ?? "",
        image_url: item.shopposts[0]?.image_url,
        name: item.shopposts[0]?.name ?? null,
        url: item.shopposts[0]?.url ?? "",
        jan: item.shopposts[0]?.jan ?? null,
        content: item.shopposts[0]?.content ?? null,
        tag: item.shopposts[0]?.tag ?? null,
        stock: item.shopposts[0]?.stock ?? null,
        price: item.shopposts[0]?.price ?? null,
        created_at: item.shopposts[0]?.created_at ?? "",
        quantity: item.quantity,
      })) || [];
    setCart(CartItems);
  };

  //カートに追加
  const addCart = async (post: ShopPost) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: post.id,
        quantity: 1,
      },
      {
        onConflict: "user_id,product_id",
      }
    );
    if (error) {
      console.log("カート追加エラー", error);
    } else {
      await fetchCart();
    }
    setLoading(false);
  };

  //カートから削除
  const removeCart = async (post: ShopPost) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setLoading(true);

    //数量を取得
    const { data: cartItem } = await supabase
      .from("cart_item")
      .select("quantity")
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
