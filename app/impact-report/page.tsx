"use client";

import Navbar from "@/components/Navbar";
// Footer import removed to prevent duplication
import { motion } from "framer-motion";
import { Droplets, Heart, HandHeart, CheckCircle, ArrowRight, Calendar, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext"; 

// Define the shape of a project from your Database
type Project = {
  id: string;
  title: string;
  title_de?: string; // ✨ Added German Title
  description: string;
  description_de?: string; // ✨ Added German Desc
  image_url: string;
  created_at: string;
};

// Define the Page Content (Hero, Stats, Pledge)
type PageContent = {
  hero_title: string; hero_title_de: string;
  hero_subtitle: string; hero_subtitle_de: string;
  stat_1_value: string; stat_1_label: string; stat_1_label_de: string;
  stat_2_value: string; stat_2_label: string; stat_2_label_de: string;
  stat_3_value: string; stat_3_label: string; stat_3_label_de: string;
  pledge_title: string; pledge_title_de: string;
  pledge_text: string; pledge_text_de: string;
};

export default function ImpactReportPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<PageContent | null>(null); // ✨ Store Page Settings
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage(); 

  // ✨ Fetch Data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Global Content (Hero, Stats, Pledge)
        const { data: contentData } = await supabase
            .from('charity_content')
            .select('*')
            .eq('id', '00000000-0000-0000-0000-000000000000') // ✨ Force it to get the row you are editing
            .single();
        
        if (contentData) setContent(contentData);

        // 2. Fetch Projects List
        const { data: projectData } = await supabase
          .from('charity_projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectData) setProjects(projectData);

      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✨ Helper to pick the right text based on language
  const getText = (en: string | undefined, de: string | undefined, fallback: string) => {
      if (language === 'EN') return en || fallback;
      return de || en || fallback;
  };

  if (isLoading) {
      return (
        <main className="min-h-screen bg-[#F6EFE6] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#E3D7C5] selection:text-[#1F1F1F]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E3D7C5]/30 text-[#1F1F1F] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#E3D7C5]"
          >
             <span className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F] animate-pulse" />
             {language === 'EN' ? "Transparency Report 2024-2025" : "Transparenzbericht 2024-2025"}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-extrabold text-[#1F1F1F] tracking-tight"
          >
            {/* ✨ Dynamic Hero Title */}
            {getText(content?.hero_title, content?.hero_title_de, "Beauty With A Purpose.")}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#1F1F1F]/60 max-w-2xl mx-auto leading-relaxed font-medium whitespace-pre-line"
          >
            {/* ✨ Dynamic Hero Subtitle */}
            {getText(
                content?.hero_subtitle, 
                content?.hero_subtitle_de, 
                "We believe luxury shouldn't just look good—it should do good."
            )}
          </motion.p>
        </div>
      </section>

      {/* STATS GRID (Dynamic) */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { 
                  // Stat 1 (Droplets)
                  value: content?.stat_1_value || "05", 
                  label: getText(content?.stat_1_label, content?.stat_1_label_de, "Wells Constructed"), 
                  icon: Droplets 
                },
                { 
                  // Stat 2 (HandHeart)
                  value: content?.stat_2_value || "150+", 
                  label: getText(content?.stat_2_label, content?.stat_2_label_de, "Families Supported"), 
                  icon: HandHeart 
                },
                { 
                  // Stat 3 (Heart)
                  value: content?.stat_3_value || "10%", 
                  label: getText(content?.stat_3_label, content?.stat_3_label_de, "Donated to Charity"), 
                  icon: Heart, 
                },
            ].map((stat, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[2rem] p-8 border border-[#1F1F1F]/5 text-center shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="w-12 h-12 bg-[#F6EFE6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#1F1F1F]">
                        <stat.icon size={24} strokeWidth={1.5} />
                    </div>
                    <div className="text-4xl font-serif font-bold text-[#1F1F1F] mb-2">{stat.value}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-[#1F1F1F]/40">{stat.label}</div>
                </motion.div>
            ))}
        </div>
      </section>

      {/* DYNAMIC PROJECTS LIST */}
      {projects.length > 0 ? (
        <div className="space-y-0"> {/* Container for stack of projects */}
            {projects.map((project, index) => {
                // Zig-zag logic: If index is odd (1, 3, 5...), image goes to right.
                const isEven = index % 2 === 0;

                return (
                    <section key={project.id} className="px-6 py-20 bg-white border-y border-[#1F1F1F]/5 first:border-t-0">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                
                                {/* Image Side - Order swaps based on index */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className={`relative rounded-[2.5rem] overflow-hidden aspect-[4/3] group shadow-2xl ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
                                >
                                    <img 
                                        src={project.image_url || "/water-well.jpg"} 
                                        alt={project.title} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-[#1F1F1F] flex items-center gap-2 shadow-lg">
                                        <CheckCircle size={14} className="text-green-500" />
                                        {language === 'EN' ? "Verified Project" : "Verifiziertes Projekt"}
                                    </div>
                                </motion.div>

                                {/* Text Side */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className={`space-y-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 text-[#D4C29A] font-black uppercase tracking-widest text-xs mb-4">
                                            <MapPin size={14} /> 
                                            {language === 'EN' ? `Project #${String(projects.length - index).padStart(3, '0')} • Active` : `Projekt #${String(projects.length - index).padStart(3, '0')} • Aktiv`}
                                        </div>
                                        {/* ✨ Dynamic Project Title */}
                                        <h2 className="text-4xl font-serif font-bold text-[#1F1F1F] mb-4">
                                            {getText(project.title, project.title_de, project.title)}
                                        </h2>
                                        {/* ✨ Dynamic Project Description */}
                                        <p className="text-[#1F1F1F]/60 text-lg leading-relaxed whitespace-pre-line">
                                            {getText(project.description, project.description_de, project.description)}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#F6EFE6] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1F1F1F]">{language === 'EN' ? "Timeline" : "Zeitraum"}</h4>
                                                <p className="text-sm text-[#1F1F1F]/50">
                                                    {new Date(project.created_at).toLocaleDateString(language === 'EN' ? 'en-US' : 'de-DE', { year: 'numeric', month: 'long' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#F6EFE6] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <Heart size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1F1F1F]">{language === 'EN' ? "Impact" : "Auswirkung"}</h4>
                                                <p className="text-sm text-[#1F1F1F]/50">
                                                    {language === 'EN' 
                                                      ? "Your purchases made this possible. 10% of profits went directly to this cause."
                                                      : "Ihre Einkäufe haben das ermöglicht. 10% des Gewinns gingen direkt an diesen Zweck."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
      ) : (
        <div className="text-center py-20 px-6">
            <p className="text-[#1F1F1F]/40 italic">{language === 'EN' ? "New projects are being updated..." : "Neue Projekte werden aktualisiert..."}</p>
        </div>
      )}

      {/* UPCOMING PROJECTS / PLEDGE (Dynamic) */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold text-[#1F1F1F]">
              {getText(content?.pledge_title, content?.pledge_title_de, "Our Commitment Continues")}
            </h2>
            <p className="text-[#1F1F1F]/60 text-lg leading-relaxed whitespace-pre-line">
                {getText(
                    content?.pledge_text, 
                    content?.pledge_text_de, 
                    "This is just the beginning. Every order you place helps us reach our next goal."
                )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/shop">
                    <button className="px-8 py-4 bg-[#1F1F1F] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#D4C29A] hover:text-[#1F1F1F] transition-all flex items-center gap-2 shadow-xl">
                        {language === 'EN' ? "Shop & Support" : "Einkaufen & Helfen"} <ArrowRight size={14} />
                    </button>
                </Link>
            </div>
        </div>
      </section>

      {/* Footer Removed here because it is already in layout.tsx */}
    </main>
  );
}