"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Impressum() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-[#1F1F1F]/40 hover:text-[#C9A24D] transition-colors mb-12 group font-bold uppercase tracking-wider"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {language === 'EN' ? "Back to Shop" : "Zurück zum Shop"}
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-[#1F1F1F]">
          {language === 'EN' ? "Imprint" : "Impressum"}<span className="text-[#C9A24D]">.</span>
        </h1>
        
        <div className="space-y-12 text-base md:text-lg">
          {language === 'EN' ? (
            /* ================= ENGLISH VERSION ================= */
            <>
              {/* Section 1: Legal Owner */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  Responsible for the content of the websites in accordance with the DDG:
                </h2>
                <p className="leading-relaxed text-[#1F1F1F]/70">
                  <strong className="text-[#1F1F1F] block mb-1">Askhab Albukaev</strong>
                  trading under the name Rosetas Bouquets<br />
                  Albert-Schweitzer-Str. 5<br />
                  45279 Essen<br />
                  Germany
                </p>
              </section>

              {/* Section 2: Contact */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  Contact
                </h2>
                <div className="space-y-2 text-[#1F1F1F]/70">
                  <p>Phone: <span className="text-[#1F1F1F] font-bold">+49 155 65956604</span></p>
                  <p>Email: <a href="mailto:kontakt@rosetasbouquets.info" className="text-[#1F1F1F] font-bold hover:text-[#C9A24D] transition-colors">kontakt@rosetasbouquets.info</a></p>
                </div>
              </section>

              {/* Section 3: VAT ID & Note */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  VAT Information
                </h2>
                <p className="leading-relaxed text-[#1F1F1F]/70 mb-4">
                  VAT identification number according to § 27a UStG:<br />
                  <strong className="text-[#1F1F1F]">DE451442586</strong>
                </p>
                <div className="bg-white p-4 rounded-lg border border-black/5 text-sm">
                  <strong className="text-[#1F1F1F] block mb-1">Note on VAT:</strong>
                  If no VAT is shown, this is done on the basis of the application of the small business regulation according to sec. 19 of the German VAT Act.
                </div>
              </section>

              {/* Section 4: Disclaimer */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  Disclaimer
                </h2>
                <p className="leading-relaxed text-[#1F1F1F]/70 text-sm">
                  We cannot assume any liability for links on our websites. At the time the links were created, all websites were free of illegal content. Nevertheless, we distance ourselves completely from the linked pages, as we cannot influence the creation, design and content representations on our part. If a linked website violates applicable jurisdiction, we ask you to notify us immediately.
                </p>
              </section>
            </>
          ) : (
            /* ================= GERMAN VERSION ================= */
            <>
              {/* Section 1: Legal Owner */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  Verantwortlich für den Inhalt der Webseiten gemäß DDG:
                </h2>
                <p className="leading-relaxed text-[#1F1F1F]/70">
                  <strong className="text-[#1F1F1F] block mb-1">Askhab Albukaev</strong>
                  handelnd unter der Firma Rosetas Bouquets<br />
                  Albert-Schweitzer-Str. 5<br />
                  45279 Essen<br />
                  Deutschland
                </p>
              </section>

              {/* Section 2: Contact */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  Kontakt
                </h2>
                <div className="space-y-2 text-[#1F1F1F]/70">
                  <p>Telefon: <span className="text-[#1F1F1F] font-bold">+49 155 65956604</span></p>
                  <p>E-Mail: <a href="mailto:kontakt@rosetasbouquets.info" className="text-[#1F1F1F] font-bold hover:text-[#C9A24D] transition-colors">kontakt@rosetasbouquets.info</a></p>
                </div>
              </section>

              {/* Section 3: VAT ID & Note */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  Umsatzsteuer-Informationen
                </h2>
                <p className="leading-relaxed text-[#1F1F1F]/70 mb-4">
                  Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
                  <strong className="text-[#1F1F1F]">DE451442586</strong>
                </p>
                <div className="bg-white p-4 rounded-lg border border-black/5 text-sm">
                  <strong className="text-[#1F1F1F] block mb-1">Hinweis zur Umsatzsteuer:</strong>
                  Sofern keine Umsatzsteuer ausgewiesen ist, erfolgt dies aufgrund der Anwendung der Kleinunternehmerregelung gemäß § 19 UStG.
                </div>
              </section>

              {/* Section 4: Disclaimer */}
              <section className="border-l border-black/10 pl-6 hover:border-[#C9A24D] transition-colors">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C9A24D] mb-4">
                  Haftungsausschluss
                </h2>
                <p className="leading-relaxed text-[#1F1F1F]/70 text-sm">
                  Für Links auf unseren Webseiten können wir keine Haftung übernehmen. Zum Zeitpunkt der Linksetzung waren sämtliche Webseiten frei von illegalen Inhalten. Trotzdem distanzieren wir uns in vollem Maße von den verlinkten Seiten, da auf Erstellung, Gestaltung und inhaltliche Darstellungen unsererseits kein Einfluss genommen werden kann. Sollte eine verlinkte Webseite gegen geltende Rechtsprechung verstoßen, bitten wir um unverzügliche Benachrichtigung.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}