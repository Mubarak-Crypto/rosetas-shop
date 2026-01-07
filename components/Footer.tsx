"use client";

import { Facebook, Instagram, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus("loading");

    // Save email to Supabase
    const { error } = await supabase.from("newsletter").insert([{ email }]);

    if (error) {
      alert("Something went wrong. Please try again.");
      setStatus("idle");
    } else {
      setStatus("success");
      setEmail(""); // Clear the input
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* 1. Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter text-white">
            ROSETAS<span className="text-neon-rose">.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Hand-crafted luxury bouquets. <br />Made in Essen, Germany.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="https://instagram.com/Rosetas.bouquets" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-rose hover:text-white transition-all text-gray-400">
              <Instagram size={18} />
            </a>
            <a href="mailto:Rosetasbouquetsde@gmail.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-purple hover:text-white transition-all text-gray-400">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* 2. Shop Links */}
        <div>
          <h3 className="font-bold mb-6 text-white">Shop</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><a href="/#shop" className="hover:text-neon-rose transition-colors">Glitter Roses</a></li>
            <li><a href="/#shop" className="hover:text-neon-rose transition-colors">Galaxy Collection</a></li>
            <li><a href="/#shop" className="hover:text-neon-rose transition-colors">Plushie Bouquets</a></li>
          </ul>
        </div>

        {/* 3. IMPRESSUM (German Legal Requirement) */}
        <div>
          <h3 className="font-bold mb-6 text-white">Impressum</h3>
          <div className="space-y-4 text-sm text-gray-400">
            <p className="font-bold text-white">Angaben gemäß § 5 TMG</p>
            <p>Ashkab Albukaev<br />Carl Wolf Straße 7<br />45279 Essen</p>
            
            <div className="pt-2 space-y-2">
              <p className="flex items-center gap-2"><Phone size={14} /> 0155 65956604</p>
              <p className="flex items-center gap-2"><Mail size={14} /> Rosetasbouquetsde@gmail.com</p>
            </div>

            <p className="text-xs text-gray-500 pt-2">
              Steuernummer:<br />111/5339/6255
            </p>
          </div>
        </div>

        {/* 4. Newsletter (✨ NOW FUNCTIONAL) */}
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

      {/* Bottom Bar with Legal Links */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <p>&copy; 2026 Rosetas Bouquets.</p>
          
          {/* Legal Links (Required by Stripe) */}
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-neon-rose transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-neon-rose transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>

        <p>Verantwortlich: Ashkab Albukaev</p>
      </div>
    </footer>
  );
}