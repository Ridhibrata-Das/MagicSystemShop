"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product } from "@/types";
import { subscribeToAuth } from "@/services/authService";
import { getCart, syncCart, clearCart as clearFirestoreCart } from "@/services/cartService";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load from local storage initially
  useEffect(() => {
    const local = localStorage.getItem("magic_shop_cart");
    if (local) {
      try {
        setItems(JSON.parse(local));
      } catch (e) {
        console.error("Failed to parse local cart");
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for user auth changes and sync
  useEffect(() => {
    const unsub = subscribeToAuth(async (user) => {
      if (user) {
        setUserId(user.uid);
        const remoteCart = await getCart(user.uid);
        if (remoteCart && remoteCart.items.length > 0) {
          // Merge local and remote
          // For simplicity, we just take remote if it exists, otherwise keep local
          setItems(remoteCart.items);
        } else if (items.length > 0) {
          // Sync local items to newly logged in user
          await syncCart(user.uid, items);
        }
      } else {
        setUserId(null);
        // Clear items on logout or keep local? Standard ecommerce keeps local
        // but let's reset to local storage explicitly or empty to be safe
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync to appropriate storage when items change
  useEffect(() => {
    if (isLoading) return; // Don't persist empty initial state during load
    
    // Always persist to local storage for quick access
    localStorage.setItem("magic_shop_cart", JSON.stringify(items));
    
    // Sync to Firestore if authenticated
    if (userId) {
      syncCart(userId, items);
    }
  }, [items, userId, isLoading]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { productId: product.id, quantity, priceSnapshot: product.price }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    if (userId) {
      clearFirestoreCart(userId);
    }
    localStorage.removeItem("magic_shop_cart");
  };

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeItem, clearCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
