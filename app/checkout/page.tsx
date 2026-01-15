"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Lock, ShieldCheck, Mail, Phone, Globe, Zap, AlertCircle, Truck, Gift, Package } from "lucide-react"; // ✨ Added Gift & Package icons
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext"; 
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "../../lib/supabase"; 
import AutoComplete from "react-google-autocomplete"; // ✨ Added for Address Validation

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// 🌏 List of EU Countries (No customs needed)
const euCountries = [
  "Belgium", "Bulgaria", "Denmark", "Germany", "Estonia", "Finland", "France", 
  "Greece", "Ireland", "Italy", "Croatia", "Latvia", "Lithuania", "Luxembourg", 
  "Malta", "Netherlands", "Austria", "Poland", "Portugal", "Romania", 
  "Sweden", "Slovakia", "Slovenia", "Spain", "Czech Republic", "Hungary", "Cyprus"
];

// 🚫 BLACKLISTED COUNTRIES (No Shipping)
const shippingBlacklist = [
  "Russian Federation", "Russia", "Venezuela", "Afghanistan", "Iran", "Syria",
  "Canada", "Mexico", "Argentina", "Brazil", "Bahamas", "Barbados", 
  "Jamaica", "Puerto Rico", "Costa Rica", "Colombia", "Peru", "Paraguay"
];

