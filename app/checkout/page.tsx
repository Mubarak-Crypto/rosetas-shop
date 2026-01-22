"use client";

import { useState, useEffect, useMemo } from "react";
// ✨ Added 'Plane' to imports for Vacation Mode
import { ArrowLeft, Lock, ShieldCheck, Mail, Phone, Globe, Zap, AlertCircle, Truck, Gift, Package, Coffee, Droplets, Heart, Check, Tag, Loader2, Plane } from "lucide-react"; 
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext"; 
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "../../lib/supabase"; 
import AutoComplete from "react-google-autocomplete"; 

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

// 🌏 Rosetta's Global Shipping Data
// ✨ UPDATED: USA Rates (5kg=100, 10kg=150, 20kg=210). 
// Note: 'rate10kg' is used as the base for Standard items (5kg tier here).
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
  // ✨ USA: Standard (5kg) = 100, Heavy (20kg) = 210. (10kg=150 logic reserved for medium items)
  "United States": { rate10kg: 100, rate20kg: 210 }, 
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

// Payment Form Component
function PaymentForm({ 
  amount, 
  formData, 
  cart, 
  isExpress, 
  packagingType, 
  giftNote,
  tipAmount, 
  donationAmount, 
  donorName, 
  isPublicDonor,
  discountCode, 
  discountAmount 
}: { 
  amount: number, 
  formData: any, 
  cart: any[], 
  isExpress: boolean, 
  packagingType: 'standard' | 'gift', 
  giftNote: string,
  tipAmount: number,
  donationAmount: number,
  donorName: string,
  isPublicDonor: boolean,
  discountCode: string | null,
  discountAmount: number
}) {
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
      
      let shippingMethodString = isExpress ? "Express" : "Standard";
      // ✨ FORCE EXPRESS LABEL FOR USA
      if (formData.country === "United States") {
          shippingMethodString = "Express (USA)";
      }

      if (packagingType === 'gift') {
        shippingMethodString += " + Gift Packaging";
        if (giftNote && giftNote.trim() !== "") {
            shippingMethodString += ` (Note: ${giftNote})`;
        }
      }

      // ✨ UPDATED: Include Discount Info in Database
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
          payment_id: paymentIntent.id,
          tip_amount: tipAmount,
          donation_amount: donationAmount,
          donor_name: donorName,
          donor_is_public: isPublicDonor,
          discount_code: discountCode, 
          discount_amount: discountAmount 
      }]);

      if (dbError) console.error("Error saving order:", dbError);

      // ✨ Update Discount Usage Count
      if (discountCode) {
          const { data: codeData } = await supabase.from('discount_codes').select('id, current_uses').eq('code', discountCode).single();
          if (codeData) {
              await supabase.from('discount_codes').update({ current_uses: (codeData.current_uses || 0) + 1 }).eq('id', codeData.id);
          }
      }

      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: `${formData.address}, ${formData.city}, ${formData.country}`,
          items: cart,
          total: amount,
          shippingMethod: `${shippingMethodString}${tipAmount > 0 ? ` + Tip: €${tipAmount.toFixed(2)}` : ""}${donationAmount > 0 ? ` + Donation: €${donationAmount.toFixed(2)}` : ""}${discountCode ? ` + Code: ${discountCode}` : ""}`
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
  const [giftNote, setGiftNote] = useState(""); 
  
  // Policies & Agreements
  const [agreedToPolicy, setAgreedToPolicy] = useState(false); 
  const [agreedToCustoms, setAgreedToCustoms] = useState(false); 
  const [agreedToWithdrawal, setAgreedToWithdrawal] = useState(false); 
  const [agreedToCancellation, setAgreedToCancellation] = useState(false); 

  // ✨ NEW: Vacation Mode State
  const [vacationSettings, setVacationSettings] = useState({ isActive: false, endDate: '', message: '' });
  const [agreedToVacation, setAgreedToVacation] = useState(false);

  // Benevolence
  const [tipOption, setTipOption] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [showDonation, setShowDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [donationOption, setDonationOption] = useState<number | 'custom' | null>(null);
  const [donorName, setDonorName] = useState("");
  const [isPublicDonor, setIsPublicDonor] = useState(false);
  const [isDonationActive, setIsDonationActive] = useState(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  useEffect(() => {
      const fetchSettings = async () => {
          const { data } = await supabase
              .from('storefront_settings')
              .select('*') // ✨ Fetch all fields including vacation
              .eq('id', '00000000-0000-0000-0000-000000000000') 
              .single();
          
          if (data) {
              setIsDonationActive(data.is_donation_active);
              // ✨ NEW: Set Vacation Data
              setVacationSettings({
                  isActive: data.is_vacation_mode_active,
                  endDate: data.vacation_end_date,
                  message: data.vacation_message
              });
          }
      };
      fetchSettings();
  }, []);

  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", address: "", city: "", zip: "", phone: "", country: "Germany"
  });

  // ✨ UPDATED: Shipping Calculation Logic
  const { shippingCost, needs20kg, standardCost, expressCost, boxCount } = useMemo(() => {
    const countryData = shippingRates[formData.country] || { rate10kg: 0, rate20kg: 0 };
    
    // Check if heavy items exist
    const weight20kg = cart.some(item => {
      const optionValues = Object.values(item.options || {}).join(" ");
      return optionValues.includes("100") || optionValues.includes("200") || optionValues.includes("150");
    });

    // Count Shippable "Big Boxes" (Items NOT in supplies/Floristenbedarf)
    const shippableItemsCount = cart.reduce((count, item) => {
        if (item.category !== 'supplies' && item.category !== 'Floristenbedarf') {
            return count + item.quantity;
        }
        return count;
    }, 0);

    // If only supplies are bought, charge for at least 1 box
    const finalBoxCount = Math.max(1, shippableItemsCount);

    // Base Costs (Single Box)
    const baseStd = weight20kg ? countryData.rate20kg : countryData.rate10kg;
    
    // Express Logic (Germany Only)
    let baseExp = baseStd;
    if (formData.country === "Germany") {
        baseExp = weight20kg ? (countryData.express20kg || baseStd) : (countryData.express10kg || baseStd);
    }

    // Multiply by number of boxes
    const totalStd = baseStd * finalBoxCount;
    const totalExp = baseExp * finalBoxCount;

    // Determine currently selected cost
    const currentCost = (isExpress && formData.country === "Germany") ? totalExp : totalStd;

    return { 
        shippingCost: currentCost, 
        needs20kg: weight20kg, 
        standardCost: totalStd, 
        expressCost: totalExp,
        boxCount: finalBoxCount 
    };
  }, [formData.country, cart, isExpress]);

  const packagingCost = packagingType === 'gift' ? 10 : 0;
  
  // Total Calculation
  const finalTotal = Math.max(0, cartTotal + shippingCost + packagingCost + tipAmount + donationAmount - discountAmount);

  // Handle Code Apply
  const handleApplyCode = async () => {
      if (!promoCodeInput.trim()) return;
      setIsCheckingCode(true);
      setPromoError("");

      const code = promoCodeInput.toUpperCase().trim();

      try {
          const { data, error } = await supabase
              .from('discount_codes')
              .select('*')
              .eq('code', code)
              .single();

          if (error || !data) {
              setPromoError("Invalid Code");
              setIsCheckingCode(false);
              return;
          }

          if (!data.is_active) {
              setPromoError("This code is no longer active.");
              setIsCheckingCode(false);
              return;
          }

          if (data.expires_at && new Date(data.expires_at) < new Date()) {
              setPromoError("This code has expired.");
              setIsCheckingCode(false);
              return;
          }

          if (data.max_uses !== null && data.current_uses >= data.max_uses) {
              setPromoError("This code has reached its usage limit.");
              setIsCheckingCode(false);
              return;
          }

          if (data.min_order_value > 0 && cartTotal < data.min_order_value) {
              setPromoError(`Minimum order value of €${data.min_order_value} required.`);
              setIsCheckingCode(false);
              return;
          }

          // Calculate Discount
          let discount = 0;
          if (data.discount_type === 'percentage') {
              discount = (cartTotal * data.value) / 100;
          } else {
              discount = data.value;
          }

          discount = Math.min(discount, cartTotal);

          setDiscountAmount(discount);
          setAppliedCode(code);
          setPromoCodeInput(""); 
      } catch (err) {
          setPromoError("Error checking code.");
      } finally {
          setIsCheckingCode(false);
      }
  };

  const removeCode = () => {
      setAppliedCode(null);
      setDiscountAmount(0);
      setPromoError("");
  };

  const handleTipClick = (type: string) => {
    if (tipOption === type && type !== 'custom') {
        setTipOption(null);
        setTipAmount(0);
    } else {
        setTipOption(type);
        if (type === '3%') setTipAmount(Math.round((cartTotal * 0.03) * 100) / 100);
        else if (type === '5%') setTipAmount(Math.round((cartTotal * 0.05) * 100) / 100);
        else if (type === '5eur') setTipAmount(5);
        else if (type === 'custom') setTipAmount(0); 
    }
  };

  const handleDonationClick = (val: number | 'custom') => {
      if (donationOption === val && val !== 'custom') {
          setDonationOption(null);
          setDonationAmount(0);
      } else {
          setDonationOption(val);
          if (typeof val === 'number') setDonationAmount(val);
          else setDonationAmount(0);
      }
  };

  const isNonEU = useMemo(() => !euCountries.includes(formData.country), [formData.country]);

  const hasPersonalization = useMemo(() => {
    return cart.some(item => 
      item.customText || 
      (item.options && Object.values(item.options).some(val => 
        String(val).toLowerCase().includes('letter') || 
        String(val).toLowerCase().includes('message') ||
        String(val).toLowerCase().includes('note')
      )) ||
      (item.extras && Array.isArray(item.extras) && item.extras.length > 0)
    );
  }, [cart]);

  const isSupplyOrder = useMemo(() => {
    return cart.some(item => 
        item.category === 'supplies' || item.category === 'Floristenbedarf'
    );
  }, [cart]);

  const isBlacklisted = shippingBlacklist.includes(formData.country);

  // ✨ UPDATED: Added 'vacationValid' check
  const canProceed = useMemo(() => {
    const hasAddress = formData.email && formData.phone && formData.address && formData.city && formData.zip;
    const policyValid = agreedToPolicy;
    const customsValid = isNonEU ? agreedToCustoms : true;
    const withdrawalValid = (!isNonEU && hasPersonalization) ? agreedToWithdrawal : true; 
    const cancellationValid = agreedToCancellation; 
    
    // ✨ Vacation Check: If active, must be agreed. If not active, it's always valid.
    const vacationValid = !vacationSettings.isActive || agreedToVacation;

    const giftNoteValid = packagingType === 'gift' ? giftNote.trim().length > 0 : true;

    if (isBlacklisted) return false;

    return hasAddress && policyValid && customsValid && withdrawalValid && giftNoteValid && cancellationValid && vacationValid;
  }, [formData, agreedToPolicy, agreedToCustoms, agreedToWithdrawal, isNonEU, hasPersonalization, isBlacklisted, packagingType, giftNote, agreedToCancellation, vacationSettings.isActive, agreedToVacation]);

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
      
      if (packagingType === 'gift' && giftNote.trim().length === 0) {
          alert(language === 'EN' ? "Please enter a message or occasion for your gift packaging." : "Bitte geben Sie eine Nachricht oder einen Anlass für Ihre Geschenkverpackung ein.");
          return;
      }

      // ✨ NEW ALERT for Vacation Mode
      if (vacationSettings.isActive && !agreedToVacation) {
          alert(language === 'EN' ? "Please agree to the shipping delay notice." : "Bitte stimmen Sie dem Hinweis zur Lieferverzögerung zu.");
          return;
      }

      alert(language === 'EN' ? "Please complete all fields and agree to the required policies." : "Bitte füllen Sie alle Felder aus und stimmen Sie den erforderlichen Bedingungen zu.");
      return;
    }
    setStep(2); 
  };

  useEffect(() => {
    if (step === 2 && finalTotal > 0.50) { // ✨ CHECK: Ensure total is valid for Stripe
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✨ SECURE: We send the cart details + extras so the server can verify
        // Note: You must update your backend to use 'cart' to recalculate price if you want 100% security
        body: JSON.stringify({ 
            amount: Math.round(finalTotal * 100),
            discountCode: appliedCode,
            cart: cart, 
            country: formData.country,
            isExpress: isExpress,
            packagingType: packagingType,
            tipAmount: tipAmount,
            donationAmount: donationAmount
        }),
      }).then((res) => res.json()).then((data) => setClientSecret(data.clientSecret));
    }
  }, [step, finalTotal, appliedCode, cart, formData.country, isExpress, packagingType, tipAmount, donationAmount]);

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
              
              {/* CONTACT */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-[#C9A24D]" /> {t('checkout_contact')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="email" name="email" placeholder={`${t('checkout_email')} *`} value={formData.email} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                  <input required type="tel" name="phone" placeholder={`${t('checkout_phone')} *`} value={formData.phone} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" />
                </div>
              </div>

              {/* SHIPPING ADDRESS */}
              <div className="space-y-4 pt-6 border-t border-black/10">
                <h2 className="text-2xl font-bold">{t('checkout_address')}</h2>
                <div className="relative">
                  <Globe className="absolute left-4 top-4 text-[#1F1F1F]/30" size={18} />
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl pl-12 pr-4 py-4 focus:border-[#C9A24D] outline-none font-bold cursor-pointer appearance-none">
                    {Object.keys(shippingRates).concat(shippingBlacklist).sort().map(country => <option key={country} value={country}>{country}</option>)}
                  </select>
                </div>
                {isBlacklisted && <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-pulse"><AlertCircle size={20} /><span className="text-sm font-bold">{language === 'EN' ? `We currently do not ship to ${formData.country}.` : `Wir liefern derzeit nicht nach ${formData.country}.`}</span></div>}
                
                {/* Germany Specific Shipping Selection */}
                {formData.country === "Germany" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                            onClick={() => setIsExpress(false)} 
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${!isExpress ? 'bg-[#1F1F1F] border-[#1F1F1F] shadow-lg' : 'bg-white/50 border-black/10 hover:border-[#C9A24D]'}`} 
                            style={{ backgroundColor: !isExpress ? '#1F1F1F' : '' }}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg ${!isExpress ? 'bg-[#C9A24D]/20 text-[#C9A24D]' : 'bg-black/5 text-[#1F1F1F]/40'}`}><Truck size={20} /></div>
                                {!isExpress && <div className="w-3 h-3 rounded-full bg-[#C9A24D] shadow-[0_0_10px_#C9A24D]" />}
                            </div>
                            <div>
                                <p className="font-bold text-sm uppercase tracking-wide" style={{ color: !isExpress ? 'white' : '#1F1F1F' }}>Standard</p>
                                <p className="font-bold text-sm text-right mt-auto" style={{ color: !isExpress ? 'white' : '#1F1F1F' }}>€{standardCost.toFixed(2)}</p>
                            </div>
                        </div>

                        <div 
                            onClick={() => setIsExpress(true)} 
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${isExpress ? 'bg-[#1F1F1F] border-[#1F1F1F] shadow-lg' : 'bg-white/50 border-black/10 hover:border-[#C9A24D]'}`} 
                            style={{ backgroundColor: isExpress ? '#1F1F1F' : '' }}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg ${isExpress ? 'bg-[#C9A24D]/20 text-[#C9A24D]' : 'bg-black/5 text-[#1F1F1F]/40'}`}><Zap size={20} /></div>
                                {isExpress && <div className="w-3 h-3 rounded-full bg-[#C9A24D] shadow-[0_0_10px_#C9A24D]" />}
                            </div>
                            <div>
                                <p className="font-bold text-sm uppercase tracking-wide" style={{ color: isExpress ? 'white' : '#1F1F1F' }}>Express (Next Day)</p>
                                <p className="font-bold text-sm text-right mt-auto" style={{ color: isExpress ? 'white' : '#1F1F1F' }}>€{expressCost.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4"><input required type="text" name="firstName" placeholder={`${t('checkout_first_name')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" /><input required type="text" name="lastName" placeholder={`${t('checkout_last_name')} *`} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" /></div>
                <AutoComplete apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} onPlaceSelected={(place) => { const addressComponents = place.address_components; const city = addressComponents.find((c: any) => c.types.includes("locality"))?.long_name || ""; const zip = addressComponents.find((c: any) => c.types.includes("postal_code"))?.long_name || ""; setFormData({ ...formData, address: place.formatted_address, city, zip }); }} options={{ types: ["address"], fields: ["formatted_address", "address_components"] }} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none text-[#1F1F1F]" placeholder={`${t('checkout_street')} * (Start typing your address...)`} />
                <div className="grid grid-cols-2 gap-4"><input required type="text" name="city" placeholder={`${t('checkout_city')} *`} value={formData.city} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" /><input required type="text" name="zip" placeholder={`${t('checkout_zip')} *`} value={formData.zip} onChange={handleChange} className="w-full bg-white/50 border border-black/10 rounded-xl p-4 focus:border-[#C9A24D] outline-none" /></div>
                
                {/* PACKAGING OPTIONS */}
                <div className="space-y-4 pt-6 border-t border-black/10">
                  <h2 className="text-2xl font-bold">{language === 'EN' ? "Packaging Options" : "Verpackungsoptionen"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div onClick={() => setPackagingType('standard')} className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${packagingType === 'standard' ? 'bg-[#1F1F1F] border-[#1F1F1F] shadow-md' : 'bg-white/50 border-black/10 hover:border-[#C9A24D]'}`} style={{ backgroundColor: packagingType === 'standard' ? '#1F1F1F' : '' }}><div className="flex justify-between items-start"><div className={`p-2 rounded-lg ${packagingType === 'standard' ? 'bg-[#C9A24D]/20 text-[#C9A24D]' : 'bg-black/5 text-[#1F1F1F]/40'}`}><Package size={20} /></div>{packagingType === 'standard' && <div className="w-3 h-3 rounded-full bg-[#C9A24D] shadow-[0_0_10px_#C9A24D]" />}</div><div><p className="font-bold text-sm uppercase tracking-wide" style={{ color: packagingType === 'standard' ? 'white' : '#1F1F1F' }}>{language === 'EN' ? "Standard" : "Standard"}</p><p className={`text-xs ${packagingType === 'standard' ? 'text-white/60' : 'text-[#1F1F1F]/40'}`} style={{ color: packagingType === 'standard' ? 'rgba(255,255,255,0.6)' : '' }}>{language === 'EN' ? "Secure & Safe" : "Sicher & Geschützt"}</p></div><p className="font-bold text-sm text-right mt-auto" style={{ color: packagingType === 'standard' ? 'white' : '#1F1F1F' }}>{language === 'EN' ? "Free" : "Kostenlos"}</p></div>
                    <div onClick={() => setPackagingType('gift')} className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${packagingType === 'gift' ? 'bg-[#1F1F1F] border-[#1F1F1F] shadow-md' : 'bg-white/50 border-black/10 hover:border-[#C9A24D]'}`} style={{ backgroundColor: packagingType === 'gift' ? '#1F1F1F' : '', height: packagingType === 'gift' ? 'auto' : '8rem' }}><div className="flex justify-between items-start"><div className={`p-2 rounded-lg ${packagingType === 'gift' ? 'bg-[#C9A24D]/20 text-[#C9A24D]' : 'bg-black/5 text-[#1F1F1F]/40'}`}><Gift size={20} /></div>{packagingType === 'gift' && <div className="w-3 h-3 rounded-full bg-[#C9A24D] shadow-[0_0_10px_#C9A24D]" />}</div><div><p className="font-bold text-sm uppercase tracking-wide" style={{ color: packagingType === 'gift' ? 'white' : '#1F1F1F' }}>{language === 'EN' ? "Gift Packaging" : "Geschenkverpackung"}</p><p className={`text-xs ${packagingType === 'gift' ? 'text-white/60' : 'text-[#1F1F1F]/40'}`} style={{ color: packagingType === 'gift' ? 'rgba(255,255,255,0.6)' : '' }}>{language === 'EN' ? "Themed & Decorative" : "Thematisch & Dekorativ"}</p></div>{packagingType === 'gift' && (<div className="mt-3" onClick={(e) => e.stopPropagation()}><textarea placeholder={language === 'EN' ? "Occasion (e.g. Birthday) or short note... *" : "Anlass (z.B. Geburtstag) oder kurze Notiz... *"} value={giftNote} onChange={(e) => setGiftNote(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#C9A24D] resize-none" rows={2} />{!giftNote.trim() && (<p className="text-red-400 text-[10px] mt-1 font-bold animate-pulse">{language === 'EN' ? "* Required for gift options" : "* Erforderlich für Geschenkoptionen"}</p>)}</div>)}<p className="font-bold text-sm text-right mt-3 text-[#C9A24D]">+ €10.00</p></div>
                  </div>
                </div>

                {/* LEGAL CHECKBOXES */}
                {hasPersonalization && !isNonEU && (<div className="space-y-4 mt-6 animate-in slide-in-from-top-2"><div className="p-4 bg-gray-50 border border-black/5 rounded-xl space-y-2"><p className="text-[11px] text-[#1F1F1F]/80 leading-relaxed italic">{language === 'EN' ? "This product is personalized and is made specifically according to your individual specifications. Therefore, there is no right of withdrawal in accordance with EU consumer law." : "Dieses Produkt wird individuell nach Ihren persönlichen Angaben angefertigt. Daher besteht gemäß EU-Verbraucherrecht kein Widerrufsrecht."}</p></div><div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl"><input required type="checkbox" id="withdrawalPolicy" checked={agreedToWithdrawal} onChange={(e) => setAgreedToWithdrawal(e.target.checked)} className="mt-1 w-4 h-4 accent-[#C9A24D] cursor-pointer" /><label htmlFor="withdrawalPolicy" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">{language === 'EN' ? "I acknowledge that the right of withdrawal does not apply to personalized items." : "Ich nehme zur Kenntnis, dass das Widerrufsrecht für personalisierte Artikel ausgeschlossen ist."} *</label></div></div>)}
                {isNonEU && (<div className="space-y-4 mt-6 animate-in slide-in-from-top-2"><div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800"><AlertCircle size={20} className="flex-shrink-0" /><div className="text-xs leading-relaxed"><p className="font-bold mb-1">{language === 'EN' ? "Important: Customs & Duties" : "Wichtig: Zoll & Steuern"}</p><p>{language === 'EN' ? "Shipments to countries outside the EU may be subject to import duties and taxes. These costs are the responsibility of the recipient." : "Lieferungen in Länder außerhalb der EU können Einfuhrzöllen und Steuern unterliegen. Diese Kosten sind vom Empfänger zu tragen."}</p></div></div><div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl"><input required type="checkbox" id="customsAgreement" checked={agreedToCustoms} onChange={(e) => setAgreedToCustoms(e.target.checked)} className="mt-1 w-4 h-4 accent-[#C9A24D] cursor-pointer" /><label htmlFor="customsAgreement" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">{language === 'EN' ? "I understand that any customs duties, taxes, or import fees that may apply are my responsibility and must be paid by me." : "Ich verstehe, dass anfallende Zollgebühren, Steuern oder Einfuhrabgaben in meiner Verantwortung liegen und von mir bezahlt werden müssen."} *</label></div></div>)}
                <div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl mt-4"><input required type="checkbox" id="deliveryPolicy" checked={agreedToPolicy} onChange={(e) => setAgreedToPolicy(e.target.checked)} className="mt-1 w-4 h-4 accent-[#C9A24D] cursor-pointer" /><label htmlFor="deliveryPolicy" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">{language === 'EN' ? "I agree that if delivery is unsuccessful, my parcel may be delivered to a neighbor or a nearby parcel shop. Returns to the sender are excluded. Please note: If an order is returned and needs to be resent, the shipping costs must be paid again by the customer." : "Ich stimme zu, dass mein Paket bei einem erfolglosen Zustellversuch an einen Nachbarn oder einen Paketshop geliefert werden kann. Rücksendungen sind ausgeschlossen. Bitte beachten Sie: Wenn eine Bestellung zurückgesendet wird und erneut versendet werden muss, müssen die Versandkosten vom Kunden erneut bezahlt werden."} *</label></div>
                
                {/* Mandatory Cancellation Notice */}
                <div className="space-y-4 mt-6 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-900">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <div className="text-xs leading-relaxed">
                            <p className="font-bold mb-1">
                                {language === 'EN' ? "Important Notice" : "Wichtiger Hinweis"}
                            </p>
                            <p>
                                {language === 'EN' 
                                ? "As production starts shortly after the order is placed, cancellations are only possible within 3 hours after the order has been received." 
                                : "Da die Anfertigung zeitnah nach Bestelleingang startet, ist eine Stornierung nur innerhalb von 3 Stunden nach Bestelleingang möglich."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl">
                        <input 
                            required 
                            type="checkbox" 
                            id="cancellationAgreement" 
                            checked={agreedToCancellation} 
                            onChange={(e) => setAgreedToCancellation(e.target.checked)} 
                            className="mt-1 w-4 h-4 accent-[#C9A24D] cursor-pointer" 
                        />
                        <label htmlFor="cancellationAgreement" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">
                            {language === 'EN' 
                            ? "I have read and agree to the cancellation policy." 
                            : "Ich habe den Hinweis zur Stornierung gelesen und bin damit einverstanden."} *
                        </label>
                    </div>
                </div>

                {/* ✨ NEW: VACATION MODE NOTICE (Dynamic) */}
                {vacationSettings.isActive && (
                    <div className="space-y-4 mt-6 animate-in slide-in-from-top-2">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 text-blue-900">
                            <Plane size={20} className="flex-shrink-0" />
                            <div className="text-xs leading-relaxed">
                                <p className="font-bold mb-1">
                                    {language === 'EN' ? "Vacation Notice" : "Urlaubsbenachrichtigung"}
                                </p>
                                <p>{vacationSettings.message}</p>
                                {vacationSettings.endDate && (
                                    <p className="mt-1 font-bold">
                                        {language === 'EN' 
                                        ? `Orders will be processed starting from: ${new Date(vacationSettings.endDate).toLocaleDateString()}` 
                                        : `Bestellungen werden ab dem ${new Date(vacationSettings.endDate).toLocaleDateString()} bearbeitet.`}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-white/30 border border-black/5 rounded-xl">
                            <input 
                                required 
                                type="checkbox" 
                                id="vacationAgreement" 
                                checked={agreedToVacation} 
                                onChange={(e) => setAgreedToVacation(e.target.checked)} 
                                className="mt-1 w-4 h-4 accent-blue-600 cursor-pointer" 
                            />
                            <label htmlFor="vacationAgreement" className="text-[11px] text-[#1F1F1F]/70 leading-relaxed cursor-pointer">
                                {language === 'EN' 
                                ? "I understand that my order will be delayed due to the vacation period." 
                                : "Ich verstehe, dass sich meine Bestellung aufgrund der Urlaubszeit verzögert."} *
                            </label>
                        </div>
                    </div>
                )}

              </div>
              <button type="submit" disabled={!canProceed} className="w-full bg-[#1F1F1F] hover:bg-[#C9A24D] py-5 rounded-xl transition-all text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">{t('checkout_continue')} <ArrowLeft className="rotate-180" size={18} /></button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              {/* ... Step 2 content remains same ... */}
              <div className="bg-white/40 border border-black/5 p-6 rounded-2xl flex justify-between items-center shadow-sm">
                <div><p className="text-[#1F1F1F]/50 text-sm font-medium">Shipping {isExpress ? "(Express)" : "(Standard)"} to:</p><p className="font-bold">{formData.address}, {formData.city}, {formData.country}</p></div>
                <button onClick={() => setStep(1)} className="text-[#C9A24D] text-sm font-bold hover:underline">{t('checkout_change')}</button>
              </div>
              
              {/* ... Benevolence Section (Preserved) ... */}
              {isDonationActive && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                      <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                             <div className="p-1.5 bg-[#C9A24D]/10 rounded-lg text-[#C9A24D]"><Coffee size={18}/></div>
                             <h3 className="font-bold text-sm">{language === 'EN' ? "Support the Team (Optional)" : "Team unterstützen (Optional)"}</h3>
                          </div>
                          <div className="flex gap-2">
                             {['3%', '5%', '5eur', 'custom'].map(opt => (
                                 <button
                                     key={opt}
                                     onClick={() => handleTipClick(opt)}
                                     className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                         tipOption === opt 
                                         ? "bg-[#1F1F1F] text-white border-[#1F1F1F]" 
                                         : "bg-white border-black/10 hover:border-[#1F1F1F] text-[#1F1F1F]/60"
                                     }`}
                                 >
                                     {opt === '3%' ? '3%' : opt === '5%' ? '5%' : opt === '5eur' ? '€5' : 'Custom'}
                                 </button>
                             ))}
                          </div>
                          {tipOption === 'custom' && (
                             <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                 <input 
                                     type="number" 
                                     min="0"
                                     placeholder="€" 
                                     className="w-full border border-black/10 rounded-lg p-2 text-sm outline-none focus:border-[#C9A24D]"
                                     onChange={(e) => setTipAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                 />
                             </div>
                          )}
                      </div>

                      <div className={`transition-all duration-300 border rounded-2xl p-6 shadow-sm ${showDonation ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-black/5'}`}>
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDonation(!showDonation)}>
                             <div className="flex items-center gap-2">
                                 <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Droplets size={18}/></div>
                                 <div>
                                     <h3 className="font-bold text-sm text-[#1F1F1F]">{language === 'EN' ? "Water Well Project" : "Brunnenbau-Projekt"}</h3>
                                     <p className="text-[10px] text-[#1F1F1F]/50 font-medium">Build a well, change lives.</p>
                                 </div>
                             </div>
                             <div className={`w-5 h-5 rounded-full border border-black/10 flex items-center justify-center transition-all ${showDonation ? 'bg-blue-600 border-blue-600' : 'bg-white'}`}>
                                 {showDonation && <Check size={12} className="text-white" />}
                             </div>
                          </div>

                          {showDonation && (
                             <div className="mt-4 pt-4 border-t border-black/5 space-y-4 animate-in fade-in">
                                 <p className="text-xs text-[#1F1F1F]/70 leading-relaxed italic">
                                     {language === 'EN' 
                                     ? "Your donation goes directly to building water wells. We print donor names on a banner at the site." 
                                     : "Ihre Spende fließt direkt in den Bau von Wasserbrunnen. Wir drucken die Namen der Spender auf ein Banner vor Ort."}
                                 </p>
                                 
                                 <div className="flex gap-2">
                                     {[10, 20, 50, 'custom'].map(val => (
                                         <button
                                             key={val}
                                             onClick={() => handleDonationClick(val as number | 'custom')}
                                             className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                 donationOption === val 
                                                 ? "bg-blue-600 text-white border-blue-600" 
                                                 : "bg-white border-black/10 hover:border-blue-600 text-[#1F1F1F]/60"
                                             }`}
                                         >
                                             {val === 'custom' ? 'Custom' : `€${val}`}
                                         </button>
                                     ))}
                                 </div>

                                 {donationOption === 'custom' && (
                                     <input 
                                         type="number" 
                                         min="0"
                                         placeholder="€ Amount" 
                                         className="w-full border border-black/10 rounded-lg p-2 text-sm outline-none focus:border-blue-600"
                                         onChange={(e) => setDonationAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                     />
                                 )}

                                 <div className="bg-white p-3 rounded-xl border border-black/5 space-y-2">
                                     <label className="text-[10px] font-bold uppercase tracking-wide text-[#1F1F1F]/40 block">
                                         {language === 'EN' ? "Name for Banner (Optional)" : "Name für Banner (Optional)"}
                                     </label>
                                     <input 
                                         type="text" 
                                         placeholder={language === 'EN' ? "e.g. The Smith Family" : "z.B. Familie Müller"}
                                         value={donorName}
                                         onChange={(e) => setDonorName(e.target.value)}
                                         className="w-full bg-[#F6EFE6]/50 border border-black/10 rounded-lg p-2 text-sm outline-none focus:border-[#C9A24D]"
                                     />
                                     
                                     {donorName.trim().length > 0 && (
                                         <div className="flex items-start gap-2 pt-1">
                                             <input 
                                                 type="checkbox" 
                                                 id="publicConsent" 
                                                 checked={isPublicDonor} 
                                                 onChange={(e) => setIsPublicDonor(e.target.checked)} 
                                                 className="mt-0.5 accent-blue-600 cursor-pointer" 
                                             />
                                             <label htmlFor="publicConsent" className="text-[10px] text-[#1F1F1F]/60 leading-tight cursor-pointer">
                                                 {language === 'EN' 
                                                 ? "I agree that my name may be displayed publicly for donor recognition." 
                                                 : "Ich stimme zu, dass mein Name zur Spenderanerkennung öffentlich angezeigt werden darf."}
                                             </label>
                                         </div>
                                     )}
                                 </div>
                             </div>
                          )}
                      </div>
                  </div>
              )}

              <h2 className="text-2xl font-bold pt-4">{t('checkout_method')}</h2>
              {clientSecret ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1F1F1F' } } }}>
                    <PaymentForm 
                        amount={finalTotal} 
                        formData={formData} 
                        cart={cart} 
                        isExpress={isExpress} 
                        packagingType={packagingType} 
                        giftNote={giftNote}
                        tipAmount={tipAmount}
                        donationAmount={donationAmount}
                        donorName={donorName}
                        isPublicDonor={isPublicDonor}
                        discountCode={appliedCode}
                        discountAmount={discountAmount}
                    />
                  </Elements>
                </div>
              ) : <div className="p-8 text-center text-[#1F1F1F]/40 font-medium">{t('checkout_loading_payment')}</div>}
            </div>
          )}
        </div>

        <div className="bg-white/40 border border-black/5 rounded-3xl p-8 h-fit shadow-sm backdrop-blur-md">
          {/* ... Cart Summary code ... */}
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
              {/* ✨ UPDATED: Show Express label for USA automatically */}
              <span>Shipping ({formData.country} - {isExpress || formData.country === "United States" ? "Express" : "Standard"})</span>
              {/* ✨ UPDATED: Show multiplier if > 1 box */}
              <span>
                  {boxCount > 1 ? `(${boxCount}x) ` : ""}
                  €{shippingCost.toFixed(2)}
              </span>
            </div>
            {packagingType === 'gift' && (
              <div className="flex justify-between text-[#C9A24D] font-bold text-sm">
                <span>Gift Packaging</span>
                <span>+€10.00</span>
              </div>
            )}
            
            {isDonationActive && tipAmount > 0 && (
                <div className="flex justify-between text-[#1F1F1F] font-bold text-sm">
                    <span>Tip (Team Support)</span>
                    <span>+€{tipAmount.toFixed(2)}</span>
                </div>
            )}
            {isDonationActive && donationAmount > 0 && (
                <div className="flex justify-between text-blue-600 font-bold text-sm">
                    <span>Water Well Donation</span>
                    <span>+€{donationAmount.toFixed(2)}</span>
                </div>
            )}

            {/* Promo Code Display */}
            {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-bold text-sm animate-in slide-in-from-right-2">
                    <span className="flex items-center gap-1"><Tag size={12}/> Discount ({appliedCode})</span>
                    <span>-€{discountAmount.toFixed(2)}</span>
                </div>
            )}

            <div className="flex justify-between text-xl font-bold text-[#1F1F1F] pt-4 border-t border-black/10"><span>{t('checkout_total')}</span><span className="text-[#C9A24D]">€{finalTotal.toFixed(2)}</span></div>
          </div>

          {/* Promo Code Input Field */}
          <div className="mt-6 pt-4 border-t border-black/5">
              {!appliedCode ? (
                  <div className="space-y-2">
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              placeholder={language === 'EN' ? "Enter Promo Code" : "Gutscheincode eingeben"} 
                              className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide focus:border-[#C9A24D] outline-none"
                              value={promoCodeInput}
                              onChange={(e) => setPromoCodeInput(e.target.value)}
                          />
                          <button 
                              onClick={handleApplyCode}
                              disabled={!promoCodeInput.trim() || isCheckingCode}
                              className="bg-[#1F1F1F] text-white px-4 rounded-xl font-bold text-sm hover:bg-[#C9A24D] disabled:opacity-50 transition-colors"
                          >
                              {isCheckingCode ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                          </button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs font-bold animate-pulse">{promoError}</p>}
                  </div>
              ) : (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex justify-between items-center animate-in fade-in">
                      <div className="flex items-center gap-2 text-green-700">
                          <Tag size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">{appliedCode} Applied</span>
                      </div>
                      <button onClick={removeCode} className="text-red-400 hover:text-red-600 font-bold text-xs">Remove</button>
                  </div>
              )}
          </div>

        </div>
      </main>
    </div>
  );
}