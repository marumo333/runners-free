// app/cart/page.tsx
"use client";
import { Button, Card } from "@mantine/core";
import type { NextPage } from "next";
import { useCart } from "../context/page";
import type { CartItem } from "../types/cart";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Cart: NextPage = () => {
  const { cart, addCart, removeCart } = useCart();
  const [show, setShow] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      if (!user) {
        router.push("/login");
        return;
      }
    };
    getUser();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth,router]);
  const handleOpen = (itemId:string) => {
    setShow(itemId);
  };

  const handleCancel = () => {
    setShow( null);
  };

  //stripe checkout
  const startCheckout = async (item: CartItem) => {
    if (!item) return;

    let shoppost;

    if (item.shopposts) {
    // ネストされた構造の場合
    shoppost = Array.isArray(item.shopposts) ? item.shopposts[0] : item.shopposts;
    console.log("Using nested shopposts data:", shoppost);
  } else {
    // 直接構造の場合（現在のケース）
    shoppost = item;
    console.log("Using direct item data:", shoppost);
  }

  if (!shoppost) {
    console.error('商品データが見つかりません。', item);
    return;
  }

    if(!shoppost){
      console.error('shooppostsデータが見つかりません。',item);
      return;
    }
    console.log("shoppost data",shoppost)

    //価格の処理を2200円(税抜)から2200に変換
    let numberPrice = 0;
    if (typeof shoppost.price === 'string') {
      const priceMatch = (shoppost.price as string).match(/\d+/);
      // 価格が見つかった場合はnumberPriceに代入
      if (priceMatch) {
        numberPrice = Number(priceMatch[0]);
      }
    } else if (typeof shoppost.price === 'number') {
      numberPrice = shoppost.price;
    } else {
      // 型が string でも number でもない場合のフォールバック
      numberPrice = 0;
    }
    if (!shoppost.id || !shoppost.name || numberPrice <= 0) {
    console.error("Missing or invalid required fields:", {
      id: shoppost.id,
      name: shoppost.name,
      price: shoppost.price,
      numericPrice: numberPrice
    });
    alert(`商品情報が不完全です:\nID: ${shoppost.id}\n名前: ${shoppost.name}\n価格: ${shoppost.price}`);
    return;
  }

  const requestData = {
    productId: shoppost.id, // shopposts.id を使用
    name: shoppost.name,    // shopposts.name を使用
    price: numberPrice,    // 数値に変換された価格
    quantity: item.quantity || 1,
  };


    try {
      const response = await fetch(`/api/checkout/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (responseData && responseData.checkout_url) {
        sessionStorage.setItem("stripeSessionId", responseData.session_id);
        router.push(responseData.checkout_url);
      } else {
        console.error("Invalid response data:", responseData);
      }
    } catch (err) {
      console.error("Error in startCheckout:", err);
    }
  };

  const handlePurchaseConfirm = (item: CartItem) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setShow(null);
    startCheckout(item);
  };

  // 認証中は読み込み表示
  if (authLoading) {
    return (
      <div className="pt-16 flex justify-center items-center min-h-screen">
        <div>読み込み中...</div>
      </div>
    );
  }

  // 未認証時は自動リダイレクト
  if (!user) {
    return (
      <div className="pt-16 flex justify-center items-center min-h-screen">
        <div>ログインページに移動中...</div>
      </div>
    );
  }
  return (
    <div className="pt-16">
      {" "}
      {/* 固定ヘッダー分の上部マージン追加 */}
      <header className="px-8 py-4 shadow-md">
        <h1 className="text-xl font-bold">カートの詳細</h1>
        <p className="text-sm text-gray-600">
          カート内のアイテム数: {cart.length}
        </p>
      </header>
      <div className="flex flex-wrap gap-4 p-4 sm:p-8">
        {" "}
        {/* レスポンシブ対応 */}
        {cart.map((item: CartItem) => (
          <Card key={item.id} shadow="md" className="w-full sm:w-80">
            {" "}
            {/* レスポンシブ対応 */}
            {/* 商品名*/}
            <div className="flex justify-between items-end">
              <h4 className="text-base sm:text-lg font-semibold">
                {item.name ?? "商品名"}
              </h4>
              <div className="text-xs sm:text-sm text-gray-500">
                {item.user_id}
              </div>
            </div>
            {/* 価格 */}
            <div className="mt-3 font-bold text-lg sm:text-xl">
              ¥{item.price ?? 0}
            </div>
            {/* 画像 */}
            <div className="relative h-40 sm:h-52 bg-gray-100 flex items-center justify-center">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name ?? ""}
                  style={{ objectFit: "contain" }}
                  className="w-full h-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      (
                        e.currentTarget.nextElementSibling as HTMLElement
                      ).style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center text-gray-400"
                style={{ display: item.image_url ? "none" : "flex" }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm">画像なし</div>
                </div>
              </div>
            </div>
            {/* 数量操作 */}
            <div className="flex justify-start items-center gap-2 sm:gap-4 mt-4">
              {" "}
              {/* レスポンシブ対応 */}
              <Button
                variant="light"
                color="red"
                radius={9999}
                size="sm" // スマホ用にサイズ調整
                onClick={() => removeCart(item)}
              >
                ー
              </Button>
              <span className="px-2 font-bold">{item.quantity}</span>
              <Button
                variant="light"
                color="blue"
                radius={9999}
                size="sm" // スマホ用にサイズ調整
                onClick={() => {
                  console.log("数量を追加");
                  addCart(item);
                }}
              >
                ＋
              </Button>
              <button onClick={()=>handleOpen(item.id)} className="btn-warning">
                購入する
              </button>
              {/* 購入モーダル */}
              {show === item.id && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 text-center">
                    <h3 className="text-xl font-semibold">
                      {item.name}を購入しますか？
                    </h3>
                    <p className="text-gray-600">価格: ¥{item.price}</p>
                    <div className="flex justify-center gap-4">
                      <button onClick={handleCancel} className="btn-secondary">
                        キャンセル
                      </button>
                      <button
                        onClick={() => handlePurchaseConfirm(item)}
                        className="btn-success"
                      >
                        購入する
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Cart;