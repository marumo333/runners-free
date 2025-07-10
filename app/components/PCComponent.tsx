"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { signIn, signOut } from "@/app/authSlice";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";

type Role = "admin" | "customer" | "staff" | null;

export default function PCComponent({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();

  const { cart } = useCart();
  const totalQuantity = cart.length;

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
                <button onClick={() => router.push("/cart")}>
                  Cart ({totalQuantity})
                </button>
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
