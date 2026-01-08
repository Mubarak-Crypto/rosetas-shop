"use client";

import { Instagram, Mail, Phone, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  
  // ✨ NEW: Dynamic Categories State
  const [categories, setCategories] = useState<string[]>([]);

  // ✨ NEW: Fetch Categories logic to ensure footer matches Admin selection
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active');

      if (data) {
        // Filter out "supplies", remove duplicates, and sort
        const uniqueCategories = Array.from(new Set(data.map(item => item.category)))
          .filter((cat): cat is string => Boolean(cat) && cat !== 'supplies');
        setCategories(uniqueCategories.sort());
      }
    };
    fetchCategories();
  }, []);

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus("loading");

    const { error } = await supabase.from("newsletter").insert([{ email }]);

    if (error) {
      alert("Something went wrong. Please try again.");
      setStatus("idle");
    } else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/90 backdrop-blur-xl pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* 1. Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter text-white">
            ROSETAS<span className="text-neon-rose">.</span>
          </h2>
          <div className="text-gray-400 text-sm leading-relaxed space-y-2">
            <p>Hand-crafted luxury bouquets.</p>
            <p className="flex items-start gap-2 opacity-80">
              <MapPin size={14} className="text-neon-rose mt-1 flex-shrink-0" />
              <span>Albert-Schweitzer-Str. 5<br />4579 Essen, Germany</span>
            </p>
          </div>
          <div className="flex gap-4 pt-2">
            <a href="https://instagram.com/Rosetas.bouquets" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-rose hover:text-white transition-all text-gray-400">
              <Instagram size={18} />
            </a>
            <a href="mailto:kontakt@rosetasbouquets.info" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-rose hover:text-white transition-all text-gray-400">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* 2. Shop Links (NOW DYNAMIC) */}
        <div>
          <h3 className="font-bold mb-6 text-white">Shop</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat}>
                  <Link href={`/shop?category=${encodeURIComponent(cat)}`} className="hover:text-neon-rose transition-colors">
                    {cat}
                  </Link>
                </li>
              ))
            ) : (
              <li><Link href="/shop" className="hover:text-neon-rose transition-colors">All Collections</Link></li>
            )}
          </ul>
        </div>

        {/* 3. Customer Care */}
        <div>
          <h3 className="font-bold mb-6 text-white">Contact</h3>
          <div className="space-y-4 text-sm text-gray-400">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Need Help?</p>
            
            <a href="tel:+4915565956604" className="flex items-center gap-3 hover:text-white transition-colors">
              <Phone size={16} className="text-neon-rose" /> 
              <span>0155 65956604</span>
            </a>
            
            <a href="mailto:kontakt@rosetasbouquets.info" className="flex items-center gap-3 hover:text-white transition-colors">
              <Mail size={16} className="text-neon-rose" /> 
              <span>kontakt@rosetasbouquets.info</span>
            </a>
            
            <div className="pt-4">
              <Link href="/impressum" className="text-xs text-gray-500 hover:text-white underline decoration-gray-700 underline-offset-4">
                View Legal Notice (Impressum)
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Newsletter */}
        <div>
          <h3 className="font-bold mb-6 text-white">Stay Exclusive</h3>
          <p className="text-gray-400 text-sm mb-4">Join the VIP list for new drops.</p>
          
          {status === "success" ? (
            <div className="text-neon-rose font-bold text-sm animate-in fade-in bg-neon-rose/10 p-3 rounded-lg border border-neon-rose/20">
              ✨ You are on the list!
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-neon-rose transition-colors text-white"
              />
              <button 
                onClick={handleSubscribe}
                disabled={status === "loading"}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 min-w-[60px] flex justify-center items-center"
              >
                {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Join"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <p>&copy; 2026 Rosetas Bouquets.</p>
          
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-neon-rose transition-colors">
              Impressum
            </Link>
            <Link href="/terms" className="hover:text-neon-rose transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-neon-rose transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>

        <p className="opacity-50">Verantwortlich: Ashkab Albukaev</p>
      </div>
    </footer>
  );
}