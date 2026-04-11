"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";

type CartItem = {
  productId: number;
  uniqueId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options: Record<string, string>;
  rawOptions?: Record<string, string>; 
  extras: string[];
  category: string; 
  customText?: string; 
  promoLabel?: string;
  maxStock: number; 
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
  sessionId: string;
  cartExpiry: number | null; 
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionId, setSessionId] = useState(""); 
  const [cartExpiry, setCartExpiry] = useState<number | null>(null); 

  useEffect(() => {
    // 1. Session ID
    let sid = localStorage.getItem("rosetas_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("rosetas_session_id", sid);
    }
    setSessionId(sid);

    // 2. Load Cart
    const savedCartJson = localStorage.getItem("rosetas_cart");
    const loadedCart = savedCartJson ? JSON.parse(savedCartJson) : [];
    if (savedCartJson) setCart(loadedCart);

    // 3. ✨ Load & Check Expiry
    // Note: Timer is kept for UI purposes but no longer locks database rows
    const savedExpiry = localStorage.getItem("rosetas_cart_expiry");
    
    if (savedExpiry) {
        const expiryTime = parseInt(savedExpiry);
        if (expiryTime < Date.now()) {
            // Expired while away
            setCart([]);
            localStorage.removeItem("rosetas_cart");
            localStorage.removeItem("rosetas_cart_expiry");
            setCartExpiry(null);
        } else {
            setCartExpiry(expiryTime);
        }
    } else if (loadedCart.length > 0) {
        // ✨ FIX: If items exist but no timer (legacy cart), start one now
        // 🕒 UPDATE: Changed reservation from 15 mins to 1 hour
        const newExpiry = Date.now() + 60 * 60 * 1000;
        setCartExpiry(newExpiry);
        localStorage.setItem("rosetas_cart_expiry", newExpiry.toString());
    }

    setIsLoaded(true);
  }, []);

  // Save Cart & Timer
  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem("rosetas_cart", JSON.stringify(cart));
        
        if (cart.length === 0) {
            localStorage.removeItem("rosetas_cart_expiry");
            setCartExpiry(null);
        } else if (cartExpiry) {
            localStorage.setItem("rosetas_cart_expiry", cartExpiry.toString());
        }
    }
  }, [cart, isLoaded, cartExpiry]);

  // ✨ UPDATED HELPER: Removed database insertion to prevent "Sold Out" hallucinations
  // Stock is now only deducted upon actual payment success via Stripe/Webhook
  const reserveItemInDB = async (item: CartItem, qty: number) => {
    if (item.maxStock >= 999) return;
    
    // We still maintain the local expiry for user urgency
    // 🕒 UPDATE: Changed reservation from 15 mins to 1 hour
    const newExpiry = Date.now() + 60 * 60 * 1000;
    setCartExpiry(newExpiry); 
    
    // DB Reservation logic removed to prevent locking stock for uncompleted orders
    // This fixes Issue #2 and #6 regarding inventory accuracy.
  };

  const addToCart = (newItem: CartItem) => {
    if (cart.length === 0) {
        // 🕒 UPDATE: Changed reservation from 15 mins to 1 hour
        setCartExpiry(Date.now() + 60 * 60 * 1000);
    }

    setCart((prev) => {
      const existing = prev.find((item) => 
        item.productId === newItem.productId && 
        JSON.stringify(item.options) === JSON.stringify(newItem.options) &&
        JSON.stringify(item.extras) === JSON.stringify(newItem.extras)
      );

      if (existing) {
        const totalNewQuantity = existing.quantity + newItem.quantity;
        // Check against maxStock (treated as unlimited if -1 or 999+)
        if (totalNewQuantity > newItem.maxStock && newItem.maxStock !== -1) {
          alert(`Sorry, we only have ${newItem.maxStock} of these in stock.`);
          return prev; 
        }
        reserveItemInDB(newItem, totalNewQuantity);
        return prev.map((item) => item.uniqueId === existing.uniqueId ? { ...item, quantity: totalNewQuantity } : item);
      } else {
        if (newItem.quantity > newItem.maxStock && newItem.maxStock !== -1) {
             alert(`Sorry, we only have ${newItem.maxStock} of these in stock.`);
             return prev;
        }
        reserveItemInDB(newItem, newItem.quantity);
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (uniqueId: string) => {
    const itemToRemove = cart.find(i => i.uniqueId === uniqueId);
    if (itemToRemove) {
        reserveItemInDB(itemToRemove, 0); 
    }
    setCart((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId: string, delta: number) => {
    setCart((prev) => 
      prev.map((item) => {
        if (item.uniqueId === uniqueId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity > item.maxStock && item.maxStock !== -1) {
              alert(`Max stock reached (${item.maxStock}).`);
              return item;
          }
          if (newQuantity > 0) {
              reserveItemInDB(item, newQuantity);
          }
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      })
    );
  };

  const clearCart = async () => {
    // Removed specific DB deletion to keep Supabase clean
    setCart([]); 
    setCartExpiry(null); 
    localStorage.removeItem("rosetas_cart"); 
    localStorage.removeItem("rosetas_cart_expiry");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Re-calculate cart total including bundle pricing promos
  const cartTotal = cart.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity;
    if (item.promoLabel) {
      // Parse promo label for "X for Y" deals (e.g., "3 for €50")
      const match = item.promoLabel.match(/(\d+)\s+(?:for|für)\s+€?(\d+)/i);
      if (match) {
        const requiredQty = parseInt(match[1]); 
        const bundlePrice = parseInt(match[2]); 
        if (requiredQty > 0 && item.quantity >= requiredQty) {
          const bundles = Math.floor(item.quantity / requiredQty);
          const remainder = item.quantity % requiredQty;
          itemTotal = (bundles * bundlePrice) + (remainder * item.price);
        }
      }
    }
    return sum + itemTotal;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen, sessionId, cartExpiry }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};