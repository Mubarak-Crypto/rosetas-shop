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
        const newExpiry = Date.now() + 15 * 60 * 1000;
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

  // ✨ HELPER: Reserve Stock in DB
  const reserveItemInDB = async (item: CartItem, qty: number) => {
    if (item.maxStock >= 999) return;
    
    const newExpiry = Date.now() + 15 * 60 * 1000;
    setCartExpiry(newExpiry); 
    
    const expiresAt = new Date(newExpiry).toISOString();

    await supabase.from('cart_reservations')
      .delete()
      .eq('session_id', sessionId)
      .eq('product_id', item.productId);

    if (qty > 0) {
      await supabase.from('cart_reservations').insert({
        session_id: sessionId,
        product_id: item.productId,
        quantity: qty,
        expires_at: expiresAt
      });
    }
  };

  const addToCart = (newItem: CartItem) => {
    if (cart.length === 0) {
        setCartExpiry(Date.now() + 15 * 60 * 1000);
    }

    setCart((prev) => {
      const existing = prev.find((item) => 
        item.productId === newItem.productId && 
        JSON.stringify(item.options) === JSON.stringify(newItem.options) &&
        JSON.stringify(item.extras) === JSON.stringify(newItem.extras)
      );

      if (existing) {
        const totalNewQuantity = existing.quantity + newItem.quantity;
        if (totalNewQuantity > newItem.maxStock) {
          alert(`Sorry, we only have ${newItem.maxStock} of these in stock.`);
          return prev; 
        }
        reserveItemInDB(newItem, totalNewQuantity);
        return prev.map((item) => item.uniqueId === existing.uniqueId ? { ...item, quantity: totalNewQuantity } : item);
      } else {
        if (newItem.quantity > newItem.maxStock) {
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
          if (newQuantity > item.maxStock) {
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
    if (sessionId) {
        await supabase.from('cart_reservations').delete().eq('session_id', sessionId);
    }
    setCart([]); 
    setCartExpiry(null); 
    localStorage.removeItem("rosetas_cart"); 
    localStorage.removeItem("rosetas_cart_expiry");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity;
    if (item.promoLabel) {
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