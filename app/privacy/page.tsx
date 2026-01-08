"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import

export default function PrivacyPage() {
  const { language } = useLanguage(); // ✨ Access current language

  return (
    /* ✅ FIXED: Theme Colors Updated to Cream & Ink to match the rest of the shop */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* ✅ FIXED: Title color updated for visibility on light background */}
        <h1 className="text-4xl font-serif font-bold text-[#1F1F1F] mb-8">
          {language === 'EN' ? "Privacy Policy" : "Datenschutzerklärung"}
        </h1>
        
        <div className="space-y-8 text-[#1F1F1F]/80 leading-relaxed">
          {language === 'EN' ? (
            /* --- ENGLISH VERSION --- */
            <>
              <section>
                <p className="text-sm text-[#1F1F1F]/40 mb-4">Last updated: January 2026</p>
                <p>
                  This Privacy Policy describes how Rosetas Bouquets (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from rosetas.com (the "Site").
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Collecting Personal Information</h2>
                <p>
                  When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li><strong>Device Information:</strong> Examples include version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.</li>
                  <li><strong>Order Information:</strong> Examples include name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Sharing Personal Information</h2>
                <p>
                  We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>We use <strong>Stripe</strong> to process payments securely.</li>
                  <li>We use <strong>Supabase</strong> to store order history securely.</li>
                  <li>We use shipping carriers (like <strong>DHL</strong>) to deliver your products.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Contact</h2>
                <p>
                  For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at rosetasbouquetsde@gmail.com.
                </p>
              </section>
            </>
          ) : (
            /* --- GERMAN VERSION --- */
            <>
              <section>
                <p className="text-sm text-[#1F1F1F]/40 mb-4">Zuletzt aktualisiert: Januar 2026</p>
                <p>
                  Diese Datenschutzerklärung beschreibt, wie Rosetas Bouquets (die „Website“, „wir“, „uns“ oder „unser“) Ihre personenbezogenen Daten sammelt, verwendet und offenlegt, wenn Sie die Website besuchen, unsere Dienste nutzen oder einen Kauf auf rosetas.com (die „Website“) tätigen.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Erhebung personenbezogener Daten</h2>
                <p>
                  Wenn Sie die Website besuchen, sammeln wir bestimmte Informationen über Ihr Gerät, Ihre Interaktion mit der Website und Informationen, die zur Abwicklung Ihrer Einkäufe erforderlich sind. Wir können auch zusätzliche Informationen sammeln, wenn Sie uns für den Kundensupport kontaktieren.
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li><strong>Geräteinformationen:</strong> Beispiele hierfür sind die Version des Webbrowsers, die IP-Adresse, die Zeitzone, Cookie-Informationen, welche Websites oder Produkte Sie ansehen, Suchbegriffe und wie Sie mit der Website interagieren.</li>
                  <li><strong>Bestellinformationen:</strong> Beispiele hierfür sind Name, Rechnungsadresse, Lieferadresse, Zahlungsinformationen (einschließlich Kreditkartennummern), E-Mail-Adresse und Telefonnummer.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Weitergabe personenbezogener Daten</h2>
                <p>
                  Wir geben Ihre personenbezogenen Daten an Dienstleister weiter, die uns bei der Bereitstellung unserer Dienste und der Erfüllung unserer Verträge mit Ihnen unterstützen, wie oben beschrieben. Zum Beispiel:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>Wir verwenden <strong>Stripe</strong>, um Zahlungen sicher abzuwickeln.</li>
                  <li>Wir verwenden <strong>Supabase</strong>, um die Bestellhistorie sicher zu speichern.</li>
                  <li>Wir nutzen Versandunternehmen (wie <strong>DHL</strong>), um Ihre Produkte auszuliefern.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Kontakt</h2>
                <p>
                  Für weitere Informationen über unsere Datenschutzpraktiken, wenn Sie Fragen haben oder wenn Sie eine Beschwerde einreichen möchten, kontaktieren Sie uns bitte per E-Mail unter rosetasbouquetsde@gmail.com.
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