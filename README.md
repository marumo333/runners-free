# Runners Free - フリーランス向けECプラットフォーム

地方のフリーランス需要を鑑み、フリーランス向けのECプラットフォームです。フリーランサーが自分の商品やサービスを販売し、購入者との取引を行うことができるマーケットプレイスアプリケーションです。

## 特徴

- **フリーランス特化**: 地方フリーランサーの販売機会創出
- **商品管理**: 商品の投稿、編集、削除機能
- **カート機能**: 商品をカートに追加して一括購入
- **決済機能**: Stripe決済による安全な取引
- **ユーザー認証**: Supabase Authによるセキュアな認証
- **レスポンシブデザイン**: PC・スマートフォン対応

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS** - スタイリング
- **Mantine UI** - UIコンポーネント

### バックエンド・インフラ
- **Supabase** - データベース・認証・ストレージ
- **PostgreSQL** - メインデータベース
- **Prisma** - ORMツール

### 決済・外部サービス
- **Stripe** - 決済処理
- **DeepL API** - 翻訳機能

### 開発・デプロイ
- **Vercel** - ホスティング
- **ESLint** - コード品質管理
- **PostCSS** - CSS処理

## プロジェクト構造

```
runners-free/
├── app/                          # Next.js App Router
│   ├── api/                      # APIルート
│   │   ├── checkout/             # Stripe決済API
│   │   │   ├── create-session/   # セッション作成
│   │   │   └── success/          # 決済成功処理
│   │   ├── review/               # フリーランス書類申請関連API
│   │   └── translate/            # 翻訳API
│   ├── auth/                     # 認証関連
│   │   ├── login/                # ログインページ
│   │   └── callback/             # 認証コールバック
│   ├── cart/                     # カート機能
│   ├── components/               # 共通コンポーネント
│   │   ├── Header.tsx
│   │   ├── MobileComponent.tsx
│   │   └── PCComponent.tsx
│   ├── context/                  # Context API（カート管理）
│   ├── dashboard/                # ダッシュボード
│   │   ├── admin/                # 管理者画面
│   │   ├── customer/             # 顧客画面
│   │   └── staff/                # スタッフ画面
│   ├── image/                    # 商品画像表示
│   ├── login/                    # ログイン
│   ├── post/                     # 商品投稿
│   ├── register/                 # ユーザー登録
│   ├── search/                   # 商品検索
│   ├── types/                    # TypeScript型定義
│   └── globals.css               # グローバルスタイル
├── libs/                         # ライブラリ・ユーティリティ
│   ├── database.types.ts         # Supabase型定義
│   ├── deepl.tsx                 # DeepL翻訳
│   └── prisma.ts                 # Prismaクライアント
├── prisma/                       # Prismaスキーマ
│   └── schema.prisma             # 統合データベーススキーマ
├── public/                       # 静的ファイル
├── utils/                        # ユーティリティ関数
│   ├── supabase/                 # Supabase設定
│   └── utils.ts
├── next.config.ts                # Next.js設定
├── tailwind.config.ts            # TailwindCSS設定
└── tsconfig.json                 # TypeScript設定
```

## 主要機能

### 1. ユーザー認証
- Supabase Authによるメール・SNS認証
- ロールベースアクセス制御（admin/customer/staff）

### 2.フリーランス証明書の申請機能
- supabaseのreview_applicationsテーブルを作ることで、フリーランス申請の判定
- app/review(フリーランス書類申請関連API)にてPOST
- staff-roleが管理者ページで許可することで商品に申請済み・未申請のレッテルを表示
  
### 3. 商品管理
- 商品の投稿・編集・削除
- 画像アップロード（Supabase Storage）
- カテゴリ・タグ付け機能

### 4. ショッピングカート
- 商品のカート追加・削除
- 数量変更機能
- リアルタイムカート更新

### 5. 決済機能
- Stripe Checkoutによる安全な決済
- 決済履歴管理
- 購入完了通知

### 6. 検索・フィルタリング
- 商品名・カテゴリ検索
- レスポンシブ対応

## 環境変数

プロジェクトを動作させるために以下の環境変数が必要です：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Prisma - Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# DeepL API
DEEPL_API_KEY=your-deepl-api-key

# その他
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

## セットアップ手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/marumo333/runners-free.git
cd runners-free
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env.local
# .env.localファイルを編集して必要な値を設定
```

4. **データベースのセットアップ**
```bash
# Prismaクライアント生成
npx prisma generate

# データベースマイグレーション（本番環境）
npx prisma db push

# 既存データベースからスキーマを取得（開発時）
npx prisma db pull
```

5. **開発サーバーの起動**
```bash
npm run dev
```

## データベース設計

### Prisma + Supabase PostgreSQL

このプロジェクトでは、**Prisma ORM**を使用してSupabaseのPostgreSQLデータベースにアクセスしています。

#### Prisma設定の詳細

**設定ファイル**: `prisma/schema.prisma` （単一ファイルで全管理）
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "auth"]
}
```

**主な特徴:**
- **マルチスキーマ対応**: `public`と`auth`スキーマを同時使用
- **型安全性**: TypeScript完全対応
- **自動生成**: Supabaseから既存テーブル構造を自動取得

#### Prismaコマンド