// 🌏 Rosetta's Global Shipping Data (Updated with latest rates & blacklist)
const shippingRates: Record<string, { rate10kg: number; rate20kg: number; express10kg?: number; express20kg?: number }> = {
  "Belgium": { rate10kg: 25, rate20kg: 31 },
  "Bulgaria": { rate10kg: 25, rate20kg: 32 },
  "Denmark": { rate10kg: 24, rate20kg: 30 },
  "France": { rate10kg: 24.49, rate20kg: 29.99 },
  "Greece": { rate10kg: 25, rate20kg: 32 },
  "Italy": { rate10kg: 25, rate20kg: 32 },
  "Ireland": { rate10kg: 25, rate20kg: 32 },
  "Croatia": { rate10kg: 25, rate20kg: 32 },
  "Latvia": { rate10kg: 25, rate20kg: 32 },
  "Lithuania": { rate10kg: 25, rate20kg: 32 },
  "Luxembourg": { rate10kg: 25, rate20kg: 32 },
  "Malta": { rate10kg: 25, rate20kg: 32 },
  "Monaco": { rate10kg: 25, rate20kg: 32 },
  "Netherlands": { rate10kg: 25, rate20kg: 32 },
  "Poland": { rate10kg: 25, rate20kg: 32 },
  "Portugal": { rate10kg: 25, rate20kg: 32 },
  "Romania": { rate10kg: 25, rate20kg: 32 },
  "Sweden": { rate10kg: 25, rate20kg: 32 },
  "Slovakia": { rate10kg: 25, rate20kg: 32 },
  "Slovenia": { rate10kg: 25, rate20kg: 32 },
  "Spain": { rate10kg: 25, rate20kg: 32 },
  "Czech Republic": { rate10kg: 25, rate20kg: 32 },
  "Hungary": { rate10kg: 25, rate20kg: 32 },
  "Cyprus": { rate10kg: 25, rate20kg: 32 },
  "Albania": { rate10kg: 40, rate20kg: 55 },
  "Bosnia & Herzegovina": { rate10kg: 40, rate20kg: 55 },
  "Kosovo": { rate10kg: 39, rate20kg: 55 },
  "Moldova": { rate10kg: 39, rate20kg: 55 },
  "Norway": { rate10kg: 40, rate20kg: 55 },
  "Turkey": { rate10kg: 40, rate20kg: 55 },
  "Ukraine": { rate10kg: 40, rate20kg: 55 },
  "Switzerland": { rate10kg: 35, rate20kg: 51 },
  "Iceland": { rate10kg: 39, rate20kg: 54 },
  "Liechtenstein": { rate10kg: 39, rate20kg: 54 },
  "United States": { rate10kg: 80, rate20kg: 150 },
  // "Canada": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Mexico": { rate10kg: 79, rate20kg: 146 }, // Removed (Blacklisted)
  // "Argentina": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Brazil": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Bahamas": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Barbados": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Jamaica": { rate10kg: 79, rate20kg: 147 }, // Removed (Blacklisted)
  // "Puerto Rico": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Costa Rica": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Colombia": { rate10kg: 79, rate20kg: 145 }, // Removed (Blacklisted)
  // "Peru": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  // "Paraguay": { rate10kg: 79, rate20kg: 150 }, // Removed (Blacklisted)
  "Chile": { rate10kg: 79, rate20kg: 150 },
  "Egypt": { rate10kg: 65, rate20kg: 78 },
  "Algeria": { rate10kg: 65, rate20kg: 78 },
  "Morocco": { rate10kg: 55, rate20kg: 78 },
  "Tunisia": { rate10kg: 55, rate20kg: 78 },
  "South Africa": { rate10kg: 65, rate20kg: 105 },
  "Senegal": { rate10kg: 65, rate20kg: 105 },
  "Cameroon": { rate10kg: 65, rate20kg: 105 },
  "Kenya": { rate10kg: 65, rate20kg: 105 },
  "Nigeria": { rate10kg: 65, rate20kg: 105 },
  "UAE": { rate10kg: 65, rate20kg: 105 },
  "Saudi Arabia": { rate10kg: 65, rate20kg: 105 },
  "Qatar": { rate10kg: 65, rate20kg: 105 },
  "Oman": { rate10kg: 65, rate20kg: 105 },
  "Kuwait": { rate10kg: 65, rate20kg: 105 },
  "China": { rate10kg: 80, rate20kg: 150 },
  "Hong Kong": { rate10kg: 68, rate20kg: 104 },
  "Japan": { rate10kg: 65, rate20kg: 105 },
  "India": { rate10kg: 67, rate20kg: 105 },
  "Thailand": { rate10kg: 65, rate20kg: 105 },
  "Vietnam": { rate10kg: 65, rate20kg: 105 },
  "Indonesia": { rate10kg: 65, rate20kg: 105 },
  "Malaysia": { rate10kg: 65, rate20kg: 105 },
  "Singapore": { rate10kg: 65, rate20kg: 105 },
  "Sri Lanka": { rate10kg: 65, rate20kg: 105 },
  "Philippines": { rate10kg: 65, rate20kg: 105 },
  "Taiwan": { rate10kg: 65, rate20kg: 105 },
  "Maldives": { rate10kg: 65, rate20kg: 105 },
  "Fiji": { rate10kg: 98, rate20kg: 180 },
  "French Polynesia": { rate10kg: 99, rate20kg: 180 },
  "Germany": { rate10kg: 11.49, rate20kg: 19.49, express10kg: 40, express20kg: 45 }
};

