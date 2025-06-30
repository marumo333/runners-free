"use client";
import { signIn, signOut } from "@/app/authSlice";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Burger, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type Role = "admin" | "customer" | "staff" | null;

export default function MobileComponent({ className }: { className?: string }) {
  const [opened, handlers] = useDisclosure(false);
  const { open, close, toggle } = handlers;

  const dispatch = useDispatch();

  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [role, setRole] = useState<Role>(null);
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
              role: userRole,
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
        <header className="fixed top-0 left-0 right-0 z-50 bg-blue-500 p-4 text-white shadow">
          <div className="flex w-full justify-between">
            <div className="flex w-full justify-between">
              <div>
                <Burger
                  opened={opened}
                  //onClick={hamburgerToggle}
                  onClick={() => {
                    console.log("toggle");
                    toggle();
                  }}
                  //toggleが発火shている確認
                />
                <Drawer
                  opened={opened}
                  onClose={close}
                  zIndex={9999}
                  withCloseButton={false}
                  classNames={{
                    body: "p-0",
                    inner: "w-[380px]",
                  }}
                >
                  {/* Xボタン追加 */}
                  <div className="flex justify-end p-4">
                    <button onClick={close} className="text-2xl font-bold">
                      &times;
                    </button>
                  </div>

                  <div className="px-4 pt-[78px] font-bold flex flex-col gap-4">
                    <Link href="/logout" className="mb-4" onClick={close}>
                      ログアウト
                    </Link>
                    <Link href="/postedInfo" className="mb-4" onClick={close}>
                      商品一覧
                    </Link>
                    <Link href="/myPage" className="mb-4" onClick={close}>
                      マイページ
                    </Link>
                    <Link href="/search" className="mb-4" onClick={close}>
                      商品検索
                    </Link>
                    {role === "admin" && (
                      <>
                        <li>
                          <Link href="/post" className="mb-4" onClick={close}>
                            商品投稿
                          </Link>
                        </li>
                        <li>
                          <Link href="/dashboard/admin" onClick={close}>
                            マイページ
                          </Link>
                        </li>
                      </>
                    )}
                    {role === "customer" && (
                      <>
                        <li>
                          <Link href="/dashboard/customer" onClick={close}>
                            マイページ
                          </Link>
                        </li>
                      </>
                    )}
                    {role === "staff" && (
                      <>
                        <li>
                          <Link href="/dashboard/staff" onClick={close}>
                            マイページ
                          </Link>
                        </li>
                      </>
                    )}
                  </div>
                </Drawer>
              </div>
              <Link href="/" className="text-xl font-bold text-white">
                runners-free
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <header className="fixed top-0 left-0 right-0 z-50 bg-blue-500 p-4 text-white shadow">
          <div className="flex w-full justify-between">
            <div className="flex w-full justify-between">
              <div>
                <Burger
                  opened={opened}
                  onClick={() => {
                    console.log("toggle");
                    toggle();
                  }}
                  color="#fff"
                />
                <Drawer
                  opened={opened}
                  onClose={close}
                  zIndex={9999} // ← これがポイント
                  withCloseButton={false}
                  classNames={{
                    body: "p-0",
                    inner: "w-[380px]",
                  }}
                >
                  {/* Xボタン追加 */}
                  <div className="flex justify-end p-4">
                    <button onClick={close} className="text-2xl font-bold">
                      &times;
                    </button>
                  </div>

                  <div className="px-4 pt-[78px] font-bold flex flex-col gap-4">
                    <Link href="/postedInfo" className="mb-4" onClick={close}>
                      商品一覧
                    </Link>
                    <Link href="/search" className="mb-4" onClick={close}>
                      商品検索
                    </Link>
                    <Link href="/Login" className="mb-4" onClick={close}>
                      ログイン
                    </Link>
                  </div>
                </Drawer>
              </div>
              <Link href="/" className="text-xl font-bold text-white">
                runnners-free
              </Link>
            </div>
          </div>
        </header>
      )}
    </>
  );
}
