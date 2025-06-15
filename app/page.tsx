"use client";
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-lg mx-auto mt-32 text-center font-sans">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">runnners-free</h1>
      <div className="text-lg mb-10 text-gray-600">
        このアプリは、フリーランス向けのECサイトです。
      </div>
      <div className="flex flex-col gap-5">
        <Link href="/Login" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg transition">
          フリーランスの方はこちら
        </Link>
        <Link href="/customer" className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg transition">
          お客様はこちら
        </Link>
      </div>
    </div>
  );
}