// ✨ UPDATED PaymentForm: Now accepts packagingType AND giftNote
function PaymentForm({ amount, formData, cart, isExpress, packagingType, giftNote }: { amount: number, formData: any, cart: any[], isExpress: boolean, packagingType: 'standard' | 'gift', giftNote: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage(); 
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
      redirect: "if_required", 
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      
      // ✨ NEW LOGIC: Append Gift Note to Shipping Method String
      // e.g. "Express + Gift Packaging (Note: Happy Birthday!)"
      let shippingMethodString = isExpress ? "Express" : "Standard";
      if (packagingType === 'gift') {
        shippingMethodString += " + Gift Packaging";
        if (giftNote && giftNote.trim() !== "") {
            shippingMethodString += ` (Note: ${giftNote})`;
        }
      }

      const { error: dbError } = await supabase.from('orders').insert([{
          customer_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          country: formData.country,
          shipping_method: shippingMethodString, 
          items: cart, 
          total: amount,
          status: 'paid',
          payment_id: paymentIntent.id
      }]);

      if (dbError) console.error("Error saving order:", dbError);

      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: `${formData.address}, ${formData.city}, ${formData.country}`,
          items: cart,
          total: amount,
          shippingMethod: shippingMethodString
        }),
      });

      window.location.href = "/success";
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      {message && <div className="text-red-600 text-sm bg-red-600/10 p-3 rounded font-medium">{message}</div>}
      <button disabled={isLoading || !stripe || !elements} className="w-full bg-[#1F1F1F] hover:bg-[#C9A24D] font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
        <span style={{ color: 'white' }} className="!text-white">{isLoading ? t('checkout_processing') : `${t('checkout_pay')} €${amount.toFixed(2)}`}</span>
      </button>
      <p className="text-xs text-center text-[#1F1F1F]/50 flex items-center justify-center gap-1 font-medium"><Lock size={10} /> Secure Encrypted Checkout</p>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { t, language } = useLanguage(); 
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState("");
  const [isExpress, setIsExpress] = useState(false); 
  const [packagingType, setPackagingType] = useState<'standard' | 'gift'>('standard'); 
  const [giftNote, setGiftNote] = useState(""); // ✨ NEW: Gift Note State
  const [agreedToPolicy, setAgreedToPolicy] = useState(false); 
  const [agreedToCustoms, setAgreedToCustoms] = useState(false); 
  const [agreedToWithdrawal, setAgreedToWithdrawal] = useState(false); 

  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", address: "", city: "", zip: "", phone: "", country: "Germany"
  });

  const { shippingCost, needs20kg } = useMemo(() => {
    const countryData = shippingRates[formData.country] || { rate10kg: 0, rate20kg: 0 };
    const weight20kg = cart.some(item => {
      const optionValues = Object.values(item.options || {}).join(" ");
      return optionValues.includes("100") || optionValues.includes("200") || optionValues.includes("150");
    });

    let cost = weight20kg ? countryData.rate20kg : countryData.rate10kg;
    
    // Applying Express Surcharge for Germany
    if (isExpress && formData.country === "Germany") {
        cost = weight20kg ? (countryData.express20kg || cost) : (countryData.express10kg || cost);
    }

    return { shippingCost: cost, needs20kg: weight20kg };
  }, [formData.country, cart, isExpress]);

  // Calculate Packaging Cost
  const packagingCost = packagingType === 'gift' ? 10 : 0;

  // Total includes packaging
  const finalTotal = cartTotal + shippingCost + packagingCost;

  const isNonEU = useMemo(() => !euCountries.includes(formData.country), [formData.country]);

  const hasPersonalization = useMemo(() => {
    return cart.some(item => 
      item.customText || 
      (item.options && Object.values(item.options).some(val => 
        String(val).toLowerCase().includes('letter') || 
        String(val).toLowerCase().includes('message') ||
        String(val).toLowerCase().includes('note')
      ))
    );
  }, [cart]);

  const isSupplyOrder = useMemo(() => {
    return cart.some(item => 
        item.category === 'supplies' || item.category === 'Floristenbedarf'
    );
  }, [cart]);

  // ✨ CHECK IF COUNTRY IS BLACKLISTED
  const isBlacklisted = shippingBlacklist.includes(formData.country);

  const canProceed = useMemo(() => {
    const hasAddress = formData.email && formData.phone && formData.address && formData.city && formData.zip;
    const policyValid = agreedToPolicy;
    const customsValid = isNonEU ? agreedToCustoms : true;
    const withdrawalValid = (!isNonEU && hasPersonalization) ? agreedToWithdrawal : true; 
    
    // ✨ BLOCK IF BLACKLISTED
    if (isBlacklisted) return false;

    return hasAddress && policyValid && customsValid && withdrawalValid;
  }, [formData, agreedToPolicy, agreedToCustoms, agreedToWithdrawal, isNonEU, hasPersonalization, isBlacklisted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "country" && e.target.value !== "Germany") setIsExpress(false);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) {
      if (isBlacklisted) {
          alert(`We are sorry, but we currently do not ship to ${formData.country}.`);
          return;
      }
      alert(language === 'EN' ? "Please complete all fields and agree to the required policies." : "Bitte füllen Sie alle Felder aus und stimmen Sie den erforderlichen Bedingungen zu.");
      return;
    }
    setStep(2); 
  };

  useEffect(() => {
    if (step === 2 && finalTotal > 0) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(finalTotal * 100) }),
      }).then((res) => res.json()).then((data) => setClientSecret(data.clientSecret));
    }
  }, [step, finalTotal]);

  if (cart.length === 0) return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{t('checkout_empty')}</h1>
      <Link href="/" className="text-[#C9A24D] font-bold hover:underline">{t('back_to_shop')}</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white pb-20">
      <header className="p-6 border-b border-black/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#1F1F1F]/60 font-medium"><ArrowLeft size={18} /> {t('checkout_back')}</Link>
        <div className="flex items-center gap-2 text-green-600 text-sm font-bold"><Lock size={14} /> {t('checkout_secure')}</div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <div className="space-y-8">
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
                <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-[#C9A24D]" /> {t('checkout_contact')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="email" name="email" placeholder={`${t('checkout_email')} *`} value={formData.email} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                  <input required type="tel" name="phone" placeholder={`${t('checkout_phone')} *`} value={formData.phone} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-black/10">
                <h2 className="text-2xl font-bold">{t('checkout_address')}</h2>
                <div className="relative">
                  <Globe className="absolute left-4 top-4 text-[#1F1F1F]/30" size={18} />
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl pl-12 pr-4 py-4 focus:border-[#C9A24D] outline-none font-bold cursor-pointer appearance-none">
                    {Object.keys(shippingRates).concat(shippingBlacklist).sort().map(country => <option key={country} value={country}>{country}</option>)}
                  </select>
                </div>

                {/* ✨ NEW: Blacklist Error Message */}
                {isBlacklisted && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-pulse">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">
                            {language === 'EN' 
                                ? `We currently do not ship to ${formData.country}.` 
                                : `Wir liefern derzeit nicht nach ${formData.country}.`}
                        </span>
                    </div>
                )}

                {/* 🚀 Express Toggle for Germany */}
                {formData.country === "Germany" && (
                    <div 
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isExpress ? 'bg-[#1F1F1F] border-[#1F1F1F] shadow-lg' : 'bg-white/50 border-black/10'}`} 
                      onClick={() => setIsExpress(!isExpress)}
                      style={{ backgroundColor: isExpress ? '#1F1F1F' : '' }} /* ✅ FORCE INLINE STYLE */
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isExpress ? 'bg-[#C9A24D]/20 text-[#C9A24D]' : 'bg-black/5 text-gray-400'}`}><Zap size={18} /></div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: isExpress ? 'white' : '#1F1F1F' }}>Express Shipping (Next Day)</p>
                              <p className={`text-[10px] ${isExpress ? 'text-white/60' : 'text-gray-400'}`} style={{ color: isExpress ? 'rgba(255,255,255,0.6)' : '' }}>Priority handling & fast delivery</p>
                            </div>
                        </div>
                        <p className="font-bold" style={{ color: isExpress ? 'white' : '#1F1F1F' }}>€{needs20kg ? "45.00" : "40.00"}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="firstName" placeholder={`${t('checkout_first_name')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                  <input required type="text" name="lastName" placeholder={`${t('checkout_last_name')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                </div>

                {/* 📍 ADDRESS AUTOCOMPLETE FIELD */}
                <AutoComplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} 
                    onPlaceSelected={(place) => {
                      const addressComponents = place.address_components;
                      const city = addressComponents.find((c: any) => c.types.includes("locality"))?.long_name || "";
                      const zip = addressComponents.find((c: any) => c.types.includes("postal_code"))?.long_name || "";
                      setFormData({ ...formData, address: place.formatted_address, city, zip });
                    }}
                    options={{ types: ["address"], fields: ["formatted_address", "address_components"] }}
                    className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]"
                    placeholder={`${t('checkout_street')} * (Start typing your address...)`}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="city" placeholder={`${t('checkout_city')} *`} value={formData.city} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                  <input required type="text" name="zip" placeholder={`${t('checkout_zip')} *`} value={formData.zip} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                </div>

                {/* ✨ NEW: PACKAGING OPTIONS SELECTION */}
                <div className="space-y-4 pt-6 border-t border-black/10">
                  <h2 className="text-2xl font-bold">{language === 'EN' ? "Packaging Options" : "Verpackungsoptionen"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Standard Option */}
                    <div 
                      onClick={() => setPackagingType('standard')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${packagingType === 'standard' ? 'bg-[#1F1F1F] border-[#1F1F1F] shadow-md' : 'bg-white/50 border-black/10 hover:border-[#C9A24D]'}`}
                      style={{ backgroundColor: packagingType === 'standard' ? '#1F1F1F' : '' }}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-lg ${packagingType === 'standard' ? 'bg-[#C9A24D]/20 text-[#C9A24D]' : 'bg-black/5 text-[#1F1F1F]/40'}`}>
                          <Package size={20} />
                        </div>
                        {packagingType === 'standard' && <div className="w-3 h-3 rounded-full bg-[#C9A24D] shadow-[0_0_10px_#C9A24D]" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase tracking-wide" style={{ color: packagingType === 'standard' ? 'white' : '#1F1F1F' }}>
                          {language === 'EN' ? "Standard" : "Standard"}
                        </p>
                        <p className={`text-xs ${packagingType === 'standard' ? 'text-white/60' : 'text-[#1F1F1F]/40'}`} style={{ color: packagingType === 'standard' ? 'rgba(255,255,255,0.6)' : '' }}>
                          {language === 'EN' ? "Secure & Safe" : "Sicher & Geschützt"}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-right mt-auto" style={{ color: packagingType === 'standard' ? 'white' : '#1F1F1F' }}>{language === 'EN' ? "Free" : "Kostenlos"}</p>
                    </div>

                    {/* Gift Option */}
                    <div 
                      onClick={() => setPackagingType('gift')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${packagingType === 'gift' ? 'bg-[#1F1F1F] border-[#1F1F1F] shadow-md' : 'bg-white/50 border-black/10 hover:border-[#C9A24D]'}`}
                      style={{ 
                        backgroundColor: packagingType === 'gift' ? '#1F1F1F' : '',
                        height: packagingType === 'gift' ? 'auto' : '8rem' /* Expand height when gift selected to fit input */
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-lg ${packagingType === 'gift' ? 'bg-[#C9A24D]/20 text-[#C9A24D]' : 'bg-black/5 text-[#1F1F1F]/40'}`}>
                          <Gift size={20} />
                        </div>
                        {packagingType === 'gift' && <div className="w-3 h-3 rounded-full bg-[#C9A24D] shadow-[0_0_10px_#C9A24D]" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase tracking-wide" style={{ color: packagingType === 'gift' ? 'white' : '#1F1F1F' }}>
                          {language === 'EN' ? "Gift Packaging" : "Geschenkverpackung"}
                        </p>
                        <p className={`text-xs ${packagingType === 'gift' ? 'text-white/60' : 'text-[#1F1F1F]/40'}`} style={{ color: packagingType === 'gift' ? 'rgba(255,255,255,0.6)' : '' }}>
                          {language === 'EN' ? "Themed & Decorative" : "Thematisch & Dekorativ"}
                        </p>
                      </div>
                      
                      {/* ✨ NEW: Optional Note Input - Only appears when Gift is selected */}
                      {packagingType === 'gift' && (
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            placeholder={language === 'EN' ? "Occasion (e.g. Birthday) or short note..." : "Anlass (z.B. Geburtstag) oder kurze Notiz..."}
                            value={giftNote}
                            onChange={(e) => setGiftNote(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#C9A24D] resize-none"
                            rows={2}
                          />
                        </div>
                      )}

                      <p className="font-bold text-sm text-right mt-3 text-[#C9A24D]">+ €10.00</p>
                    </div>
                  </div>
                </div>

                {/* ⚖️ EU RIGHT OF WITHDRAWAL NOTICE (Conditional) */}
                {hasPersonalization && !isNonEU && (
                  <div className="space-y-4 mt-6 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-gray-50 border border-black/5 rounded-xl space-y-2">
                      <p className="text-[11px] text-[#1F1F1F]/80 leading-relaxed italic">
                        {language === 'EN' 
                          ? "This product is personalized and is made specifically according to your individual specifications. Therefore, there is no right of withdrawal in accordance with EU consumer law."
                          : "Dieses Produkt ist personalisiert und wird speziell nach Ihren individuellen Angaben hergestellt. Daher besteht gemäß EU-Verbraucherrecht kein Widerrufsrecht."
                        }
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl">
                      <input 
                        required
                        type="checkbox" 
                        id="withdrawalPolicy"
                        checked={agreedToWithdrawal}
                        onChange={(e) => setAgreedToWithdrawal(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#C9A24D] cursor-pointer"
                      />
                      <label htmlFor="withdrawalPolicy" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">
                        {language === 'EN' 
                          ? "I acknowledge that for my personalized items, the right of withdrawal is excluded."
                          : "Ich nehme zur Kenntnis, dass für meine personalisierten Artikel das Widerrufsrecht ausgeschlossen ist."
                        } *
                      </label>
                    </div>
                  </div>
                )}

                {/* 🛃 CUSTOMS NOTICE (Only for Non-EU) */}
                {isNonEU && (
                  <div className="space-y-4 mt-6 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
                      <AlertCircle size={20} className="flex-shrink-0" />
                      <div className="text-xs leading-relaxed">
                        <p className="font-bold mb-1">
                          {language === 'EN' ? "Important: Customs & Duties" : "Wichtig: Zoll & Steuern"}
                        </p>
                        <p>
                          {language === 'EN' 
                            ? "Shipments to countries outside the EU may be subject to import duties and taxes. These costs are the responsibility of the recipient."
                            : "Lieferungen in Länder außerhalb der EU können Einfuhrzöllen und Steuern unterliegen. Diese Kosten sind vom Empfänger zu tragen."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl">
                      <input 
                        required
                        type="checkbox" 
                        id="customsAgreement"
                        checked={agreedToCustoms}
                        onChange={(e) => setAgreedToCustoms(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#C9A24D] cursor-pointer"
                      />
                      <label htmlFor="customsAgreement" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">
                        {language === 'EN' 
                          ? "I understand that any customs duties, taxes, or import fees that may apply are my responsibility and must be paid by me."
                          : "Ich verstehe, dass anfallende Zollgebühren, Steuern oder Einfuhrabgaben in meiner Verantwortung liegen und von mir bezahlt werden müssen."
                        } *
                      </label>
                    </div>
                  </div>
                )}

                {/* 📦 MANDATORY DELIVERY POLICY CHECKBOX */}
                <div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl mt-4">
                  <input required type="checkbox" id="deliveryPolicy" checked={agreedToPolicy} onChange={(e) => setAgreedToPolicy(e.target.checked)} className="mt-1 w-4 h-4 accent-[#C9A24D] cursor-pointer" />
                  <label htmlFor="deliveryPolicy" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">
                    {language === 'EN' 
                      ? "I agree that if delivery fails, my parcel may be delivered to a neighbor or nearby parcel shop. Returns to the sender are excluded."
                      : "Ich stimme zu, dass mein Paket bei einem erfolglosen Zustellversuch an einen Nachbarn oder Paketshop geliefert werden kann. Rücksendungen sind ausgeschlossen."
                    } *
                  </label>
                </div>

              </div>
              <button 
                type="submit" 
                disabled={!canProceed} 
                className="w-full bg-[#1F1F1F] hover:bg-[#C9A24D] py-5 rounded-xl transition-all text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {t('checkout_continue')} <ArrowLeft className="rotate-180" size={18} />
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-white/40 border border-black/5 p-6 rounded-2xl flex justify-between items-center shadow-sm">
                <div><p className="text-[#1F1F1F]/50 text-sm font-medium">Shipping {isExpress ? "(Express)" : "(Standard)"} to:</p><p className="font-bold">{formData.address}, {formData.city}, {formData.country}</p></div>
                <button onClick={() => setStep(1)} className="text-[#C9A24D] text-sm font-bold hover:underline">{t('checkout_change')}</button>
              </div>
              <h2 className="text-2xl font-bold pt-4">{t('checkout_method')}</h2>
              {clientSecret ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1F1F1F' } } }}>
                    <PaymentForm amount={finalTotal} formData={formData} cart={cart} isExpress={isExpress} packagingType={packagingType} giftNote={giftNote} />
                  </Elements>
                </div>
              ) : <div className="p-8 text-center text-[#1F1F1F]/40 font-medium">{t('checkout_loading_payment')}</div>}
            </div>
          )}
        </div>

        <div className="bg-white/40 border border-black/5 rounded-3xl p-8 h-fit shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-xl mb-6">{t('checkout_summary')}</h3>
          <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.uniqueId} className="flex gap-4">
                <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-black/10 relative flex-shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                <div className="flex-1"><h4 className="font-bold text-sm">{item.name}</h4><p className="text-xs text-[#1F1F1F]/60 font-medium">{item.options ? Object.values(item.options).join(", ") : ""}</p></div>
                <div className="font-mono text-sm font-bold">€{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          {/* ✨ NEW: Supply Order Shipping Notice */}
          {isSupplyOrder && (
            <div className="mb-6 bg-[#F6EFE6] border border-[#D4C29A] p-4 rounded-xl flex items-start gap-3">
              <div className="bg-[#D4C29A]/20 p-2 rounded-full text-[#D4C29A]">
                <Truck size={16} />
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] text-xs uppercase tracking-wider mb-1">
                  {language === 'EN' ? "Florist Supplies Shipping" : "Versand Floristenbedarf"}
                </h4>
                <p className="text-[10px] text-[#1F1F1F]/70 leading-relaxed font-medium">
                  {language === 'EN' 
                    ? "Orders containing supplies are shipped within 24-48h. Delivery: 2–7 days within Germany."
                    : "Bestellungen mit Floristenbedarf werden innerhalb von 24-48h versendet. Lieferzeit: 2–7 Tage innerhalb Deutschlands."}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 border-t border-black/10 pt-6">
            <div className="flex justify-between text-[#1F1F1F]/60 font-medium"><span>Subtotal</span><span>€{cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-[#1F1F1F]/60 font-medium">
              <span>Shipping ({formData.country} - {isExpress ? "Express" : "Standard"})</span>
              <span>€{shippingCost.toFixed(2)}</span>
            </div>
            {/* ✨ NEW: Packaging Cost Line Item */}
            {packagingType === 'gift' && (
              <div className="flex justify-between text-[#C9A24D] font-bold text-sm">
                <span>Gift Packaging</span>
                <span>+€10.00</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-[#1F1F1F] pt-4 border-t border-black/10"><span>{t('checkout_total')}</span><span className="text-[#C9A24D]">€{finalTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}