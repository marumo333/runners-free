"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { signIn, signOut } from "@/app/authSlice";
import { useRouter } from "next/navigation";
import { useCart } from "../context/page";

type Role = "admin" | "customer" | "staff" | null;
export default function PCComponent({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const [role, setRole] = useState<Role>(null);

  const { cart } = useCart();
  const totalQuantity = cart.length;
  const items = cart;

  const supabase = createClientComponentClient();

  const [user, setUser] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userRole =
            (session.user.user_metadata?.role as Role | undefined) ?? null;
          setRole(userRole);
          setUser(session.user.email || "Login User");
          dispatch(
            signIn({
              name: session.user.email,
              iconUrl: "",
              token: session.provider_token,
            })
          );
          window.localStorage.setItem(
            "oauth_provider_token",
            session.provider_token || ""
          );
          window.localStorage.setItem(
            "oauth_provider_refresh_token",
            session.provider_refresh_token || ""
          );
        }

        if (event === "SIGNED_OUT") {
          window.localStorage.removeItem("oauth_provider_token");
          window.localStorage.removeItem("oauth_provider_refresh_token");
          setUser("");
          setRole(null);
          dispatch(signOut());
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [dispatch]);
  return (
    <>
      {user ? (
        <nav
          className={`flex items-center justify-between border-b border-gray-200 px-4 py-2 ${
            className ?? ""
          }`}
        >
          {/* ロゴ＋タイトル */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-900">
              runners-free
            </span>
          </Link>

          {/* メニュー */}
          <ul className="hidden md:flex space-x-6 text-blue-900 font-bold">
            <li>
              <Link href="/logout">ログアウト</Link>
            </li>
            <li>
              <Link href="/postedInfo">商品一覧</Link>
            </li>
            <li>
              <Link href="/search">商品検索</Link>
            </li>
            {role === "admin" && (
              <>
                <li>
                  <Link href="/post">商品投稿</Link>
                </li>
                <li>
                  <Link href="/dashboard/admin">マイページ</Link>
                </li>
              </>
            )}
            {role === "customer" && (
              <>
                <li>
                  <Link href="/dashboard/customer">マイページ</Link>
                </li>
                {/* カートアイコン＋バッジ＋プレビューポップアップ */}
                <li className="relative group">
                  <Link
                    href="/cart"
                    className="flex items-center p-2 hover:bg-gray-100 rounded-full"
                    aria-label={`カートに ${totalQuantity} 件の商品があります`}
                  >
                    <Image
                      src="/ECcart.png.webp"
                      alt="Cart"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    {totalQuantity > 0 && (
                      <span
                        className="
                          absolute -top-1 -right-1 flex h-5 w-5
                          items-center justify-center
                          rounded-full bg-red-500 text-xs text-white
                          animate-ping
                        "
                      >
                        {totalQuantity}
                      </span>
                    )}
                  </Link>
                  <div
                    className="
                      pointer-events-none
                      absolute right-0 top-full mt-2 w-48
                      opacity-0 group-hover:opacity-100
                      transition-opacity bg-white border border-gray-200
                      shadow-lg rounded-md p-3 text-sm z-10
                    "
                  >
                    {totalQuantity > 0 ? (
                      <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {items.map((item,index) => (
                          <li key={item.id} className="flex justify-between">
                            <div key={item.id || index}>
                            <span className="truncate">{item.name}</span>
                            <span className="font-bold">×{item.quantity}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">カートは空です</p>
                    )}
                    <Link
                      href="/cart"
                      className="mt-2 block text-center text-blue-600 hover:underline"
                    >
                      カートを見る
                    </Link>
                  </div>
                </li>
              </>
            )}
            {role === "staff" && (
              <>
                <li>
                  <Link href="/dashboard/staff">マイページ</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      ) : (
        <nav
          className={`flex items-center justify-between border-b border-gray-200 px-4 py-2 ${
            className ?? ""
          }`}
        >
          {/* ロゴ＋タイトル */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-900">
              runnners-free
            </span>
          </Link>

          {/* メニュー */}
          <ul className="hidden md:flex space-x-6 text-blue-900 font-bold">
            <li>
              <Link href="/postedIngo">商品一覧</Link>
            </li>
            <li>
              <Link href="/search">商品検索</Link>
            </li>
            <li>
              <Link href="/Login">ログイン</Link>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
