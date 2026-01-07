"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-rose selection:text-black">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-8">
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <p className="text-sm text-gray-500 mb-4">Last updated: January 2026</p>
            <p>
              This Privacy Policy describes how Rosetas Bouquets (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from rosetas.com (the "Site").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Collecting Personal Information</h2>
            <p>
              When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Device Information:</strong> Examples include version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.</li>
              <li><strong>Order Information:</strong> Examples include name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Sharing Personal Information</h2>
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
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at rosetasbouquetsde@gmail.com.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}