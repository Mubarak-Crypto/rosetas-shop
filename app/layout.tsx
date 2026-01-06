import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer"; // <--- IMPORT THE FOOTER

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rosetas Bouquets - Luxury Glitter Roses",
  description: "Hand-crafted satin roses from Essen, Germany.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {/* 1. The Main Content of the page */}
          {children}

          {/* 2. The Slide-out Cart (Hidden until clicked) */}
          <CartSidebar /> 
          
          {/* 3. The Footer (Now visible at the bottom) */}
          <Footer /> 
        </CartProvider>
      </body>
    </html>
  );
}