```bash
# スキーマからクライアント生成
npx prisma generate

# Supabaseからスキーマを取得（初回・更新時）
npx prisma db pull --force

# データベースブラウザ起動
npx prisma studio

# スキーマ検証
npx prisma validate

# データベースリセット（注意: データが削除されます）
npx prisma db push --reset
```

#### PrismaとSupabaseの連携

**メリット:**
- ✅ **型安全なクエリ**: 自動生成されたクライアントによる完全な型サポート
- ✅ **リレーション処理**: JOINクエリの簡潔な記述
- ✅ **トランザクション**: 複数操作の原子性保証
- ✅ **マイグレーション**: スキーマ変更の管理

**使用例:**
```typescript
// libs/prisma.ts - シングルトンクライアント
import { PrismaClient } from '../app/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

// 使用例: API Route
import prisma from "@/libs/prisma";

// 購入レコード作成（重複チェック付き）
const existingPurchase = await prisma.purchase.findFirst({
  where: { userId, productId }
});

if (!existingPurchase) {
  const purchase = await prisma.purchase.create({
    data: { userId, productId }
  });
}
```

### 主要テーブル
- **users (auth schema)**: ユーザー情報（Supabase Auth）
- **shopusers (public schema)**: ユーザープロフィール
- **shopposts**: 商品情報
- **cart_items**: カートアイテム
- **Purchase**: 購入履歴
- **likes**: いいね機能
- **avatars**: プロフィール画像

**テーブル関係図:**
```
auth.users (Supabase Auth)
    ↓ 1:1
shopusers (プロフィール)
    ↓ 1:N
shopposts (商品)
    ↓ M:N
cart_items (カート) → Purchase (購入履歴)
    ↓ 1:N
likes (いいね)
```

## 開発で苦労した実装ポイント

### 1. Stripe API の価格データ変換
**課題**: データベースに保存されている価格が `"2200円(税抜)"` のような文字列形式で、Stripe APIには数値として渡す必要がある

```typescript
// 価格文字列から数値への変換処理
const parsePrice = (priceString: string): number => {
  // "2200円(税抜)" → 2200 に変換
  const numericPrice = priceString.replace(/[^\d]/g, '');
  return parseInt(numericPrice) || 0;
};

// Stripe checkout session作成時の価格処理
const lineItems = cartItems.map(item => ({
  price_data: {
    currency: 'jpy',
    product_data: {
      name: item.name,
      images: item.image_url ? [item.image_url] : [],
    },
    unit_amount: parsePrice(item.price), // 文字列→数値変換
  },
  quantity: item.quantity,
}));
```

### 2. Context API によるカート情報のリアルタイム反映
**課題**: Supabaseから取得したカートデータの構造が複雑で、ネストしたshopposts情報を適切にマッピングする必要がある

```typescript
// Supabaseクエリで取得したデータの構造
const { data } = await supabase
  .from("cart_items")
  .select(`
    id,
    user_id,
    quantity,
    shopposts!cart_items_product_id_fkey(
      id, url, jan, tag, name, price, image_url, stock, created_at, content
    )
  `)
  .eq("user_id", user.id);

// 複雑なデータ構造の正規化処理
const CartItems: CartItem[] = data?.map((item) => {
  // shopposts が配列かオブジェクトかを判定
  const shoppost = Array.isArray(item.shopposts) 
    ? item.shopposts[0] 
    : item.shopposts;

  return {
    id: shoppost?.id || item.id,
    user_id: item.user_id ?? "",
    image_url: shoppost?.image_url || "",
    name: shoppost?.name ?? null,
    // ... 他のプロパティのマッピング
    quantity: item.quantity,
    shopposts: shoppost ? {
      ...shoppost,
      user_id: item.user_id ?? ""
    } : shoppost,
  };
}) || [];
```

**解決策のポイント:**
- データベースJOIN結果の型安全性確保
- null/undefined チェックの徹底
- 配列とオブジェクトの両方に対応したデータ処理
- リアルタイムでのカート状態更新

### 3. Stripe決済とPrismaの連携
**課題**: Stripe Checkoutの成功後に購入履歴をデータベースに安全に記録する

```typescript
// app/api/checkout/success/route.ts
import prisma from "@/libs/prisma";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    // Stripe session情報取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.client_reference_id;
    const productId = session.metadata?.productId;

    // 重複購入防止
    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId, productId }
    });

    if (existingPurchase) {
      return NextResponse.json({ message: "すでに購入済みです" }, { status: 409 });
    }

    // トランザクション処理で購入記録作成
    const purchase = await prisma.purchase.create({
      data: {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        productId,
      }
    });

    return NextResponse.json({ message: "購入成功", purchase });
  } catch (error) {
    // エラーハンドリング
  }
}
```

**解決策のポイント:**
- Stripe WebhookとPrismaトランザクションの組み合わせ
- 重複購入防止ロジック
- エラー時のロールバック処理

### 4. 認証状態とカート連携
**課題**: ユーザーログイン状態とカート情報の同期、未認証時の適切な処理

```typescript
// 認証状態チェックとリダイレクト処理
useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    // 認証済みの場合のみカート情報を取得
    await fetchCart();
  };
  checkUser();
}, []);
```

## コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## お問い合わせ

プロジェクトに関する質問や提案がございましたら、[Issues](https://github.com/marumo333/runners-free/issues)までお知らせください。
