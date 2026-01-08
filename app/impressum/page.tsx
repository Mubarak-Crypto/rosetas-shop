import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-rose selection:text-black">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-neon-rose transition-colors mb-12 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-white">
          Impressum<span className="text-neon-rose">.</span>
        </h1>
        
        <div className="space-y-12 text-base md:text-lg">
          {/* Section 1: Legal Owner */}
          <section className="border-l border-white/10 pl-6 hover:border-neon-rose transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neon-rose mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="leading-relaxed text-gray-300">
              <span className="text-white font-bold block mb-1">Rosetas Bouquets</span>
              Ashkab Albukaev<br />
              Albert-Schweitzer-Str. 5<br />
              4579 Essen<br />
              Deutschland
            </p>
          </section>

          {/* Section 2: Contact */}
          <section className="border-l border-white/10 pl-6 hover:border-neon-rose transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neon-rose mb-4">Kontakt</h2>
            <div className="space-y-2 text-gray-300">
              <p>Telefon: <span className="text-white">0155 65956604</span></p>
              <p>E-Mail: <span className="text-white">kontakt@rosetasbouquets.info</span></p>
            </div>
          </section>

          {/* Section 3: VAT ID */}
          <section className="border-l border-white/10 pl-6 hover:border-neon-rose transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neon-rose mb-4">Umsatzsteuer-ID</h2>
            <p className="leading-relaxed text-gray-300">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              <strong className="text-white">UST-IdNr: DE451442586</strong>
            </p>
          </section>

          {/* Section 4: Dispute Resolution */}
          <section className="border-l border-white/10 pl-6 hover:border-neon-rose transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neon-rose mb-4">Streitschlichtung</h2>
            <p className="leading-relaxed text-gray-300">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white underline decoration-neon-rose underline-offset-4 hover:text-neon-rose transition-colors ml-1"
              >
                https://ec.europa.eu/consumers/odr/
              </a>.<br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>
        </div>
        
        {/* Simple Footer Note */}
        <div className="mt-20 pt-8 border-t border-white/5 text-gray-600 text-xs italic">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Ashkab Albukaev
        </div>
      </div>
    </div>
  );
}