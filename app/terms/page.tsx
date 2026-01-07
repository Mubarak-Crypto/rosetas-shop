"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-rose selection:text-black">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-8">
          Terms of Service
        </h1>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p>
              This website is operated by Rosetas Bouquets. Throughout the site, the terms “we”, “us” and “our” refer to Rosetas Bouquets. Rosetas Bouquets offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Online Store Terms</h2>
            <p>
              By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Products & Services</h2>
            <p>
              Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
            </p>
            <p className="mt-4">
              We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Shipping & Delivery</h2>
            <p>
              We utilize third-party carriers (such as DHL) for shipping. Delivery times are estimates and start from the date of shipping, rather than the date of order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            <p>
              You can review the most current version of the Terms of Service at any time at this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}