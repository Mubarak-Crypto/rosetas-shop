"use client";

import { Instagram, Mail, Phone, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext"; // ✨ Added Language Import

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const { language, t } = useLanguage(); // ✨ Access translation functions
  
  const [categories, setCategories] = useState<string[]>([]);

  // ✅ HELPER: Using direct Hex and Opacity to bypass global dimming
  const forceWhite = { color: '#FFFFFF', opacity: 1 };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active');

      if (data) {
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
      alert(language === 'EN' ? "Something went wrong. Please try again." : "Etwas ist schiefgelaufen. Bitte erneut versuchen.");
      setStatus("idle");
    } else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0a] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* 1. Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter" style={forceWhite}>
            ROSETAS<span className="text-[#C9A24D]">.</span>
          </h2>
          <div className="text-sm leading-relaxed space-y-2">
            {/* ✅ FIXED: Description Visibility */}
            <p className="font-bold" style={forceWhite}>
              {language === 'EN' ? "Hand-crafted luxury bouquets." : "Handgefertigte Luxus-Bouquets."}
            </p>
            {/* ✅ FIXED: Address Visibility */}
            <p className="flex items-start gap-2 mt-4" style={forceWhite}>
              <MapPin size={14} className="text-[#C9A24D] mt-1 flex-shrink-0" />
              <span className="font-bold" style={forceWhite}>
               Essen, Germany
              </span>
            </p>
          </div>
          <div className="flex gap-4 pt-2">
            <a href="https://instagram.com/Rosetas.bouquets" target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A24D] hover:text-white transition-all">
              <Instagram size={18} style={forceWhite} />
            </a>
            <a href="mailto:kontakt@rosetasbouquets.info" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A24D] hover:text-white transition-all">
              <Mail size={18} style={forceWhite} />
            </a>
          </div>
        </div>

        {/* 2. Shop Links */}
        <div>
          <h3 className="font-bold mb-6 uppercase tracking-widest text-sm" style={forceWhite}>{t('nav_shop')}</h3>
          <ul className="space-y-4 text-sm font-bold">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat}>
                  <Link href={`/shop?category=${encodeURIComponent(cat)}`} className="hover:text-[#C9A24D] transition-colors" style={forceWhite}>
                    {language === 'EN' && cat === "Floristenbedarf" ? "Florist Supplies" : cat}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/shop" className="hover:text-[#C9A24D] transition-colors" style={forceWhite}>{language === 'EN' ? "Glitter Roses" : "Glitzer Rosen"}</Link></li>
                <li><Link href="/shop" className="hover:text-[#C9A24D] transition-colors" style={forceWhite}>{language === 'EN' ? "Plush Bouquets" : "Plüsch Bouquets"}</Link></li>
              </>
            )}
            {/* Added Supplies link for visibility */}
            <li>
              <Link href="/supplies" className="hover:text-[#C9A24D] transition-colors" style={forceWhite}>
                {t('nav_supplies')}
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Customer Care */}
        <div>
          <h3 className="font-bold mb-6 uppercase tracking-widest text-sm" style={forceWhite}>{t('footer_contact')}</h3>
          <div className="space-y-4 text-sm">
            <p className="text-[#C9A24D] text-xs uppercase tracking-widest mb-2 font-black">
              {language === 'EN' ? "Need Help?" : "Brauchst du Hilfe?"}
            </p>
            
            {/* ✅ FIXED: Phone Visibility */}
            <a href="tel:+4915565956604" className="flex items-center gap-3 hover:text-[#C9A24D] transition-colors">
              <Phone size={16} className="text-[#C9A24D]" /> 
              <span className="font-bold" style={forceWhite}>0155 65956604</span>
            </a>
            
            {/* ✅ FIXED: Email Visibility */}
            <a href="mailto:kontakt@rosetasbouquets.info" className="flex items-center gap-3 hover:text-[#C9A24D] transition-colors">
              <Mail size={16} className="text-[#C9A24D]" /> 
              <span className="font-bold" style={forceWhite}>kontakt@rosetasbouquets.info</span>
            </a>
            
            <div className="pt-4">
              <Link href="/impressum" className="text-xs hover:text-[#C9A24D] underline decoration-[#C9A24D] underline-offset-4 font-bold" style={forceWhite}>
                {language === 'EN' ? "View Legal Notice (Impressum)" : "Impressum ansehen"}
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Newsletter */}
        <div>
          <h3 className="font-bold mb-6 uppercase tracking-widest text-sm" style={forceWhite}>{language === 'EN' ? "Stay Exclusive" : "Exklusiv bleiben"}</h3>
          <p className="text-sm mb-4 font-bold" style={forceWhite}>
            {language === 'EN' ? "Join the VIP list for new drops." : "Trage dich in die VIP-Liste für neue Drops ein."}
          </p>
          
          {status === "success" ? (
            <div className="text-[#C9A24D] font-bold text-sm animate-in fade-in bg-[#C9A24D]/10 p-3 rounded-lg border border-[#C9A24D]/20">
              {language === 'EN' ? "✨ You are on the list!" : "✨ Du bist auf der Liste!"}
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder={language === 'EN' ? "Enter your email" : "E-Mail eingeben"} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border border-white/40 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-[#C9A24D] transition-colors text-white placeholder:text-white/60 font-bold"
              />
              <button 
                onClick={handleSubscribe}
                disabled={status === "loading"}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-black hover:bg-[#C9A24D] hover:text-white transition-colors disabled:opacity-50 min-w-[60px] flex justify-center items-center shadow-lg"
              >
                {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : (language === 'EN' ? "Join" : "Beitreten")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] gap-4">
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* ✅ FIXED: Copyright Visibility */}
          <p className="font-bold" style={forceWhite}>&copy; 2026 Rosetas Bouquets. {t('footer_rights')}</p>
          
          <div className="flex gap-6 font-bold">
            <Link href="/impressum" className="hover:text-[#C9A24D] transition-colors" style={forceWhite}>{t('footer_impressum')}</Link>
            <Link href="/terms" className="hover:text-[#C9A24D] transition-colors" style={forceWhite}>{t('footer_terms')}</Link>
            <Link href="/privacy" className="hover:text-[#C9A24D] transition-colors" style={forceWhite}>{t('footer_policy')}</Link>
          </div>
        </div>

        {/* ✅ FIXED: Responsible Name Visibility */}
        <p className="font-bold" style={forceWhite}>
          {language === 'EN' ? "Responsible: Ashkab Albukaev" : "Verantwortlich: Ashkab Albukaev"}
        </p>
      </div>
    </footer>
  );
}