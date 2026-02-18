"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function RamadanBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isVisible || !mounted) return null;

  return (
    <div className="relative w-full z-50 overflow-hidden bg-[#F5F1E8]">
      
      {/* --- 1. THE MAIN ARTWORK (FULL WIDTH & HIGH QUALITY) --- */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] z-10">
        <Image 
          src="/finalbanner.jpg" 
          alt="Ramadan Mubarak"
          fill
          className="object-cover object-center" 
          priority
          unoptimized 
        />
      </div>

      {/* --- ✨ REFINED SMOOTH TRANSITIONS --- */}
      {/* Top subtle fade to soften the top edge */}
      <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-[#F6EFE6]/30 to-transparent pointer-events-none z-20" />
      
      {/* Bottom fade: Starts lower down to keep the text clear, then blends into the page without a border */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#F5F1E8] via-[#F5F1E8]/20 to-transparent pointer-events-none z-20" />

      {/* --- 2. CLOSE BUTTON --- */}
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-6 top-6 p-2 rounded-full bg-white/40 hover:bg-white/80 text-[#5D4037] transition-all cursor-pointer backdrop-blur-md z-50 shadow-md"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 3. NO BORDER LINE - The bottom is now just the smooth gradient transition */}

    </div>
  );
}