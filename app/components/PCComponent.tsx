"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { supabase } from "@/utils/supabase/supabase";
import { signIn, signOut } from "@/app/authSlice";

export default function PCComponent({ className }: { className?: string }) {
    const dispatch = useDispatch();

  const [user, setUser] = useState<string | null | undefined>(undefined);
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (session?.user) {
              setUser(session.user.email || "Login User");
              dispatch(signIn({
                name: session.user.email,
                iconUrl: "",
                token: session.provider_token
              }));
              window.localStorage.setItem('oauth_provider_token', session.provider_token || "");
              window.localStorage.setItem('oauth_provider_refresh_token', session.provider_refresh_token || "");
            }
    
            if (event === 'SIGNED_OUT') {
              window.localStorage.removeItem('oauth_provider_token');
              window.localStorage.removeItem('oauth_provider_refresh_token');
              setUser("");
              dispatch(signOut());
            }
          }
        );
    
        return () => {
          authListener?.subscription.unsubscribe();
        };
      }, [dispatch]);
    return (<>
        {user?(
             <nav className={`flex items-center justify-between border-b border-gray-200 px-4 py-2 ${className ?? ""}`}>
             {/* ロゴ＋タイトル */}
             <Link href="/" className="flex items-center space-x-2">
                 <span className="text-2xl font-bold text-blue-900">runners-free</span>
             </Link>
 
             {/* メニュー */}
             <ul className="hidden md:flex space-x-6 text-blue-900 font-bold">
                 <li><Link href="/logout">ログアウト</Link></li>
                 <li><Link href="/private">商品一覧</Link></li>
                 <li><Link href="/myPage">マイページ</Link></li>
                 <li><Link href="/search" >商品検索</Link></li>
             </ul>
         </nav>
        ):(
            <nav className={`flex items-center justify-between border-b border-gray-200 px-4 py-2 ${className ?? ""}`}>
            {/* ロゴ＋タイトル */}
            <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-900">runnners-free</span>
            </Link>

            {/* メニュー */}
            <ul className="hidden md:flex space-x-6 text-blue-900 font-bold">
                <li><Link href="/private">商品一覧</Link></li>
                <li><Link href="/myPage">マイページ</Link></li>
                <li><Link href="/search" >商品検索</Link></li>
                <li><Link href="/login">ログイン</Link></li>
            </ul>
        </nav>
        )}
        </>
    );
}