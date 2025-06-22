"use client";
import { supabase } from "@/utils/supabase/supabaseClient";
import "../globals.css";
import { signOut, signIn } from "../authSlice";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import React from "react";
import Icon from "./Icon";
import { useRouter } from "next/navigation";

type GoogleProps = {
  className?:string
}
export default function Google({className}:GoogleProps) {
  const auth = useSelector((state: any) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const [user, setUser] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user.email || "Google User");
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
          dispatch(signOut());
        }
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      router.push("http://localhost:3000/post");
    }
  }, [user, router]);

  const signInGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `http://localhost:3000/redirect`,
      },
    });
    if (error) throw new Error(error.message);
  };

  const signOutGoogle = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      dispatch(signOut());
    } catch (error: any) {
      console.error("ログアウトエラー発生", error.message);
    }
  };

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl("google.jpg");
      setAvatarUrl(data.publicUrl || "");
    };
    fetchAvatarUrl();
  }, []);

  return  user ? (
    <button
      onClick={signOutGoogle}
      className={`
        w-full inline-flex items-center justify-center
        py-2 px-4 border border-gray-300 rounded-md shadow-sm
        bg-white text-sm font-medium text-gray-700 hover:bg-gray-50
        ${className}
      `}
    >
      <Icon url={avatarUrl} className="h-5 w-5 mr-2" />
      ログアウト
    </button>
  ) : (
    <button
      onClick={signInGoogle}
      className={`
        w-full inline-flex items-center justify-center
        py-2 px-4 border border-gray-300 rounded-md shadow-sm
        bg-white text-sm font-medium text-gray-700 hover:bg-gray-50
        ${className}
      `}
    >
      <Icon url={avatarUrl} className="h-5 w-5 mr-2" />
      Google
    </button>
  );
}
