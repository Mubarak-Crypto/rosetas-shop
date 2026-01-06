"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "../../lib/supabase"; 

// Load your Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- COMPONENT: THE PAYMENT FORM ---
function PaymentForm({ amount, formData, cart }: { amount: number, formData: any, cart: any[] }) {
  const stripe = useStripe();
  const elements = useElements();
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
        return_url: "http://localhost:3000/success", // Redirects here on success
      },
      redirect: "if_required", // Try to avoid redirect if not needed
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
          items: cart, // Save the whole cart array
          total: amount,
          status: 'paid',
          payment_id: paymentIntent.id
        }
      ]);

      if (dbError) {
        console.error("Error saving order:", dbError);
      }

      // 3. SEND EMAIL NOTIFICATION (The new part)
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
      
      {message && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded">{message}</div>}
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full bg-neon-rose text-white font-bold py-4 rounded-xl shadow-glow-rose hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? "Processing..." : `Pay €${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", address: "", city: "", zip: "", phone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); 
  };

  // Fetch Payment Intent
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
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/" className="text-neon-rose hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-rose selection:text-white pb-20">
      
      <header className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Back to Shop
        </Link>
        <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
          <Lock size={14} /> Secure Checkout
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 text-sm font-bold ${step >= 1 ? "text-white" : "text-gray-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? "bg-neon-rose border-neon-rose" : "border-white/20"}`}>1</div> Shipping
            </div>
            <div className="w-12 h-px bg-white/10"></div>
            <div className={`flex items-center gap-2 text-sm font-bold ${step >= 2 ? "text-white" : "text-gray-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? "bg-neon-rose border-neon-rose" : "border-white/20"}`}>2</div> Payment
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Contact Information</h2>
                <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-neon-purple outline-none transition-colors" />
              </div>
              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-bold">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="firstName" placeholder="First Name" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-neon-purple outline-none" />
                  <input required type="text" name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-neon-purple outline-none" />
                </div>
                <input required type="text" name="address" placeholder="Address" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-neon-purple outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="city" placeholder="City" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-neon-purple outline-none" />
                  <input required type="text" name="zip" placeholder="Postal Code" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-neon-purple outline-none" />
                </div>
                <input required type="tel" name="phone" placeholder="Phone" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-neon-purple outline-none" />
              </div>
              <button type="submit" className="w-full bg-neon-purple hover:bg-purple-600 text-white font-bold py-5 rounded-xl mt-8 transition-all flex items-center justify-center gap-2">
                Continue to Payment <ArrowLeft className="rotate-180" size={18} />
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center">
                <div><p className="text-gray-400 text-sm">Ship to:</p><p className="font-bold">{formData.address}, {formData.city}</p></div>
                <button onClick={() => setStep(1)} className="text-neon-rose text-sm font-bold hover:underline">Change</button>
              </div>

              <h2 className="text-2xl font-bold pt-4">Payment Method</h2>
              
              {clientSecret ? (
                <div className="bg-white p-6 rounded-2xl text-black">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    {/* WE PASS DATA DOWN TO THE FORM NOW */}
                    <PaymentForm amount={cartTotal} formData={formData} cart={cart} />
                  </Elements>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">Loading secure payment...</div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Order Summary) */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-fit">
          <h3 className="font-bold text-xl mb-6">Order Summary</h3>
          <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.uniqueId} className="flex gap-4">
                <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-white/10 relative">
                   <img src={item.image} className="w-full h-full object-cover" />
                   <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-[#050505]">{item.quantity}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-400">{Object.values(item.options).join(", ")}</p>
                  {item.extras?.map(e => <span key={e} className="text-[10px] text-neon-purple block">+ {e}</span>)}
                </div>
                <div className="font-mono text-sm">€{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-white/10 pt-6">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>€{cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10"><span>Total</span><span className="text-neon-rose">€{cartTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}