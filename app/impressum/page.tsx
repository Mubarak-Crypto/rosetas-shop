"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import

export default function Impressum() {
  const { language, t } = useLanguage(); // ✨ Access current language and translation function

  return (
    /* ✅ FIXED: Theme Colors Updated to Cream & Ink to match the rest of the shop */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-[#1F1F1F]/40 hover:text-[#C9A24D] transition-colors mb-12 group font-bold uppercase tracking-wider"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {t('back_to_shop')}
        </Link>

        {/* ✅ FIXED: Title color updated for visibility on light background */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-[#1F1F1F]">
          Impressum<span className="text-[#C9A24D]">.</span>
        </h1>
        
        <div className="space-y-12 text-base md:text-lg">
          {/* Section 1: Legal Owner */}
          <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
              {language === 'EN' ? "Information according to § 5 TMG" : "Angaben gemäß § 5 TMG"}
            </h2>
            <p className="leading-relaxed text-[#1F1F1F]/70">
              {/* ✅ FIXED: Uses t('legal_business_type') to correctly show Einzelunternehmen in German */}
              <span className="text-[#1F1F1F] font-bold block mb-1">{t('legal_business_type')}</span>
              Ashkab Albukaev<br />
              Albert-Schweitzer-Str. 5<br />
              45279 Essen<br />
              Deutschland
            </p>
          </section>

          {/* Section 2: Contact */}
          <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
              {language === 'EN' ? "Contact" : "Kontakt"}
            </h2>
            <div className="space-y-2 text-[#1F1F1F]/70">
              <p>{language === 'EN' ? "Phone" : "Telefon"}: <span className="text-[#1F1F1F] font-bold">0155 65956604</span></p>
              <p>E-Mail: <span className="text-[#1F1F1F] font-bold">kontakt@rosetasbouquets.info</span></p>
            </div>
          </section>

          {/* Section 3: VAT ID */}
          <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
              {language === 'EN' ? "VAT ID" : "Umsatzsteuer-ID"}
            </h2>
            <p className="leading-relaxed text-[#1F1F1F]/70">
              {language === 'EN' 
                ? "VAT identification number according to § 27 a Value Added Tax Act:" 
                : "Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:"}
              <br />
              <strong className="text-[#1F1F1F]">UST-IdNr: DE451442586</strong>
            </p>
          </section>

          {/* Section 4: Dispute Resolution */}
          <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
              {language === 'EN' ? "Dispute Resolution" : "Streitschlichtung"}
            </h2>
            <p className="leading-relaxed text-[#1F1F1F]/70">
              {language === 'EN' 
                ? "The European Commission provides a platform for online dispute resolution (OS):" 
                : "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:"}
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#1F1F1F] font-bold underline decoration-[#C9A24D] underline-offset-4 hover:text-[#C9A24D] transition-colors ml-1"
              >
                https://ec.europa.eu/consumers/odr/
              </a>.<br />
              {language === 'EN' 
                ? "Our e-mail address can be found above in the impressum." 
                : "Unsere E-Mail-Adresse finden Sie oben im Impressum."}
            </p>
          </section>
        </div>
        
        {/* Simple Footer Note */}
        <div className="mt-20 pt-8 border-t border-black/5 text-[#1F1F1F]/40 text-xs italic font-medium">
          {language === 'EN' 
            ? "Responsible for content according to § 55 Abs. 2 RStV: Ashkab Albukaev" 
            : "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Ashkab Albukaev"}
        </div>
      </div>
    </div>
  );
}