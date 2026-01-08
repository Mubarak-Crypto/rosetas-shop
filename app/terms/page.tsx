"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import

export default function TermsPage() {
  const { language } = useLanguage(); // ✨ Access current language

  return (
    /* ✅ FIXED: Theme Colors Updated to Cream & Ink to match the rest of the shop */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* ✅ FIXED: Title color updated for visibility on light background */}
        <h1 className="text-4xl font-serif font-bold text-[#1F1F1F] mb-8">
          {language === 'EN' ? "Terms of Service" : "Allgemeine Geschäftsbedingungen"}
        </h1>
        
        <div className="space-y-8 text-[#1F1F1F]/80 leading-relaxed">
          {language === 'EN' ? (
            /* --- ENGLISH VERSION --- */
            <>
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Overview</h2>
                <p>
                  This website is operated by Rosetas Bouquets. Throughout the site, the terms “we”, “us” and “our” refer to Rosetas Bouquets. Rosetas Bouquets offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Online Store Terms</h2>
                <p>
                  By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Products & Services</h2>
                <p>
                  Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
                </p>
                <p className="mt-4">
                  We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Shipping & Delivery</h2>
                <p>
                  We utilize third-party carriers (such as DHL) for shipping. Delivery times are estimates and start from the date of shipping, rather than the date of order.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Changes to Terms</h2>
                <p>
                  You can review the most current version of the Terms of Service at any time at this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.
                </p>
              </section>
            </>
          ) : (
            /* --- GERMAN VERSION --- */
            <>
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Überblick</h2>
                <p>
                  Diese Website wird von Rosetas Bouquets betrieben. Auf der gesamten Website beziehen sich die Begriffe „wir“, „uns“ und „unser“ auf Rosetas Bouquets. Rosetas Bouquets bietet diese Website an, einschließlich aller Informationen, Tools und Dienste, die auf dieser Website für Sie, den Benutzer, verfügbar sind, unter der Bedingung, dass Sie alle hier angegebenen Bedingungen, Richtlinien und Hinweise akzeptieren.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Bedingungen für den Online-Shop</h2>
                <p>
                  Durch die Zustimmung zu diesen Nutzungsbedingungen erklären Sie, dass Sie in Ihrem Wohnsitzland mindestens volljährig sind. Sie dürfen unsere Produkte weder für illegale oder nicht autorisierte Zwecke nutzen, noch dürfen Sie bei der Nutzung des Dienstes gegen Gesetze in Ihrer Gerichtsbarkeit verstoßen.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Produkte & Dienstleistungen</h2>
                <p>
                  Bestimmte Produkte oder Dienstleistungen sind möglicherweise ausschließlich online über die Website verfügbar. Diese Produkte oder Dienstleistungen sind möglicherweise nur in begrenzten Mengen verfügbar und können nur gemäß unserer Rückgaberichtlinie zurückgegeben oder umgetauscht werden.
                </p>
                <p className="mt-4">
                  Wir haben uns bemüht, die Farben und Bilder unserer Produkte, die im Shop erscheinen, so genau wie möglich darzustellen. Wir können nicht garantieren, dass die Anzeige jeder Farbe auf Ihrem Computermonitor korrekt ist.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Versand & Lieferung</h2>
                <p>
                  Wir nutzen Drittanbieter (wie DHL) für den Versand. Lieferzeiten sind Schätzungen und beginnen ab dem Versanddatum, nicht ab dem Bestelldatum.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Änderungen der Bedingungen</h2>
                <p>
                  Die aktuellste Version der Nutzungsbedingungen können Sie jederzeit auf dieser Seite einsehen. Wir behalten uns das Recht vor, nach eigenem Ermessen Teile dieser Nutzungsbedingungen zu aktualisieren, zu ändern oder zu ersetzen, indem wir Aktualisierungen und Änderungen auf unserer Website veröffentlichen.
                </p>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}