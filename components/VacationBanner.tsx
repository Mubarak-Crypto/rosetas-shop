"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plane, CalendarClock } from "lucide-react"; // ✨ Added CalendarClock for better visual context
import { useLanguage } from "../context/LanguageContext";

export default function VacationBanner() {
  const [vacationData, setVacationData] = useState<any>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('storefront_settings')
        .select('is_vacation_mode_active, vacation_message, vacation_end_date')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      
      if (data) setVacationData(data);
    };
    fetchSettings();
  }, []);

  if (!vacationData?.is_vacation_mode_active) return null;

  return (
    // ✨ UPGRADED VISUALS: Soft Beige background with Ink text (Removed the heavy black)
    <div className="relative z-50 bg-[#F6EFE6] text-[#1F1F1F] overflow-hidden border-b border-[#1F1F1F]/5 shadow-sm animate-in slide-in-from-top-full duration-700 ease-out">
       
       {/* Decorative Background Glow (Subtle Gold/Warmth) */}
       <div className="absolute top-0 left-1/4 w-96 h-full bg-[#C9A24D]/5 blur-3xl rounded-full pointer-events-none" />

       <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center md:text-left relative">
          
          {/* Animated Icon Container - Kept Gold for visibility */}
          <div className="flex-shrink-0 bg-[#C9A24D] text-white p-2 rounded-xl shadow-[0_4px_10px_rgba(201,162,77,0.2)] animate-bounce-slow">
             <Plane size={18} fill="currentColor" className="transform -rotate-45" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm font-medium tracking-wide">
             
             {/* The Main Message */}
             <span className="font-bold text-[#1F1F1F] text-base md:text-lg">
                {vacationData.vacation_message}
             </span>

             {/* The Date (if exists) - Adapted colors for light background */}
             {vacationData.vacation_end_date && (
                <div className="flex items-center justify-center gap-2 bg-[#1F1F1F]/5 px-3 py-1 rounded-lg border border-[#1F1F1F]/10 backdrop-blur-sm mt-1 md:mt-0">
                   <CalendarClock size={14} className="text-[#C9A24D]" />
                   <span className="opacity-80 text-xs md:text-sm text-[#1F1F1F]">
                      {language === 'EN' ? 'Shipping resumes:' : 'Versand ab:'} 
                      <span className="font-bold text-[#1F1F1F] ml-1.5 underline decoration-[#C9A24D] decoration-2 underline-offset-4">
                         {new Date(vacationData.vacation_end_date).toLocaleDateString()}
                      </span>
                   </span>
                </div>
             )}
          </div>

       </div>
    </div>
  );
}