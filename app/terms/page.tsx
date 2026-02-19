"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
    
      
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
          {language === 'EN' ? "Terms & Conditions" : "Allgemeine Geschäftsbedingungen"}
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-black/5 text-[#1F1F1F]/80 leading-relaxed">
          {language === 'EN' ? (
            /* ================= ENGLISH VERSION ================= */
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">1. Scope of Application</h2>
                <p>These General Terms and Conditions (GTC) apply to all deliveries of Rosetas Bouquets to consumers.</p>
                <p className="mt-2">A consumer is any natural person who enters into a legal transaction for a purpose that can predominantly be attributed neither to his commercial nor to his self-employed professional activity.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">2. Contracting Party</h2>
                <p>The purchase contract is concluded with:</p>
                <address className="not-italic bg-[#F9F9F9] p-6 rounded-lg border border-black/5 mt-4">
                  <strong>Askhab Albukaev</strong><br />
                  trading under the name Rosetas Bouquets<br />
                  Albert-Schweitzer-Str. 5<br />
                  45279 Essen<br />
                  Germany
                </address>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">3. Conclusion of Contract</h2>
                <p><strong>3.1.</strong> The presentation of the Products in the Online Shop does not constitute a legally binding offer, but only an invitation to order.</p>
                <p className="mt-2"><strong>3.2.</strong> By clicking on the button [Buy/order for a fee] you place a binding order for the goods listed on the order page. Your purchase contract is formed when we accept your order by means of an order confirmation email immediately after receiving your order.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">4. Prices and shipping costs</h2>
                <p>All prices are inclusive of VAT plus shipping costs, which will be clearly stated in the ordering process. The shipping costs are available in the online shop.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">5. Delivery and transfer of risk</h2>
                <p>Delivery will be made to the address provided by the customer. The risk only passes to the customer when the goods are handed over to the customer. The terms of delivery are available in the online shop.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">6. Right of withdrawal</h2>
                <p>Consumers have a legal right of withdrawal. The cancellation policy and the sample withdrawal form are available in the online shop.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">7. Terms of payment</h2>
                <p>Payment is made at the customer&apos;s choice by invoice credit card, Apple Pay, Klarna; Google Pay or other payment methods offered in the shop that can be accessed in the online shop.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">8. Warranty</h2>
                <p>Rosetas Bouquets is liable for material defects in accordance with the applicable statutory provisions, in particular §§ 434 et seq. of the German Civil Code.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">9. Retention of title</h2>
                <p>The goods remain our property until full payment has been made.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">10. Amendment of the Terms and Conditions</h2>
                <p>We reserve the right to change these terms and conditions for good cause, such as changes in the law or changes to our offer. We will inform the customer of any changes in good time.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">11. Dispute Resolution</h2>
                <p>The EU Commission has created an internet platform for the online resolution of disputes. The platform serves as a point of contact for the out-of-court settlement of disputes regarding contractual obligations arising from online sales contracts. More information is available at the following link: <a href="http://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">http://ec.europa.eu/consumers/odr</a>. We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">12. Final Provisions</h2>
                <p>Should individual provisions of these GTC be invalid, the validity of the remaining provisions shall remain unaffected.</p>
              </section>
            </div>
          ) : (
            /* ================= GERMAN VERSION ================= */
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">1. Geltungsbereich</h2>
                <p>Für alle Lieferungen von Rosetas Bouquets an Verbraucher gelten diese Allgemeinen Geschäftsbedingungen (AGB).</p>
                <p className="mt-2">Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu einem Zwecke abschließt, der überwiegend weder ihrer gewerblichen noch ihrer selbstständigen beruflichen Tätigkeit zugerechnet werden kann.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">2. Vertragspartner</h2>
                <p>Der Kaufvertrag kommt zustande mit:</p>
                <address className="not-italic bg-[#F9F9F9] p-6 rounded-lg border border-black/5 mt-4">
                  <strong>Herrn Askhab Albukaev</strong><br />
                  handelnd unter der Firma Rosetas Bouquets<br />
                  Albert-Schweitzer-Str. 5<br />
                  45279 Essen<br />
                  Deutschland
                </address>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">3. Vertragsschluss</h2>
                <p><strong>3.1.</strong> Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern nur eine Aufforderung zur Bestellung dar.</p>
                <p className="mt-2"><strong>3.2.</strong> Durch Anklicken des Buttons [Kaufen/kostenpflichtig bestellen] geben Sie eine verbindliche Bestellung der auf der Bestellseite aufgelisteten Waren ab. Ihr Kaufvertrag kommt zustande, wenn wir Ihre Bestellung durch eine Auftragsbestätigung per E-Mail unmittelbar nach dem Erhalt Ihrer Bestellung annehmen.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">4. Preise und Versandkosten</h2>
                <p>Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer zuzüglich Versandkosten, die im Bestellprozess deutlich ausgewiesen werden. Die Versandkosten sind im Online-Shop abrufbar.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">5. Lieferung und Gefahrübergang</h2>
                <p>Die Lieferung erfolgt an die vom Kunden angegebene Adresse. Die Gefahr geht erst mit Übergabe der Ware an den Kunden auf diesen über. Die Lieferbedingungen sind im Online Shop abrufbar.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">6. Widerrufsrecht</h2>
                <p>Verbraucher haben ein gesetzliches Widerrufsrecht. Die Widerrufsbelehrung und das Muster-Widerrufsformular sind im Online-Shop abrufbar.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">7. Zahlungsbedingungen</h2>
                <p>Die Zahlung erfolgt nach Wahl des Kunden per Rechnung Kreditkarte, Apple Pay, Klarna; Google Pay oder anderen im Shop angebotenen Zahlungsmethoden, die im Online-Shop abrufbar sind.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">8. Gewährleistung</h2>
                <p>Die Firma Rosetas Bouquets haftet für Sachmängel nach den hierfür geltenden gesetzlichen Vorschriften, insbesondere §§ 434 ff Bürgerliches Gesetzbuch.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">9. Eigentumsvorbehalt</h2>
                <p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">10. Änderung der AGB</h2>
                <p>Wir behalten uns vor, diese AGB aus wichtigem Grund zu ändern, etwa bei Gesetzesänderungen oder Änderungen unseres Angebots. Über Änderungen werden wir den Kunden rechtzeitig informieren.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">11. Streitbeilegung</h2>
                <p>Die EU-Kommission hat eine Internetplattform zur Online-Beilegung von Streitigkeiten geschaffen. Die Plattform dient als Anlaufstelle zur außergerichtlichen Beilegung von Streitigkeiten betreffend vertragliche Verpflichtungen, die aus Online-Kaufverträgen erwachsen. Nähere Informationen sind unter dem folgenden Link verfügbar: <a href="http://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="text-[#C9A24D] underline">http://ec.europa.eu/consumers/odr</a>. Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir weder bereit noch verpflichtet.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">12. Schlussbestimmungen</h2>
                <p>Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
              </section>
            </div>
          )}
        </div>
      </main>


    </div>
  );
}