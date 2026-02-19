"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ShippingPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans">
     
      
      <main className="max-w-4xl mx-auto px-6 py-32">
        {/* ADD THIS BACK BUTTON RIGHT HERE */}
        <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#1F1F1F]/40 hover:text-[#C9A24D] transition-colors mb-12 group font-bold uppercase tracking-wider"
         >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'EN' ? "Back to Shop" : "Zurück zum Shop"}
        </Link>
                {/* ------------------------------- */}

        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-center">
          {language === 'EN' ? "Shipping & Payment Terms" : "Versand- und Zahlungsbedingungen"}
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-black/5 text-[#1F1F1F]/80 leading-relaxed">
          {language === 'EN' ? (
            /* ================= ENGLISH VERSION ================= */
            <div className="space-y-8">
              {/* SHIPPING POLICY */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-6">Shipping Policy</h2>
                
                <h3 className="text-lg font-bold text-[#1F1F1F] mt-6 mb-2">Germany:</h3>
                <p className="font-semibold mb-2">Normal shipping:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>up to 10kg: 11,49 €</li>
                  <li>over 10 kg to 20kg: 19,49 €</li>
                </ul>
                <p className="font-semibold mb-2">Express delivery is only available for delivery addresses within Germany.</p>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  <li>up to 10kg: 40,00 €</li>
                  <li>over 10 kg to 20kg: 45,00 €</li>
                </ul>
                <p className="mb-4">For deliveries abroad (except United States of America) express shipping is not possible. The delivery time for express shipping is usually 1-2 working days, unless otherwise stated for the respective product. The additional costs for express shipping will be charged to the customer displayed transparently in the ordering process.</p>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-2">EU Countries:</h3>
                <p className="mb-2 text-sm italic">(Belgium, Bulgaria, Greece, Italy, Ireland, Croatia, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Sweden, Slovakia, Slovenia, Spain, Czech Republic, Hungary, Cyprus)</p>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  <li>up to 10 kg: 25,00 €</li>
                  <li>over 10 kg to 20 kg: 32,00 €</li>
                </ul>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-4">Different shipping costs for specific EU countries:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="font-bold">Denmark:</p>
                    <ul className="list-disc pl-5"><li>up to 10 kg: 24,00 €</li><li>over 10 kg to 20 kg: 30,00 €</li></ul>
                  </div>
                  <div>
                    <p className="font-bold">Estonia & Finland:</p>
                    <ul className="list-disc pl-5"><li>up to 10 kg: 25,00 €</li><li>over 10 kg to 20 kg: 32,00 €</li></ul>
                  </div>
                  <div>
                    <p className="font-bold">France:</p>
                    <ul className="list-disc pl-5"><li>up to 10 kg: 24,49 €</li><li>over 10 kg to 20 kg: 29,99 €</li></ul>
                  </div>
                  <div>
                    <p className="font-bold">Austria:</p>
                    <ul className="list-disc pl-5"><li>up to 10 kg: 19,00 €</li><li>over 10 kg to 20 kg: 25,00 €</li></ul>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-4">Other International Shipping Costs:</h3>
                <ul className="space-y-4">
                  <li><strong>Switzerland:</strong> up to 10 kg: 35,00 € | over 10 kg to 20 kg: 51,00 €</li>
                  <li><strong>Island, Liechtenstein:</strong> up to 10 kg: 39,00 € | over 10 kg to 20 kg: 54,00 €</li>
                  <li><strong>Albania, Bosnia & Herzegovina, Norway, Turkey, Ukraine:</strong> up to 10 kg: 40,00 € | over 10 kg to 20 kg: 55,00 €</li>
                  <li><strong>Kosovo, Moldova:</strong> up to 10 kg: 39,00 € | over 10 kg to 20 kg: 55,00 €</li>
                  <li><strong>Egypt, Algeria:</strong> up to 10 kg: 65,00 € | over 10 kg to 20 kg: 78,00 €</li>
                  <li><strong>Morocco, Tunisia:</strong> up to 10 kg: 55,00 € | over 10 kg to 20 kg: 78,00 €</li>
                  <li><strong>South Africa, Senegal, Cameroon, Kenya, Nigeria, UAE, Saudi Arabia, Qatar, Oman, Kuwait:</strong> up to 10 kg: 65,00 € | over 10 kg to 20 kg: 105,00 €</li>
                  <li><strong>China:</strong> up to 10 kg: 80,00 € | over 10 kg to 20 kg: 150,00 €</li>
                  <li><strong>Hong Kong:</strong> up to 10 kg: 68,00 € | over 10 kg to 20 kg: 104,00 €</li>
                  <li><strong>Japan, India, Thailand, Vietnam, Indonesia, Malaysia, Singapore, Sri Lanka, Philippines, Taiwan, Maldives:</strong> up to 10 kg: 65,00 € | over 10 kg to 20 kg: 105,00 €</li>
                  <li><strong>Fiji:</strong> up to 10 kg: 98,00 € | over 10 kg to 20 kg: 180,00 €</li>
                  <li><strong>French Polynesia:</strong> up to 10 kg: 99,00 € | over 10 kg to 20 kg: 180,00 €</li>
                  <li><strong>Chile:</strong> up to 10 kg: 79,00 € | over 10 kg to 20 kg: 150,00 €</li>
                </ul>

                <div className="bg-[#F6EFE6] p-4 rounded-lg mt-6 border border-[#EBE6DF]">
                  <p className="font-bold text-red-600 mb-2">United States of America: (Attention only express shipping possible)</p>
                  <ul className="list-disc pl-5">
                    <li>up to 5kg: 110,00 €</li>
                    <li>up to 10kg: 150,00 €</li>
                    <li>over 10 kg to 20kg: 210,00 €</li>
                  </ul>
                </div>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-2">Note on customs duties and import duties</h3>
                <p>For deliveries to countries outside the European Union, additional customs duties, taxes or fees apply. These are to be borne by the customer and not in the purchase price or shipping costs.</p>
              </section>

              <hr className="border-black/10 my-10" />

              {/* PAYMENT TERMS */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-6">Payment Processing / Payment Terms</h2>
                <p className="mb-4">Payment is processed via:</p>
                <address className="not-italic bg-[#F9F9F9] p-4 rounded-lg border border-black/5 mb-6">
                  <strong>Stripe Payments Europe, Ltd.</strong><br />
                  1 Grand Canal Street Lower<br />
                  Grand Canal Dock<br />
                  Dublin 2<br />
                  Ireland
                </address>

                <p className="mb-2">As part of the payment processing, the following data is processed, among others:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Name</li>
                  <li>Invoice amount</li>
                  <li>Payment details</li>
                  <li>IP address</li>
                  <li>E-mail address</li>
                </ul>

                <p className="mb-4">Stripe sets technically necessary cookies (e.g. __stripe_mid, __stripe_sid) as part of the payment process, which are necessary for fraud prevention, ensuring payment security and for performing strong customer authentication (SCA / 3D Secure).</p>
                <p className="mb-4">The data transfer takes place on the basis of Art. 6 (1) (b) GDPR (performance of a contract) and – if necessary – Art. 6 (1) (f) GDPR (legitimate interest in secure and efficient payment processing). Stripe may also transfer data to the United States. The transfer is based on the applicable data protection mechanisms (e.g. EU-US Data Privacy Framework or standard contractual clauses).</p>
                <p className="mb-6">Stripe&apos;s privacy policy can be viewed at: <a href="https://stripe.com/de/privacy" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">https://stripe.com/de/privacy</a></p>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-2">Available Payment Methods</h3>
                <p className="mb-2">Depending on the country of delivery, device and order configuration, the following may be available:</p>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
                  <li>Apple Pay</li>
                  <li>Google Pay</li>
                  <li>Klarna (Buy Now, Pay Later)</li>
                </ul>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Credit, Debit Card</h4>
                    <p className="text-sm mt-1">Stripe processes the payment data to complete the transaction as well as to prevent fraud and comply with legal requirements. We ourselves do not receive complete map data and do not store it.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Klarna (PayNow, Pay later)</h4>
                    <p className="text-sm mt-1">Payment processing is carried out by Klarna Bank AB (publ), Sveavägen 46, 111 34 Stockholm, Sweden. Klarna may carry out a credit check. For more information, please refer to Klarna&apos;s privacy policy at <a href="https://www.klarna.com" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">klarna.com</a>.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Google Pay</h4>
                    <p className="text-sm mt-1">Payment will be processed through the Google Pay service of Google Ireland Limited. Google does not receive full payment data such as full card numbers. Processing is carried out in accordance with Google&apos;s privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">policies.google.com/privacy</a>.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Apple Pay</h4>
                    <p className="text-sm mt-1">Payment processing is carried out via the Apple Pay service of Apple Inc. Apple does not receive complete payment information such as credit card numbers. Data processing is carried out in accordance with Apple&apos;s privacy policy: <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">apple.com/legal/privacy</a>.</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* ================= GERMAN VERSION ================= */
            <div className="space-y-8">
              {/* VERSANDBEDINGUNGEN */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-6">Versandbedingungen</h2>
                
                <h3 className="text-lg font-bold text-[#1F1F1F] mt-6 mb-2">Deutschland:</h3>
                <p className="font-semibold mb-2">Normaler Versand:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>bis 10kg: 11,49 €</li>
                  <li>über 10 kg bis 20kg: 19,49 €</li>
                </ul>
                <p className="font-semibold mb-2">Der Expressversand ist ausschließlich für Lieferadressen innerhalb Deutschlands verfügbar.</p>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  <li>bis 10kg: 40,00 €</li>
                  <li>über 10 kg bis 20kg: 45,00 €</li>
                </ul>
                <p className="mb-4">Für Lieferungen ins Ausland (außer Vereinigte Staaten von Amerika) ist kein Expressversand möglich. Die Lieferzeit beim Expressversand beträgt in der Regel 1–2 Werktage, sofern beim jeweiligen Produkt nichts Abweichendes angegeben ist. Die zusätzlichen Kosten für den Expressversand werden dem Kunden im Bestellprozess transparent angezeigt.</p>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-2">EU-Länder:</h3>
                <p className="mb-2 text-sm italic">(Belgien, Bulgarien, Griechenland, Italien, Irland, Kroatien, Lettland, Litauen, Luxemburg, Malta, Niederlande, Polen, Portugal, Rumänien, Schweden, Slowakei, Slowenien, Spanien, Tschechische Republik, Ungarn, Zypern)</p>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  <li>bis 10 kg: 25,00 €</li>
                  <li>über 10 kg bis 20 kg: 32,00 €</li>
                </ul>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-4">Abweichende Versandkosten bei den EU-Ländern:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="font-bold">Dänemark:</p>
                    <ul className="list-disc pl-5"><li>bis 10 kg: 24,00 €</li><li>über 10 kg bis 20 kg: 30,00 €</li></ul>
                  </div>
                  <div>
                    <p className="font-bold">Estland & Finnland:</p>
                    <ul className="list-disc pl-5"><li>bis 10 kg: 25,00 €</li><li>über 10 kg bis 20 kg: 32,00 €</li></ul>
                  </div>
                  <div>
                    <p className="font-bold">Frankreich:</p>
                    <ul className="list-disc pl-5"><li>bis 10 kg: 24,49 €</li><li>über 10 kg bis 20 kg: 29,99 €</li></ul>
                  </div>
                  <div>
                    <p className="font-bold">Österreich:</p>
                    <ul className="list-disc pl-5"><li>bis 10kg: 19,00 €</li><li>über 10 kg bis 20kg: 25,00 €</li></ul>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-4">Sonstige Versandkosten:</h3>
                <ul className="space-y-4">
                  <li><strong>Schweiz:</strong> bis 10 kg: 35,00 € | über 10 kg bis 20 kg: 51,00 €</li>
                  <li><strong>Island, Liechtenstein:</strong> bis 10 kg: 39,00 € | über 10 kg bis 20 kg: 54,00 €</li>
                  <li><strong>Albanien, Bosnien & Herzegowina, Norwegen, Türkei, Ukraine:</strong> bis 10 kg: 40,00 € | über 10 kg bis 20 kg: 55,00 €</li>
                  <li><strong>Kosovo, Moldau:</strong> bis 10 kg: 39,00 € | über 10 kg bis 20 kg: 55,00 €</li>
                  <li><strong>Ägypten, Algerien:</strong> bis 10 kg: 65,00 € | über 10 kg bis 20 kg: 78,00 €</li>
                  <li><strong>Marokko, Tunesien:</strong> bis 10 kg: 55,00 € | über 10 kg bis 20 kg: 78,00 €</li>
                  <li><strong>Südafrika, Senegal, Kamerun, Kenia, Nigeria, VAE, Saudi-Arabien, Katar, Oman, Kuwait:</strong> bis 10 kg: 65,00 € | über 10 kg bis 20 kg: 105,00 €</li>
                  <li><strong>China:</strong> bis 10 kg: 80,00 € | über 10 kg bis 20 kg: 150,00 €</li>
                  <li><strong>Hongkong:</strong> bis 10 kg: 68,00 € | über 10 kg bis 20 kg: 104,00 €</li>
                  <li><strong>Japan, Indien, Thailand, Vietnam, Indonesien, Malaysia, Singapur, Sri Lanka, Philippinen, Taiwan, Malediven:</strong> bis 10 kg: 65,00 € | über 10 kg bis 20 kg: 105,00 €</li>
                  <li><strong>Fidschi:</strong> bis 10 kg: 98,00 € | über 10 kg bis 20 kg: 180,00 €</li>
                  <li><strong>Französisch-Polynesien:</strong> bis 10 kg: 99,00 € | über 10 kg bis 20 kg: 180,00 €</li>
                  <li><strong>Chile:</strong> bis 10 kg: 79,00 € | über 10 kg bis 20 kg: 150,00 €</li>
                </ul>

                <div className="bg-[#F6EFE6] p-4 rounded-lg mt-6 border border-[#EBE6DF]">
                  <p className="font-bold text-red-600 mb-2">Vereinigte Staaten von Amerika: (Achtung nur Express-Versand möglich)</p>
                  <ul className="list-disc pl-5">
                    <li>bis 5kg: 110,00 €</li>
                    <li>bis 10kg: 150,00 €</li>
                    <li>über 10 kg bis 20kg: 210,00 €</li>
                  </ul>
                </div>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-2">Hinweis zu Zöllen und Einfuhrabgaben</h3>
                <p>Bei Lieferungen in Länder außerhalb der Europäischen Union können zusätzliche Zölle, Steuern oder Gebühren anfallen. Diese sind vom Kunden zu tragen und nicht im Kaufpreis oder den Versandkosten enthalten.</p>
              </section>

              <hr className="border-black/10 my-10" />

              {/* ZAHLUNGSBEDINGUNGEN */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-6">Zahlungsabwicklung / Zahlungsbedingungen</h2>
                <p className="mb-4">Die Zahlungsabwicklung erfolgt über:</p>
                <address className="not-italic bg-[#F9F9F9] p-4 rounded-lg border border-black/5 mb-6">
                  <strong>Stripe Payments Europe, Ltd.</strong><br />
                  1 Grand Canal Street Lower<br />
                  Grand Canal Dock<br />
                  Dublin 2<br />
                  Irland
                </address>

                <p className="mb-2">Im Rahmen der Zahlungsabwicklung werden u. a. folgende Daten verarbeitet:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Name</li>
                  <li>Rechnungsbetrag</li>
                  <li>Zahlungsdaten</li>
                  <li>IP-Adresse</li>
                  <li>E-Mail-Adresse</li>
                </ul>

                <p className="mb-4">Stripe setzt im Rahmen des Bezahlvorgangs technisch notwendige Cookies (z. B. __stripe_mid, __stripe_sid), die zur Betrugsprävention, Sicherstellung der Zahlungssicherheit sowie zur Durchführung starker Kundenauthentifizierung (SCA / 3D Secure) erforderlich sind.</p>
                <p className="mb-4">Die Datenübermittlung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie – soweit erforderlich – Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und effizienten Zahlungsabwicklung). Stripe kann Daten auch in die USA übermitteln. Die Übermittlung erfolgt auf Basis der geltenden datenschutzrechtlichen Mechanismen (z. B. EU‑US Data Privacy Framework oder Standardvertragsklauseln).</p>
                <p className="mb-6">Die Datenschutzerklärung von Stripe ist einsehbar unter: <a href="https://stripe.com/de/privacy" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">https://stripe.com/de/privacy</a></p>

                <h3 className="text-lg font-bold text-[#1F1F1F] mt-8 mb-2">Verfügbare Zahlungsarten</h3>
                <p className="mb-2">Abhängig vom Lieferland, Gerät und der Bestellkonfiguration können folgende Zahlungsarten zur Verfügung stehen:</p>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  <li>Kredit- und Debitkarten (Visa, Mastercard, American Express)</li>
                  <li>Apple Pay</li>
                  <li>Google Pay</li>
                  <li>Klarna (Buy Now, Pay Later)</li>
                </ul>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Kredit- Debitkarte</h4>
                    <p className="text-sm mt-1">Stripe verarbeitet die Zahlungsdaten zur Durchführung der Transaktion sowie zur Betrugsprävention und Einhaltung gesetzlicher Vorgaben. Wir selbst erhalten keine vollständigen Kartendaten und speichern diese auch nicht.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Klarna (PayNow, Pay later)</h4>
                    <p className="text-sm mt-1">Die Zahlungsabwicklung erfolgt über die Klarna Bank AB (publ), Sveavägen 46, 111 34 Stockholm, Schweden. Klarna führt ggf. eine Bonitätsprüfung durch. Weitere Informationen findest Du in den Datenschutzbestimmungen von Klarna unter <a href="https://www.klarna.com" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">klarna.com</a>.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Google Pay</h4>
                    <p className="text-sm mt-1">Die Zahlungsabwicklung erfolgt über den Dienst Google Pay der Google Ireland Limited. Google erhält keine vollständigen Zahlungsdaten wie vollständige Kartennummern. Die Verarbeitung erfolgt gemäß den Datenschutzbestimmungen von Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">policies.google.com/privacy</a>.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">Apple Pay</h4>
                    <p className="text-sm mt-1">Die Zahlungsabwicklung erfolgt über den Dienst Apple Pay der Apple Inc. Apple erhält keine vollständigen Zahlungsinformationen wie Kreditkartennummern. Die Datenverarbeitung erfolgt gemäß den Datenschutzbestimmungen von Apple: <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">apple.com/legal/privacy/</a>.</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

   
    </div>
  );
}