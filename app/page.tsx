"use client"
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <h1>runnners-free</h1>
    <div>このアプリは、フリーランス向けのECサイトです。</div>
    <div>
      <Link href="/seller">フリーランスの方はこちら</Link>
    </div>
    <div>
      <Link href="/customer">お客様はこちら</Link>
    </div>
    </>
  )
}
