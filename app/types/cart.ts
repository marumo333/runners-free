// types/cart.ts
import type { Database } from '@/libs/database.types';

// shopposts テーブルの行型を alias
export type ShopPost = Database['public']['Tables']['shopposts']['Row'];

// カート内アイテム型
export type CartItem = {
  id: string; // cart_itemsのID
  user_id: string;
  quantity: number;
  shopposts: ShopPost | ShopPost[]; // ネストされた商品データ
  name?: string;
  price?: number | string;
  image_url?: string;
};