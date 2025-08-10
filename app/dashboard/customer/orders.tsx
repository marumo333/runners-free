import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

interface OrdersProps {
  userId: string;
}

interface OrderItem {
  id: string;
  session_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_status: string;
  items: any[];
  created_at: string;
}

export default function Orders({ userId }: OrdersProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("purchase")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("購入履歴の取得エラー:", error);
        }
        setOrders(data || []);
      } catch (error) {
        console.error("購入履歴取得エラー", error);
        setError("注文履歴の種とっくに失敗しました");
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchOrders();
    }
  }, [userId, supabase]);
  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">購入履歴</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">購入履歴</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">購入履歴</h2>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            購入履歴がありません
          </h3>
          <p className="text-gray-600 mb-4">まだ商品を購入していません。</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            商品を探す
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* 注文ヘッダー */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      注文番号: {order.session_id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      注文日:{" "}
                      {new Date(order.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{order.amount.toLocaleString()}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.payment_status === "paid" ? "決済完了" : "決済中"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 注文商品一覧 */}
              <div className="px-6 py-4">
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={item.image_url || "/images/placeholder.jpg"}
                            alt={item.name || "商品画像"}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.name || "商品名不明"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ¥{(item.price || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-sm text-gray-600">
                          数量: {item.quantity || 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    商品情報が見つかりません
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
