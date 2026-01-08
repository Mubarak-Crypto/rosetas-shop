"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Lock, ShieldCheck, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "../../lib/supabase"; 

// Load your Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- COMPONENT: THE PAYMENT FORM ---
function PaymentForm({ amount, formData, cart }: { amount: number, formData: any, cart: any[] }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage(); // ✨ Access translations
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    // 1. CONFIRM PAYMENT WITH STRIPE
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: "if_required", 
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      
      // 2. IF PAYMENT SUCCESSFUL, SAVE ORDER TO SUPABASE
      const { error: dbError } = await supabase.from('orders').insert([
        {
          customer_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          items: cart, 
          total: amount,
          status: 'paid',
          payment_id: paymentIntent.id
        }
      ]);

      if (dbError) {
        console.error("Error saving order:", dbError);
      }

      // 3. SEND EMAIL NOTIFICATION 
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: `${formData.address}, ${formData.city}`,
          items: cart,
          total: amount
        }),
      });

      // 4. REDIRECT TO SUCCESS PAGE
      window.location.href = "/success";
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      
      {message && <div className="text-red-600 text-sm bg-red-600/10 p-3 rounded font-medium">{message}</div>}
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full bg-[#1F1F1F] hover:bg-[#C9A24D] font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {/* FORCE WHITE TEXT */}
        <span style={{ color: 'white', opacity: 1 }} className="!text-white">
          {isLoading ? t('checkout_processing') : `${t('checkout_pay')} €${amount.toFixed(2)}`}
        </span>
      </button>
      
      <p className="text-xs text-center text-[#1F1F1F]/50 flex items-center justify-center gap-1 font-medium">
        <Lock size={10} /> Secure Encrypted Checkout via Stripe
      </p>
    </form>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { t, language } = useLanguage(); // ✨ Access translations
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState("");

  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", address: "", city: "", zip: "", phone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.phone || !formData.address) {
      alert(language === 'EN' ? "Please fill in all mandatory fields." : "Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    setStep(2); 
  };

  useEffect(() => {
    if (step === 2 && cartTotal > 0) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(cartTotal * 100) }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [step, cartTotal]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t('checkout_empty')}</h1>
        <Link href="/" className="text-[#C9A24D] font-bold hover:underline">{t('back_to_shop')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white pb-20">
      
      <header className="p-6 border-b border-black/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#1F1F1F]/60 hover:text-[#1F1F1F] transition-colors font-medium">
          <ArrowLeft size={18} /> {t('checkout_back')}
        </Link>
        <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
          <Lock size={14} /> {t('checkout_secure')}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Progress Bar */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 text-sm font-bold ${step >= 1 ? "text-[#1F1F1F]" : "text-[#1F1F1F]/40"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? "bg-[#1F1F1F] text-white border-[#1F1F1F]" : "border-black/10"}`}>1</div> {t('checkout_shipping')}
            </div>
            <div className="w-12 h-px bg-black/10"></div>
            <div className={`flex items-center gap-2 text-sm font-bold ${step >= 2 ? "text-[#1F1F1F]" : "text-[#1F1F1F]/40"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? "bg-[#1F1F1F] text-white border-[#1F1F1F]" : "border-black/10"}`}>2</div> {t('checkout_payment')}
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4">
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShieldCheck className="text-[#C9A24D]" /> {t('checkout_contact')}
                </h2>
                
                <div>
                  <label className="text-xs font-bold text-[#1F1F1F]/50 uppercase mb-1 block">{t('checkout_email')} *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-[#1F1F1F]/30" size={18} />
                    <input 
                      required 
                      type="email" 
                      name="email" 
                      placeholder="you@example.com" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full bg-white/50 border border-black/10 rounded-xl pl-12 pr-4 py-4 focus:border-[#C9A24D] outline-none transition-colors text-[#1F1F1F]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1F1F1F]/50 uppercase mb-1 block">{t('checkout_phone')} *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-[#1F1F1F]/30" size={18} />
                    <input 
                      required 
                      type="tel" 
                      name="phone" 
                      placeholder="+49 ..." 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="w-full bg-white/50 border border-black/10 rounded-xl pl-12 pr-4 py-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-black/10">
                <h2 className="text-2xl font-bold">{t('checkout_address')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="firstName" placeholder={`${t('checkout_first_name')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]" />
                  <input required type="text" name="lastName" placeholder={`${t('checkout_last_name')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]" />
                </div>
                <input required type="text" name="address" placeholder={`${t('checkout_street')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="city" placeholder={`${t('checkout_city')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]" />
                  <input required type="text" name="zip" placeholder={`${t('checkout_zip')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]" />
                </div>
              </div>

              {/* --- FIXED BUTTON --- */}
              <button 
                type="submit" 
                className="w-full bg-[#1F1F1F] hover:bg-[#C9A24D] hover:scale-[1.02] py-5 rounded-xl mt-8 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span style={{ color: 'white', opacity: 1 }} className="!text-white font-bold">
                  {t('checkout_continue')}
                </span> 
                <ArrowLeft className="rotate-180" size={18} style={{ color: 'white' }} />
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-white/40 border border-black/5 p-6 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[#1F1F1F]/50 text-sm font-medium">{t('checkout_shipping')} to:</p>
                  <p className="font-bold text-[#1F1F1F]">{formData.address}, {formData.city}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-[#C9A24D] text-sm font-bold hover:underline">{t('checkout_change')}</button>
              </div>

              <h2 className="text-2xl font-bold pt-4">{t('checkout_method')}</h2>
              
              {clientSecret ? (
                <div className="bg-white p-6 rounded-2xl text-black shadow-lg">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1F1F1F' } } }}>
                    <PaymentForm amount={cartTotal} formData={formData} cart={cart} />
                  </Elements>
                </div>
              ) : (
                <div className="p-8 text-center text-[#1F1F1F]/40 font-medium">{t('checkout_loading_payment')}</div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-white/40 border border-black/5 rounded-3xl p-8 h-fit shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-xl mb-6">{t('checkout_summary')}</h3>
          <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.uniqueId} className="flex gap-4">
                <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-black/10 relative flex-shrink-0">
                   <img src={item.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-[#1F1F1F]/60 font-medium">{item.options ? Object.values(item.options).join(", ") : ""}</p>
                </div>
                <div className="font-mono text-sm font-bold">€{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-black/10 pt-6">
            <div className="flex justify-between text-[#1F1F1F]/60 font-medium"><span>Subtotal</span><span>€{cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-xl font-bold text-[#1F1F1F] pt-4 border-t border-black/10"><span>{t('checkout_total')}</span><span className="text-[#C9A24D]">€{cartTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}