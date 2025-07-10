// app/cart/page.tsx
import { Button, Card } from '@mantine/core';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useCart } from '../hooks/useCart';
import type { CartItem } from '../types/cart';

const Cart: NextPage = () => {
  const { cart, addCart, removeCart } = useCart();

  return (
    <div>
      <header className="px-8 py-4 shadow-md">
        <h1>カートの詳細</h1>
      </header>

      <div className="flex flex-wrap gap-4 p-8">
        {cart.map((item: CartItem) => (
          <Card key={item.id} shadow="md" className="w-80">
            {/* 商品名*/}
            <div className="flex justify-between items-end">
              <h4>{item.name ?? '商品名'}</h4>
              <div className="text-sm">{item.user_id}</div>
            </div>

            {/* 価格 */}
            <div className="mt-3 font-bold text-xl">
              ¥{item.price ?? 0}
            </div>

            {/* 画像 */}
            <div className="relative h-52">
              <Image
                src={item.image_url || '/placeholder.png'}
                alt={item.name ?? ''}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            {/* 数量操作 */}
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="light"
                color="blue"
                radius={9999}
                onClick={() => addCart(item)}
              >
                ＋
              </Button>
              <span>{item.quantity}</span>
              <Button
                variant="light"
                color="red"
                radius={9999}
                onClick={() => removeCart(item)}
              >
                ー
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Cart;
