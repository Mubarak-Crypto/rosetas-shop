"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

export default function FloristCommunityModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    website: "",
    interestedInCourses: true
  });

  useEffect(() => {
    // Check if user has already seen/closed this modal in this session
    const hasSeenModal = sessionStorage.getItem("rosetas_florist_modal_seen");
    
    if (!hasSeenModal) {
      // Delay showing it slightly for better UX (e.g. 2 seconds)
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("rosetas_florist_modal_seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('florist_leads').insert([
      {
        business_name: formData.businessName,
        email: formData.email,
        website: formData.website,
        interested_in_courses: formData.interestedInCourses
      }
    ]);

    if (!error) {
      setHasSubmitted(true);
      // Close automatically after success message
      setTimeout(() => {
        handleClose();
      }, 3000);
    } else {
      alert("Error submitting. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto z-[70] w-[90%] max-w-md h-fit bg-[#F6EFE6] rounded-[2rem] border border-black/5 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-10"
            >
              <X size={18} className="text-[#1F1F1F]" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              
              {!hasSubmitted ? (
                <>
                  <div className="w-12 h-12 bg-[#D4C29A]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4C29A]">
                    <Sparkles size={24} />
                  </div>

                  <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">
                    {language === 'EN' ? "Are you a Florist?" : "Sind Sie Florist?"}
                  </h2>
                  <p className="text-sm text-[#1F1F1F]/60 mb-6 font-medium leading-relaxed">
                    {language === 'EN' 
                      ? "Let's connect! Join our professional community to get updates on premium supplies and upcoming masterclasses." 
                      : "Lassen Sie uns vernetzen! Treten Sie unserer Community bei für Updates zu Premium-Zubehör und kommenden Masterclasses."}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder={language === 'EN' ? "Business Name (e.g. Rosetas)" : "Firmenname (z.B. Rosetas)"}
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none font-medium"
                    />
                    
                    <input 
                      type="email" 
                      required
                      placeholder={language === 'EN' ? "Email Address" : "E-Mail-Adresse"}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none font-medium"
                    />

                    <input 
                      type="text" 
                      placeholder={language === 'EN' ? "Website / Instagram (Optional)" : "Website / Instagram (Optional)"}
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none font-medium"
                    />

                    <label className="flex items-start gap-3 text-left p-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.interestedInCourses}
                          onChange={(e) => setFormData({...formData, interestedInCourses: e.target.checked})}
                          className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-black/20 checked:border-[#C9A24D] checked:bg-[#C9A24D] transition-all"
                        />
                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <span className="text-xs text-[#1F1F1F]/60 font-medium group-hover:text-[#1F1F1F] transition-colors leading-tight">
                        {language === 'EN' 
                          ? "Keep me updated on future online courses & workshops." 
                          : "Informieren Sie mich über zukünftige Online-Kurse & Workshops."}
                      </span>
                    </label>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#1F1F1F] text-white font-bold py-3 rounded-xl hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      {language === 'EN' ? "Connect" : "Vernetzen"}
                    </button>
                  </form>
                  
                  <button onClick={handleClose} className="mt-4 text-[10px] font-bold text-[#1F1F1F]/30 hover:text-[#1F1F1F] uppercase tracking-widest transition-colors">
                    {language === 'EN' ? "No thanks, just browsing" : "Nein danke, nur stöbern"}
                  </button>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12"
                >
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">
                    {language === 'EN' ? "Welcome to the Family!" : "Willkommen in der Familie!"}
                  </h3>
                  <p className="text-sm text-[#1F1F1F]/60">
                    {language === 'EN' ? "We'll keep you posted on new drops." : "Wir halten dich auf dem Laufenden."}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}