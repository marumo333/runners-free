import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時のESLintエラーを警告に変更
    ignoreDuringBuilds: false,
    // ESLintを実行するディレクトリを制限
    dirs: ['app', 'libs', 'utils'],
  },
  typescript: {
    // ビルド時のTypeScriptエラーを無視しない（開発時は表示される）
    ignoreBuildErrors: false,
  },
  // Prismaクライアントをサーバーサイドで使用
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // 画像最適化の設定
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
