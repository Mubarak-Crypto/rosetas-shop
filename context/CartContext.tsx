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
  
  // ✨ ADDED THIS LINE (Fixes the red underline in CartSidebar)
  category: string; 
  
  // ✨ ADDED THIS LINE (Fixes the red underline)
  customText?: string; 
  
  // ✨ NEW: Store the promotion label (e.g., "2 for 50")
  promoLabel?: string;

  // ✨ NEW: Track the maximum available stock for this specific item
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
      // Check if item exists (matching ID and Options)
      const existing = prev.find((item) => 
        item.productId === newItem.productId && 
        JSON.stringify(item.options) === JSON.stringify(newItem.options) &&
        JSON.stringify(item.extras) === JSON.stringify(newItem.extras)
      );

      if (existing) {
        // ✨ LOGIC FIX: Check against maxStock before adding more
        const totalNewQuantity = existing.quantity + newItem.quantity;
        
        if (totalNewQuantity > newItem.maxStock) {
          alert(`Sorry, we only have ${newItem.maxStock} of these in stock.`);
          return prev; // Do not update
        }

        return prev.map((item) => 
          item.uniqueId === existing.uniqueId 
            ? { ...item, quantity: totalNewQuantity }
            : item
        );
      } else {
        // ✨ LOGIC FIX: Check initial add against stock
        if (newItem.quantity > newItem.maxStock) {
             alert(`Sorry, we only have ${newItem.maxStock} of these in stock.`);
             return prev;
        }
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
          const newQuantity = item.quantity + delta;
          
          // ✨ LOGIC FIX: Prevent going above maxStock
          if (newQuantity > item.maxStock) {
             alert(`Max stock reached (${item.maxStock}).`);
             return item;
          }

          return { ...item, quantity: Math.max(1, newQuantity) };
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

  // ✨ UPDATED: Intelligent Total Calculation
  const cartTotal = cart.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity;

    // Check if this item has a special "Bundle Deal" (e.g. "2 for 50")
    if (item.promoLabel) {
      // Regex to find patterns like "2 for 50", "2 für 50", "3 for €100"
      // Looks for a digit, then space, then 'for'/'für', then optional currency, then price digit
      const match = item.promoLabel.match(/(\d+)\s+(?:for|für)\s+€?(\d+)/i);

      if (match) {
        const requiredQty = parseInt(match[1]); // e.g. 2
        const bundlePrice = parseInt(match[2]); // e.g. 50

        if (requiredQty > 0 && item.quantity >= requiredQty) {
          const bundles = Math.floor(item.quantity / requiredQty);
          const remainder = item.quantity % requiredQty;
          
          // Calculate price: (Number of Bundles * Bundle Price) + (Remainder * Normal Price)
          itemTotal = (bundles * bundlePrice) + (remainder * item.price);
        }
      }
    }

    return sum + itemTotal;
  }, 0);

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