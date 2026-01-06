"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CartItem = {
  productId: number;
  uniqueId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options: Record<string, string>;
  extras: string[];
  
  // ✨ ADDED THIS LINE (Fixes the red underline)
  customText?: string; 
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Cart
  useEffect(() => {
    const savedCart = localStorage.getItem("rosetas_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    setIsLoaded(true);
  }, []);

  // Save Cart
  useEffect(() => {
    if (isLoaded) localStorage.setItem("rosetas_cart", JSON.stringify(cart));
  }, [cart, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.uniqueId === newItem.uniqueId);
      if (existing) {
        return prev.map((item) => 
          item.uniqueId === newItem.uniqueId 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (uniqueId: string) => {
    setCart((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId: string, delta: number) => {
    setCart((prev) => 
      prev.map((item) => {
        if (item.uniqueId === uniqueId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]); // Wipes the state
    localStorage.removeItem("rosetas_cart"); // Wipes the memory
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};