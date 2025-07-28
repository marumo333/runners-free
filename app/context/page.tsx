"use client"
import React, { createContext, useContext, useState } from "react";
import type { CartItem,ShopPost } from "@/app/types/cart";

type CartContextType = {
    cart: CartItem[];
    addCart: (post: ShopPost) => void;
    removeCart: (post: ShopPost) => void;
}

const CartContext = createContext<CartContextType|undefined>(undefined)
export default function Context({ children }: { children: React.ReactNode }){
    const [cart,setCart] = useState<CartItem[]>([])

    const addCart = (post: ShopPost) => {
        setCart((prev: CartItem[]) => {
            const index = prev.findIndex((item) => item.id === post.id);
            if (index !== -1) {
                const next = [...prev];
                next[index].quantity += 1;
                return next;
            }
            return [...prev, { ...post, quantity: 1 }];
        });
    };

    const removeCart = (post:ShopPost) =>{
        setCart((prev: CartItem[]) => {
            const index = prev.findIndex((item) => item.id === post.id);
            if (index === -1) return prev;

            const next = [...prev];
            if(next[index].quantity > 1){
                next[index].quantity  -= 1;
                return next;
            }
            next.splice(index,1);
            return next;
        });
    }

    


    
    return(
    <>
    <CartContext.Provider value={{ cart, addCart, removeCart }}>
      {children}
    </CartContext.Provider>
    </>
    );
};
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};