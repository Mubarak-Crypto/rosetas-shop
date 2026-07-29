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
  // ✨ ADDED: Product Classification Flags for Checkout Gatekeeper
  is_addon?: boolean;
  is_supply?: boolean;
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
  // ✨ ADDED: To expose checkout validation to the UI
  cartValidationErrors: string[]; 
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionId, setSessionId] = useState(""); 
  
  // ✨ ADDED: State to track if cart meets all rules (like the €80 threshold)
  const [cartValidationErrors, setCartValidationErrors] = useState<string[]>([]);

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

    // 3. ✨ Load & Check Expiry (REMOVED)
    // Note: Timer is completely removed as requested by the client.
    // Carts will no longer expire. We clean up old expiry data here just in case.
    localStorage.removeItem("rosetas_cart_expiry");
    
    
    
    
    
    

    setIsLoaded(true);
  }, []);

  // Save Cart
  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem("rosetas_cart", JSON.stringify(cart));
        
        
        
        
        
    }
  }, [cart, isLoaded]);

  // ✨ UPDATED HELPER: Removed database insertion to prevent "Sold Out" hallucinations
  // Stock is now only deducted upon actual payment success via Stripe/Webhook
  const reserveItemInDB = async (item: CartItem, qty: number) => {
    if (item.maxStock >= 999) return;
    
    // We no longer maintain the local expiry for user urgency
    
    
    
    
    // DB Reservation logic removed to prevent locking stock for uncompleted orders
    // This fixes Issue #2 and #6 regarding inventory accuracy.
  };

  const addToCart = (newItem: CartItem) => {
    // ✨ ADDED: Logic Gate (The Guardrail) for Add-ons like Makeup
    if (newItem.is_addon) {
      // A "Main Gift" is anything that is NOT an addon and NOT a supply
      const hasMainGift = cart.some(item => !item.is_addon && !item.is_supply);
      if (!hasMainGift) {
         alert("Makeup items are exclusive add-ons! Please select a bouquet or basket first to include this in your gift.");
         return; // Stop the addition completely
      }
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
    
    setCart((prev) => {
       const newCart = prev.filter((item) => item.uniqueId !== uniqueId);
       
       // ✨ ADDED: Safety Logic (The "Cart Bouncer")
       // Check if deleting this item left the cart without a main gift
       const hasMainGift = newCart.some(item => !item.is_addon && !item.is_supply);
       const hasAddon = newCart.some(item => item.is_addon);
       
       if (!hasMainGift && hasAddon) {
           // Wait a tiny bit so the user isn't confused by an instant flash, then alert and remove
           setTimeout(() => alert("Makeup add-ons require a bouquet or basket and have been removed from your cart."), 150);
           return newCart.filter(item => !item.is_addon);
       }
       
       return newCart;
    });
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

  // ✨ ADDED: Validation Engine for wholesale supply threshold (€80) AND Makeup Add-ons
  // This constantly monitors the cart to ensure ALL rules are respected
  useEffect(() => {
    const errors: string[] = [];
    const hasSupply = cart.some(item => item.is_supply);
    
    // ✨ NEW: Gatekeeper Failsafe for Makeup
    const hasAddon = cart.some(item => item.is_addon);
    const hasMainGift = cart.some(item => !item.is_addon && !item.is_supply);
    
    if (hasSupply && cartTotal < 80) {
        errors.push("Florist supplies require a minimum cart total of €80 to checkout.");
    }
    
    // ✨ NEW: If somehow a makeup item exists without a main gift, throw an error
    if (hasAddon && !hasMainGift) {
        errors.push("Makeup items are exclusive add-ons! Please select a bouquet or basket first.");
    }
    
    setCartValidationErrors(errors);
  }, [cart, cartTotal]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen, sessionId, cartValidationErrors }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};