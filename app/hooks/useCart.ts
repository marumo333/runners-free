// hooks/useCart.ts
import { useState } from 'react';
import type { CartItem, ShopPost } from '../types/cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addCart = (post: ShopPost) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === post.id);
      if (idx !== -1) {
        // 既存アイテム：quantity をインクリメント
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      // 新規アイテム：quantity 1 で追加
      return [...prev, { ...post, quantity: 1 }];
    });
  };

  const removeCart = (post: ShopPost) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === post.id);
      if (idx === -1) return prev;
      const next = [...prev];
      if (next[idx].quantity > 1) {
        next[idx].quantity -= 1;
        return next;
      }
      // quantity が 1 → 配列から削除
      next.splice(idx, 1);
      return next;
    });
  };

  return { cart, addCart, removeCart };
}
