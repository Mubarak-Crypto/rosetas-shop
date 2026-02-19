"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function PrivacyPage() {
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
          {language === 'EN' ? "Privacy Policy" : "Datenschutzerklärung"}
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-black/5 text-[#1F1F1F]/80 leading-relaxed">
          {language === 'EN' ? (
            /* ================= ENGLISH VERSION ================= */
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Privacy Policy – Technical Implementation & Hosting</h2>
                <p className="mb-4">
                  <strong>Data protection information according to the EU General Data Protection Regulation for "natural persons" as of February 2026</strong>
                </p>
                <p>
                  The following information provides you with an overview of the processing of your personal data by us and your rights under data protection law. Which data is processed in detail and in what way depends largely on the services applied for or agreed upon.
                </p>
              </section>

              <hr className="border-black/10 my-8" />

              {/* I. General information */}
              <section className="space-y-8">
                <h2 className="text-3xl font-bold text-[#1F1F1F]">I. General information</h2>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">1. Who is responsible for data processing and who can I contact?</h3>
                  <p>The responsible body is:</p>
                  <address className="not-italic bg-[#F9F9F9] p-6 rounded-lg border border-black/5 mt-4">
                    <strong>Askhab Albukaev</strong><br />
                    trading under the name Rosetas Bouquets<br />
                    Albert-Schweitzer-Str. 5<br />
                    45279 Essen<br />
                    Germany<br />
                    <br />
                    <strong>Phone:</strong> +49 155 65956604<br />
                    <strong>E-mail:</strong> <a href="mailto:kontakt@rosetasbouquets.info" className="text-[#C9A24D] underline">kontakt@rosetasbouquets.info</a>
                  </address>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">2. What sources and data do we use?</h3>
                  <p className="mb-2">We process personal data that we receive from our customers in the course of our business relationship. In addition, we process – to the extent necessary for the provision of our service – personal data that we have permissibly received from third parties (e.g. for the execution of orders, for the fulfilment of contracts or on the basis of consent given by you).</p>
                  <p><strong>Relevant personal data may include:</strong> Name, date of birth, nationality, address, telephone number, fax number, internet address, e-mail, VAT identification number and tax number as well as the name of the person authorised to purchase.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">3. What do we process your data for (purpose of processing) and on what legal basis?</h3>
                  <p className="mb-4">We process the aforementioned personal data in accordance with the provisions of the EU General Data Protection Regulation (GDPR) and the German Federal Data Protection Act (BDSG):</p>
                  
                  <div className="space-y-4 ml-4">
                    <div>
                      <h4 className="font-bold text-[#1F1F1F]">a. On the basis of your consent (Article 6 (1) (a) EU GDPR) or for the fulfilment of contractual obligations (Article 6 (1) (b) EU GDPR)</h4>
                      <p className="mt-1">If you have given us your consent to the processing of personal data for specific purposes (e.g. information on further offers, sending of products for advertising purposes), the lawfulness of this processing is given on the basis of your consent. The processing of personal data is also carried out for the purpose of carrying out business within the framework of the performance of our contracts with our customers or for the implementation of pre-contractual measures taken at your request.</p>
                      <p className="mt-2 text-sm italic">A given consent can be revoked at any time. Please note that the revocation only takes effect for the future. Processing that took place before the revocation is not affected. You can request a status overview of the consents you have given from us at any time. The revocation can be made in any form via post, phone, or email.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1F1F1F]">b. To safeguard vital interests (Article 6 (1d) of the EU GDPR)</h4>
                      <p className="mt-1">Where necessary, we process your data beyond the actual performance of the contract in order to protect the vital interests of the data subject or another natural person.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1F1F1F]">c. To safeguard tasks that are in the public interest (Article 6 (1e) EU GDPR) or in the context of the balancing of interests (Article 6 (1) f EU GDPR)</h4>
                      <p className="mt-1">The processing of personal data is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller. If necessary, we process your data beyond the actual performance of the contract to protect the legitimate interests of us or third parties.</p>
                      <p className="mt-2 font-bold">Examples:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Examination and optimisation of procedures for needs analysis and direct customer contact</li>
                        <li>Assertion of legal claims and defence in legal disputes</li>
                        <li>Ensuring IT security and Prevention of crime</li>
                        <li>Credit decision, business initiation, shareholdings, receivables, credit checks, insurance contracts, enforcement information</li>
                      </ul>
                      <p className="mt-4 text-sm font-semibold">You have the right to object, on grounds relating to your particular situation, at any time to the processing of personal data concerning you on the basis of Article 6(1)(e) or (f) of the EU GDPR.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">4. Who gets my data?</h3>
                  <p className="mb-4">Within the company, access to your data is given to those departments that need it to fulfil our contractual and legal obligations. Service providers and vicarious agents used by us may also receive data for these purposes if they comply with our written data protection instructions. We may only pass on information about you if this is required by law, if you have consented and/or if processors commissioned by us guarantee the requirements of the EU General Data Protection Regulation/the Federal Data Protection Act in the same manner.</p>
                  
                  <ul className="list-disc pl-5 space-y-4">
                    <li><strong>Hosting:</strong> The online shop is an individually developed web application (Next.js). Hosting is provided by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. When accessing our website, Vercel processes technical access data (e.g. IP address, date and time) to provide the website securely.</li>
                    <li><strong>Database:</strong> To store and manage customer and order data, we use Supabase Inc., 970 Toa Payoh North #07-04, Singapore. (Name, e-mail, delivery address, order data).</li>
                    <li><strong>Payment:</strong> Payment is processed via Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Ireland. Stripe sets technically necessary cookies required for fraud prevention and SCA / 3D Secure.</li>
                    <li><strong>Address Assistance:</strong> To help you enter your address, we use the Google Places API.</li>
                    <li><strong>Cookies & Local Storage:</strong> A cookie notice banner is implemented. Our website uses <strong>only essential / technically necessary cookies</strong> and local storage (keys: <code>rosetas_cart</code>, <code>rosetas_session_id</code>) to maintain the shopping cart. <strong>No analytical, tracking or marketing cookies are used</strong> (No Google Analytics, Facebook Pixel, etc.).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">5. How long will my data be stored?</h3>
                  <p className="mb-2">We process and store your personal data for as long as it is necessary for the fulfilment of our contractual and legal obligations. If the data is no longer necessary, it will be deleted on a regular basis, unless temporary further processing is necessary for:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fulfilment of retention periods under commercial and tax law (usually two to ten years).</li>
                    <li>Preservation of evidence within the framework of the limitation rules (up to 30 years, standard is 3 years).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">6. What data protection rights do I have?</h3>
                  <p>Every data subject has the right to information (Art 15 GDPR), right to rectification (Art 16 GDPR), right to erasure (Art 17 GDPR), right to restriction of processing (Art 18 GDPR) and right to data portability (Art 20 GDPR). In addition, there is a right to lodge a complaint with a data protection supervisory authority.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">7. Is there an obligation for me to provide data?</h3>
                  <p>As part of our business relationship, you must provide the personal data that is necessary for the establishment and implementation of a business relationship. Without this data, we will usually have to refuse to conclude the contract or execute the order.</p>
                </div>
              </section>

              <hr className="border-black/10 my-8" />

              {/* II. Other rights */}
              <section className="space-y-8">
                <h2 className="text-3xl font-bold text-[#1F1F1F]">II. Other rights</h2>
                <p>If your personal data is processed, you are a data subject within the meaning of the EU GDPR and you have the following rights vis-à-vis us as the controller:</p>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">1. Right to information</h3>
                  <p className="text-sm">You can request confirmation from us as to whether personal data concerning you is being processed, the purposes, categories, recipients, planned duration of storage, and the existence of automated decision-making.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">2. Right to rectification</h3>
                  <p className="text-sm">You have the right to rectification and/or completion if the personal data processed concerning you is inaccurate or incomplete.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">3. Right to restriction of processing</h3>
                  <p className="text-sm">You can request the restriction of processing if you contest the accuracy of the data, the processing is unlawful, we no longer need the data but you need it for legal claims, or you have objected to the processing.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">4. Right to erasure</h3>
                  <p className="text-sm">You can ask us to delete the personal data concerning you without undue delay if the data is no longer necessary, you revoke consent, you object to processing, or the data was unlawfully processed. Exceptions apply if processing is necessary for freedom of expression, legal obligations, public health, or legal claims.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">5. Right to information (Notification)</h3>
                  <p className="text-sm">If you have asserted the right to rectification, erasure, or restriction, we are obliged to notify all recipients to whom the data was disclosed, unless impossible.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">6. Right to data portability</h3>
                  <p className="text-sm">You have the right to receive the personal data you provided to us in a structured, commonly used and machine-readable format, and transmit it to another controller.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">7. Automated decision-making in individual cases including profiling</h3>
                  <p className="text-sm">You have the right not to be subject to a decision based solely on automated processing which produces legal effects concerning you, except where necessary for entering into a contract or based on your explicit consent.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">8. Right to lodge a complaint with a supervisory authority</h3>
                  <p className="text-sm">Without prejudice to any other remedy, you have the right to lodge a complaint with a supervisory authority, in particular in the Member State of your residence, if you believe the processing violates the EU GDPR.</p>
                </div>
              </section>
            </div>
          ) : (
            /* ================= GERMAN VERSION ================= */
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Datenschutzerklärung – Technische Umsetzung & Hosting</h2>
                <p className="mb-4">
                  <strong>Datenschutzhinweise gemäß EU-DatenschutzGrundverordnung für „Natürliche Personen“ Stand: Februar 2026</strong>
                </p>
                <p>
                  Mit den nachfolgenden Informationen geben wir Ihnen einen Überblick über die Verarbeitung Ihrer personenbezogenen Daten durch uns und Ihre Rechte aus dem Datenschutzrecht. Welche Daten im Einzelnen verarbeitet und in welcher Weise genutzt werden, richtet sich maßgeblich nach den jeweils beantragten bzw. vereinbarten Dienstleistungen.
                </p>
              </section>

              <hr className="border-black/10 my-8" />

              {/* I. Allgemeine Hinweise */}
              <section className="space-y-8">
                <h2 className="text-3xl font-bold text-[#1F1F1F]">I. Allgemeine Hinweise</h2>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">1. Wer ist für die Datenverarbeitung verantwortlich und an wen kann ich mich wenden?</h3>
                  <p>Verantwortliche Stelle ist:</p>
                  <address className="not-italic bg-[#F9F9F9] p-6 rounded-lg border border-black/5 mt-4">
                    <strong>Askhab Albukaev</strong><br />
                    handelnd unter der Firma Rosetas Bouquets<br />
                    Albert-Schweitzer-Str. 5<br />
                    45279 Essen<br />
                    Deutschland<br />
                    <br />
                    <strong>Telefon:</strong> +49 155 65956604<br />
                    <strong>E-Mail:</strong> <a href="mailto:kontakt@rosetasbouquets.info" className="text-[#C9A24D] underline">kontakt@rosetasbouquets.info</a>
                  </address>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">2. Welche Quellen und Daten nutzen wir?</h3>
                  <p className="mb-2">Wir verarbeiten personenbezogene Daten, die wir im Rahmen unserer Geschäftsbeziehung von unseren Kunden erhalten. Zudem verarbeiten wir – soweit für die Erbringung unserer Dienstleistung erforderlich – personenbezogene Daten, die wir von Dritten zulässigerweise erhalten haben.</p>
                  <p><strong>Relevante personenbezogene Daten können sein:</strong> Name, Geburtsdatum, Staatsangehörigkeit, Anschrift, Telefonnummer, Telefaxnummer, Internetadresse, E-Mail, Umsatzsteuer-Identnummer und Steuernummer sowie der Name der einkaufsberechtigten Person.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">3. Wofür verarbeiten wir Ihre Daten (Zweck der Verarbeitung) und auf welcher Rechtsgrundlage?</h3>
                  <p className="mb-4">Wir verarbeiten die vorab genannten personenbezogenen Daten im Einklang mit den Bestimmungen der EU-Datenschutz-Grundverordnung (EU-DSGVO) und dem Bundesdatenschutzgesetz (BDSG):</p>
                  
                  <div className="space-y-4 ml-4">
                    <div>
                      <h4 className="font-bold text-[#1F1F1F]">a. Aufgrund Ihrer Einwilligung (Art. 6 Abs. 1 a EU-DSGVO) oder zur Erfüllung von vertraglichen Pflichten (Art. 6 Abs.1 b EU-DSGVO)</h4>
                      <p className="mt-1">Soweit Sie uns eine Einwilligung zur Verarbeitung von personenbezogenen Daten für bestimmte Zwecke erteilt haben, ist die Rechtmäßigkeit dieser Verarbeitung auf Basis Ihrer Einwilligung gegeben. Die Verarbeitung erfolgt auch zur Erbringung von Geschäften im Rahmen der Durchführung unserer Verträge.</p>
                      <p className="mt-2 text-sm italic">Eine erteilte Einwilligung kann jederzeit widerrufen werden. Bitte beachten Sie, dass der Widerruf erst für die Zukunft wirkt. Verarbeitungen, die vor dem Widerruf erfolgt sind, sind davon nicht betroffen. Der Widerruf kann formfrei postalisch, telefonisch oder per E-Mail erfolgen.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1F1F1F]">b. Zur Wahrung lebenswichtiger Interessen (Art. 6 Abs. 1d. EU-DSGVO)</h4>
                      <p className="mt-1">Soweit erforderlich, verarbeiten wir Ihre Daten über die eigentliche Erfüllung des Vertrages hinaus um lebenswichtige Interessen der betroffenen Person oder einer anderen natürlichen Person zu schützen.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1F1F1F]">c. Zur Wahrung von Aufgaben, die im öffentlichen Interesse liegen (Art. 6 Abs. 1e. EU-DSGVO) oder im Rahmen der Interessenabwägung (Art. 6 Abs. 1 f EU-DSGVO)</h4>
                      <p className="mt-1">Soweit erforderlich, verarbeiten wir Ihre Daten über die eigentliche Erfüllung des Vertrages hinaus zur Wahrung berechtigter Interessen von uns oder Dritten.</p>
                      <p className="mt-2 font-bold">Beispiele:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Prüfung und Optimierung von Verfahren zur Bedarfsanalyse</li>
                        <li>Geltendmachung rechtlicher Ansprüche und Verteidigung</li>
                        <li>Gewährleistung der IT-Sicherheit und Verhinderung von Straftaten</li>
                        <li>Kreditentscheidung, Geschäftsanbahnung, Bonitätsprüfung</li>
                      </ul>
                      <p className="mt-4 text-sm font-semibold">Sie haben das Recht, aus Gründen, die sich aus ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Widerspruch einzulegen.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">4. Wer bekommt meine Daten?</h3>
                  <p className="mb-4">Innerhalb der Firma erhalten diejenigen Stellen Zugriff auf Ihre Daten, die diese zur Erfüllung unserer vertraglichen und gesetzlichen Pflichten brauchen. Auch von uns eingesetzte Dienstleister und Erfüllungsgehilfen können zu diesen Zwecken Daten erhalten, wenn diese unsere schriftlichen datenschutzrechtlichen Weisungen wahren.</p>
                  
                  <ul className="list-disc pl-5 space-y-4">
                    <li><strong>Hosting:</strong> Der Online-Shop ist eine individuell entwickelte Webanwendung (Next.js). Hosting: Vercel Inc., USA. Beim Aufruf unserer Website verarbeitet Vercel technische Zugriffsdaten (z. B. IP-Adresse), um die Website sicher bereitzustellen.</li>
                    <li><strong>Datenbank:</strong> Zur Speicherung und Verwaltung von Kunden- und Bestelldaten nutzen wir Supabase Inc., Singapore. (Name, E-Mail, Lieferadresse, etc.).</li>
                    <li><strong>Zahlungsabwicklung:</strong> Erfolgt über Stripe Payments Europe, Ltd., Irland. Stripe setzt technisch notwendige Cookies, die zur Betrugsprävention (SCA / 3D Secure) erforderlich sind.</li>
                    <li><strong>Adresseingabe:</strong> Zur Unterstützung nutzen wir die Google Places API.</li>
                    <li><strong>Cookies & Local Storage:</strong> Unsere Website verwendet <strong>ausschließlich essenzielle / technisch notwendige Cookies</strong> und lokale Speichertechnologien (<code>rosetas_cart</code>, <code>rosetas_session_id</code>). <strong>Es werden keine Analyse-, Tracking- oder Marketing-Cookies eingesetzt</strong> (Kein Google Analytics, Facebook Pixel, etc.).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">5. Wie lange werden meine Daten gespeichert?</h3>
                  <p className="mb-2">Wir verarbeiten und speichern Ihre personenbezogenen Daten, solange es für die Erfüllung unserer vertraglichen und gesetzlichen Pflichten erforderlich ist. Sind die Daten nicht mehr erforderlich, werden diese regelmäßig gelöscht, es sei denn:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Erfüllung handels- und steuerrechtlicher Aufbewahrungsfristen (z.B. Handelsgesetzbuch, 2 bis 10 Jahre).</li>
                    <li>Erhaltung von Beweismitteln im Rahmen der Verjährungsvorschriften (regelmäßig 3 Jahre, bis zu 30 Jahre).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">6. Welche Datenschutzrechte habe ich?</h3>
                  <p>Jede betroffene Person hat das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO) sowie das Recht auf Datenübertragbarkeit (Art. 20 DSGVO). Darüber hinaus besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">7. Gibt es für mich eine Pflicht zur Bereitstellung von Daten?</h3>
                  <p>Im Rahmen unserer Geschäftsbeziehung müssen Sie diejenigen personenbezogenen Daten bereitstellen, die für die Aufnahme und Durchführung einer Geschäftsbeziehung und die Erfüllung der vertraglichen Pflichten erforderlich sind. Ohne diese Daten werden wir in der Regel den Abschluss des Vertrages ablehnen müssen.</p>
                </div>
              </section>

              <hr className="border-black/10 my-8" />

              {/* II. Sonstige Rechte */}
              <section className="space-y-8">
                <h2 className="text-3xl font-bold text-[#1F1F1F]">II. Sonstige Rechte</h2>
                <p>Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener i.S.d. EU-DSGVO und es stehen Ihnen folgende Rechte gegenüber uns als Verantwortlichem zu:</p>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">1. Auskunftsrecht</h3>
                  <p className="text-sm">Sie können von uns eine Bestätigung darüber verlangen, ob personenbezogene Daten, die Sie betreffen, von uns verarbeitet werden, sowie Auskunft über Zwecke, Kategorien, Empfänger und Speicherdauer erhalten.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">2. Recht auf Berichtigung</h3>
                  <p className="text-sm">Sie haben ein Recht auf Berichtigung und/oder Vervollständigung, sofern die verarbeiteten personenbezogenen Daten unrichtig oder unvollständig sind.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">3. Recht auf Einschränkung der Verarbeitung</h3>
                  <p className="text-sm">Sie können die Einschränkung der Verarbeitung verlangen, wenn Sie die Richtigkeit bestreiten, die Verarbeitung unrechtmäßig ist, wir die Daten nicht mehr benötigen (Sie diese aber zur Rechtsverfolgung brauchen) oder Sie Widerspruch eingelegt haben.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">4. Recht auf Löschung</h3>
                  <p className="text-sm">Sie können von uns verlangen, dass die Sie betreffenden Daten unverzüglich gelöscht werden, sofern sie nicht mehr notwendig sind, Sie Ihre Einwilligung widerrufen oder Widerspruch einlegen. Ausnahmen gelten z.B. bei rechtlichen Verpflichtungen.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">5. Recht auf Unterrichtung</h3>
                  <p className="text-sm">Haben Sie das Recht auf Berichtigung, Löschung oder Einschränkung geltend gemacht, sind wir verpflichtet, allen Empfängern dies mitzuteilen, es sei denn, dies ist unmöglich oder mit unverhältnismäßigem Aufwand verbunden.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">6. Recht auf Datenübertragbarkeit</h3>
                  <p className="text-sm">Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten und diese einem anderen Verantwortlichen zu übermitteln.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">7. Automatisierte Entscheidung im Einzelfall einschließlich Profiling</h3>
                  <p className="text-sm">Sie haben das Recht, nicht einer ausschließlich auf einer automatisierten Verarbeitung beruhenden Entscheidung unterworfen zu werden, die Ihnen gegenüber rechtliche Wirkung entfaltet.</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#1F1F1F]">8. Recht auf Beschwerde bei einer Aufsichtsbehörde</h3>
                  <p className="text-sm">Unbeschadet eines anderweitigen Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbehörde zu, wenn Sie der Ansicht sind, dass die Verarbeitung gegen die EU-DSGVO verstößt.</p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

     
    </div>
  );
}