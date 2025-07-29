// app/cart/page.tsx
"use client";
import { Button, Card } from "@mantine/core";
import type { NextPage } from "next";
import { useCart } from "../context/page";
import type { CartItem } from "../types/cart";

const Cart: NextPage = () => {
  const { cart, addCart, removeCart } = useCart();

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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Cart;
