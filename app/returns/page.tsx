"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ReturnsPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans">
     
      
      <main className="max-w-4xl mx-auto px-6 py-32">
        {/* ADD THIS BACK BUTTON RIGHT HERE */}
        <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#1F1F1F]/40 hover:text-[#C9A24D] transition-colors mb-12 group font-bold uppercase tracking-wider"
        > <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {language === 'EN' ? "Back to Shop" : "Zurück zum Shop"}
          </Link>
    {/* ------------------------------- */}

        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-center">
          {language === 'EN' ? "Cancellation Policy" : "Widerrufsbelehrung"}
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-black/5 text-[#1F1F1F]/80 leading-relaxed">
          {language === 'EN' ? (
            /* ================= ENGLISH VERSION ================= */
            <div className="space-y-6">
              <p>
                You have the right to withdraw from this contract within fourteen days without giving reasons. 
              </p>
              
              <div className="bg-[#F6EFE6] p-4 rounded-lg border border-[#EBE6DF]">
                <p className="font-bold text-red-600 mb-1">The right of withdrawal does NOT apply to the following contracts:</p>
                <p className="text-sm">Contracts for the supply of goods that are not prefabricated and for the production of which an individual selection or determination by the consumer is decisive or which are clearly tailored to the personal needs of the consumer.</p>
              </div>

              <p>
                The withdrawal period is fourteen days from the day on which you or a third party named by you who is not the carrier has taken possession of the goods.
              </p>
              <p>
                In order to exercise your right of withdrawal, you must inform us (name, address, telephone number, e-mail address) of your decision to withdraw from this contract by means of an unequivocal statement (e.g. a letter sent by post, fax or e-mail). You can use the attached model withdrawal form for this, but it is not mandatory.
              </p>
              <p>
                In order to comply with the withdrawal period, it is sufficient that you send the notification of the exercise of the right of withdrawal before the expiry of the withdrawal period.
              </p>

              <h2 className="text-2xl font-bold text-[#1F1F1F] mt-10 mb-4">Consequences of Revocation</h2>
              <p>
                If you withdraw from this contract, we shall reimburse you all payments we have received from you, including delivery costs (with the exception of the additional costs resulting from the fact that you have chosen a type of delivery other than the cheapest standard delivery offered by us), without undue delay and at the latest within fourteen days from the day on which we receive the notification of your withdrawal from this contract. For this refund, we will use the same means of payment that you used for the original transaction, unless otherwise expressly agreed with you; in no case will you be charged any fees for this repayment.
              </p>
              <p>
                We may withhold reimbursement until we have received the goods back or until you have provided proof that you have returned the goods, whichever is the earlier.
              </p>
              <p>
                You must return or hand over the goods to us without undue delay and in any event no later than fourteen days from the day on which you inform us of the withdrawal from this contract. The deadline is met if you send the goods before the expiry of the fourteen day period.
              </p>
              <p className="font-bold text-[#1F1F1F]">
                You will bear the direct costs of returning the goods.
              </p>
              <p>
                They only have to pay for any loss in value of the goods if this loss of value is due to handling of them that is not necessary to check the nature, characteristics and functioning of the goods.
              </p>

              <h2 className="text-2xl font-bold text-[#1F1F1F] mt-10 mb-4">Sample Withdrawal Form</h2>
              <p className="italic text-sm mb-4">(If you wish to withdraw from the contract, please fill out this form and return it.)</p>
              
              <div className="bg-[#F9F9F9] p-6 rounded-lg border border-black/5 font-mono text-sm space-y-4">
                <p><strong>To:</strong><br/>
                Askhab Albukaev<br/>
                trading under the name Rosetas Bouquets<br/>
                Albert-Schweitzer-Str. 5<br/>
                45279 Essen<br/>
                Germany<br/>
                <br/>
                <strong>Phone:</strong> +49 155 65956604<br/>
                <strong>Email:</strong> kontakt@rosetasbouquets.info</p>
                
                <hr className="border-black/10 my-4" />
                
                <p>I/we hereby withdraw from the contract concluded by me/us (*) for the purchase of the following goods (*)/the provision of the following service (*)</p>
                
                <ul className="space-y-4 mt-4">
                  <li><strong>Ordered on (*) / received on (*):</strong> ___________________________</li>
                  <li><strong>Name of consumer(s):</strong> ___________________________</li>
                  <li><strong>Address of the consumer(s):</strong> ___________________________</li>
                  <li className="pt-4"><strong>Signature of the consumer(s):</strong> ___________________________ <br/><span className="text-xs text-black/50">(only if notified on paper)</span></li>
                  <li><strong>Date:</strong> ___________________________</li>
                </ul>
                <p className="text-xs text-black/50 mt-4">(*) Delete what is inappropriate.</p>
              </div>
            </div>
          ) : (
            /* ================= GERMAN VERSION ================= */
            <div className="space-y-6">
              <p>
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. 
              </p>
              
              <div className="bg-[#F6EFE6] p-4 rounded-lg border border-[#EBE6DF]">
                <p className="font-bold text-red-600 mb-1">Das Widerrufsrecht besteht NICHT bei den folgenden Verträgen:</p>
                <p className="text-sm">Verträge zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind.</p>
              </div>

              <p>
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben.
              </p>
              <p>
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Name, Anschrift, Telefonnummer, E-Mail-Adresse) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief, Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
              </p>
              <p>
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
              </p>

              <h2 className="text-2xl font-bold text-[#1F1F1F] mt-10 mb-4">Folgen des Widerrufs</h2>
              <p>
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung, als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
              </p>
              <p>
                Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.
              </p>
              <p>
                Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
              </p>
              <p className="font-bold text-[#1F1F1F]">
                Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
              </p>
              <p>
                Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.
              </p>

              <h2 className="text-2xl font-bold text-[#1F1F1F] mt-10 mb-4">Muster-Widerrufsformular</h2>
              <p className="italic text-sm mb-4">(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
              
              <div className="bg-[#F9F9F9] p-6 rounded-lg border border-black/5 font-mono text-sm space-y-4">
                <p><strong>An:</strong><br/>
                Askhab Albukaev<br/>
                handelnd unter der Firma Rosetas Bouquets<br/>
                Albert-Schweitzer-Str. 5<br/>
                45279 Essen<br/>
                Deutschland<br/>
                <br/>
                <strong>Telefon:</strong> +49 155 65956604<br/>
                <strong>E-Mail:</strong> kontakt@rosetasbouquets.info</p>
                
                <hr className="border-black/10 my-4" />
                
                <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)</p>
                
                <ul className="space-y-4 mt-4">
                  <li><strong>Bestellt am (*) / erhalten am (*):</strong> ___________________________</li>
                  <li><strong>Name des/der Verbraucher(s):</strong> ___________________________</li>
                  <li><strong>Anschrift des/der Verbraucher(s):</strong> ___________________________</li>
                  <li className="pt-4"><strong>Unterschrift des/der Verbraucher(s):</strong> ___________________________ <br/><span className="text-xs text-black/50">(nur bei Mitteilung auf Papier)</span></li>
                  <li><strong>Datum:</strong> ___________________________</li>
                </ul>
                <p className="text-xs text-black/50 mt-4">(*) Unzutreffendes streichen.</p>
              </div>
            </div>
          )}
        </div>
      </main>

     
    </div>
  );
}