"use client";

import { Instagram, Mail, Phone, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext"; 

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const { language, t } = useLanguage(); 
  
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
          .filter((cat): cat is string => 
            Boolean(cat) && 
            cat !== 'supplies' && 
            cat !== 'Floristenbedarf'
          );
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
    <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0a] pt-20 pb-10 overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#C9A24D]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        
        {/* 1. Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter" style={forceWhite}>
            ROSETAS<span className="text-[#D4C29A]">.</span> {/* ✨ Lighter Tone */}
          </h2>
          <div className="text-sm leading-relaxed space-y-2">
            <p className="font-bold" style={forceWhite}>
              {language === 'EN' ? "Hand-crafted luxury bouquets." : "Handgefertigte Luxus-Bouquets."}
            </p>
            <p className="flex items-start gap-2 mt-4" style={forceWhite}>
              <MapPin size={14} className="text-[#D4C29A] mt-1 flex-shrink-0" /> {/* ✨ Lighter Tone */}
              <span className="font-bold" style={forceWhite}>
                Essen, Germany
              </span>
            </p>
          </div>
          
          {/* ✨ UPDATED: SHINY & GLOWY BEIGE ICONS */}
          <div className="flex gap-4 pt-2">
            <a 
              href="https://instagram.com/Rosetas.bouquets" 
              target="_blank" 
              className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center transition-all duration-300 group hover:bg-[#2A2A2A]"
              style={{
                boxShadow: '0 0 15px rgba(205, 175, 149, 0.4), 0 0 30px rgba(205, 175, 149, 0.2)', /* Shiny beige glow */
              }}
            >
              <Instagram size={18} className="text-[#D4C29A] group-hover:text-white transition-colors" />
            </a>
            <a 
              href="mailto:kontakt@rosetasbouquets.info" 
              className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center transition-all duration-300 group hover:bg-[#2A2A2A]"
              style={{
                boxShadow: '0 0 15px rgba(205, 175, 149, 0.4), 0 0 30px rgba(205, 175, 149, 0.2)', /* Shiny beige glow */
              }}
            >
              <Mail size={18} className="text-[#D4C29A] group-hover:text-white transition-colors" />
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
                  {/* ✨ UPDATED: Hover color changed to #D4C29A */}
                  <Link href={`/shop?category=${encodeURIComponent(cat)}`} className="hover:text-[#D4C29A] transition-colors" style={forceWhite}>
                    {cat}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/shop" className="hover:text-[#D4C29A] transition-colors" style={forceWhite}>{language === 'EN' ? "Glitter Roses" : "Glitzer Rosen"}</Link></li>
                <li><Link href="/shop" className="hover:text-[#D4C29A] transition-colors" style={forceWhite}>{language === 'EN' ? "Plush Bouquets" : "Plüsch Bouquets"}</Link></li>
              </>
            )}
            
            <li>
              <Link href="/supplies" className="hover:text-[#D4C29A] transition-colors" style={forceWhite}>
                {t('nav_supplies')}
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Customer Care */}
        <div>
          <h3 className="font-bold mb-6 uppercase tracking-widest text-sm" style={forceWhite}>{t('footer_contact')}</h3>
          <div className="space-y-4 text-sm">
            <p className="text-[#D4C29A] text-xs uppercase tracking-widest mb-2 font-black"> {/* ✨ Lighter Tone */}
              {language === 'EN' ? "Need Help?" : "Brauchst du Hilfe?"}
            </p>
            
            <a href="tel:+4915565956604" className="flex items-center gap-3 hover:text-[#D4C29A] transition-colors">
              <Phone size={16} className="text-[#D4C29A]" /> 
              <span className="font-bold" style={forceWhite}>0155 65956604</span>
            </a>
            
            <a href="mailto:kontakt@rosetasbouquets.info" className="flex items-center gap-3 hover:text-[#D4C29A] transition-colors">
              <Mail size={16} className="text-[#D4C29A]" /> 
              <span className="font-bold" style={forceWhite}>kontakt@rosetasbouquets.info</span>
            </a>
            
            <div className="pt-4">
              {/* ✨ UPDATED: Decoration color changed to #D4C29A */}
              <Link href="/impressum" className="text-xs hover:text-[#D4C29A] underline decoration-[#D4C29A] underline-offset-4 font-bold" style={forceWhite}>
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
            <div className="text-[#D4C29A] font-bold text-sm animate-in fade-in bg-[#D4C29A]/10 p-3 rounded-lg border border-[#D4C29A]/20">
              {language === 'EN' ? "✨ You are on the list!" : "✨ Du bist auf der Liste!"}
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder={language === 'EN' ? "Enter your email" : "E-Mail eingeben"} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // ✨ UPDATED: Focus border color
                className="bg-white/10 border border-white/40 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-[#D4C29A] transition-colors text-white placeholder:text-white/60 font-bold"
              />
              <button 
                onClick={handleSubscribe}
                disabled={status === "loading"}
                // ✨ UPDATED: Button Hover color
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-black hover:bg-[#D4C29A] hover:text-white transition-colors disabled:opacity-50 min-w-[60px] flex justify-center items-center shadow-lg"
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
          <p className="font-bold" style={forceWhite}>&copy; 2026 Rosetas Bouquets. {t('footer_rights')}</p>
          
          <div className="flex gap-6 font-bold">
            <Link href="/impressum" className="hover:text-[#D4C29A] transition-colors" style={forceWhite}>{t('footer_impressum')}</Link>
            <Link href="/terms" className="hover:text-[#D4C29A] transition-colors" style={forceWhite}>{t('footer_terms')}</Link>
            <Link href="/privacy" className="hover:text-[#D4C29A] transition-colors" style={forceWhite}>{t('footer_policy')}</Link>
          </div>
        </div>

        <p className="font-bold" style={forceWhite}>
          {language === 'EN' ? "Responsible: Ashkab Albukaev" : "Verantwortlich: Ashkab Albukaev"}
        </p>
      </div>
    </footer>
  );
}