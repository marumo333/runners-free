// types/cart.ts
import type { Database } from '@/libs/database.types';

// shopposts テーブルの行型を alias
export type ShopPost = Database['public']['Tables']['shopposts']['Row'];

// カート内アイテム型
export type CartItem = ShopPost & {
  quantity: number;
};
