"use client";

import { useState, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, Lock, Mail, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion"; // Added Framer Motion for premium entrance animations

// Initialize local browser client configuration safely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function SignupContent() {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Route extraction handling for post-checkout conversion strings
  const orderRef = searchParams.get("orderRef");

  // Form State Definitions
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    // Baseline security validation: Prevent weak credentials from entering the wire
    if (password.length < 6) {
      setErrorMessage(
        language === "EN"
          ? "Password must be at least 6 characters long."
          : "Das Passwort muss mindestens 6 Zeichen lang sein."
      );
      setLoading(false);
      return;
    }

    try {
      // Direct, encrypted communication with the auth database instance
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || "Valued Customer",
          },
          // Direct back to our authentication callback handling route
          emailRedirectTo: `${window.location.origin}/auth/callback?orderRef=${orderRef || ""}`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        setSuccessMessage(
          language === "EN"
            ? "Account created! Please check your email inbox to confirm your registration."
            : "Konto erstellt! Bitte überprüfe dein E-Mail-Postfach, um die Registrierung zu bestätigen."
        );
        
        // Clean out form states to avoid credential caching artifacts
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unhandled authentication event occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex flex-col items-center justify-center p-6 relative select-none overflow-hidden">
      {/* Premium layout wrapper container running an elite slide and fade-in execution */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-xl relative z-10">
        
        {/* Luxury Floral Styling Branding Headers */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {language === "EN" ? "Join Rosetas Bouquets" : "Mitglied Werden"}
          </h1>
          <p className="text-sm text-[#1F1F1F]/50">
            {orderRef 
              ? (language === "EN" ? "Create your account to claim and track your order live" : "Konto erstellen, um Bestellung live zu verfolgen")
              : (language === "EN" ? "Unlock live tracking, faster checkouts, and special access" : "Live-Tracking und schnelleren Checkout freischalten")}
          </p>
        </div>

        {/* Input Feedback Triggers */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl text-xs font-semibold border border-green-100">
            {successMessage}
          </div>
        )}

        {/* Secure Form Core Layout */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/30" size={18} />
            <input
              type="text"
              required
              placeholder={language === "EN" ? "Full Name" : "Vollständiger Name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F6EFE6]/40 border border-black/5 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/30" size={18} />
            <input
              type="email"
              required
              placeholder={language === "EN" ? "Email Address" : "E-Mail-Adresse"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F6EFE6]/40 border border-black/5 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/30" size={18} />
            <input
              type="password"
              required
              placeholder={language === "EN" ? "Password" : "Passwort"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F6EFE6]/40 border border-black/5 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors"
            />
          </div>

          {/* Luxury core action trigger button: Updates background canvas properties matching the primary shop look */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A24D] hover:bg-[#1F1F1F] text-white py-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin text-white" size={18} />
            ) : (
              <>
                <span className="text-white">{language === "EN" ? "Create Luxury Profile" : "Profil Erstellen"}</span>
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </form>

        {/* Separator UI Line */}
        <div className="relative my-6 text-center">
          <hr className="border-black/5" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-[#1F1F1F]/30">
            {language === "EN" ? "Or secure login" : "Oder sicheres Login"}
          </span>
        </div>

        {/* OAuth Federation Provider Nodes */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={signInWithGoogle}
            type="button"
            className="flex items-center justify-center gap-2 border border-black/5 bg-[#F6EFE6]/40 hover:bg-[#C9A24D] hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" className="transition-colors duration-300">
              <path fill="#4285F4" className="group-hover:fill-white transition-colors duration-300" d="M23.7 12.3c0-.8-.1-1.7-.2-2.5H12v4.8h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9.1z"/>
              <path fill="#34A853" className="group-hover:fill-white transition-colors duration-300" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5H1.3v3.2C3.3 21.4 7.4 24 12 24z"/>
              <path fill="#FBBC05" className="group-hover:fill-white transition-colors duration-300" d="M5.2 14.2c-.3-.7-.4-1.5-.4-2.2s.1-1.5.4-2.2V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3.2z"/>
              <path fill="#EA4335" className="group-hover:fill-white transition-colors duration-300" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.1 15.2 0 12 0 7.4 0 3.3 2.6 1.3 6.6l3.9 3.2c1-2.9 3.7-5 6.8-5z"/>
            </svg>
            <span className="transition-colors duration-300">Google</span>
          </button>

          <button
            onClick={signInWithApple}
            type="button"
            className="flex items-center justify-center gap-2 border border-black/5 bg-[#F6EFE6]/40 hover:bg-[#C9A24D] hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="transition-colors duration-300">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z"/>
            </svg>
            <span className="transition-colors duration-300">Apple</span>
          </button>
        </div>

        {/* Navigational Anchor Route */}
        <div className="mt-6 text-center text-xs font-semibold">
          <span className="text-[#1F1F1F]/40">
            {language === "EN" ? "Already have an account?" : "Hast du bereits ein Konto?"}{" "}
          </span>
          <Link href="/login" className="text-[#CDAF95] hover:text-[#C9A24D] underline transition-colors duration-300">
            {language === "EN" ? "Log In" : "Einloggen"}
          </Link>
        </div>

      </motion.div>
    </div>
  );
}

// Global compilation boundary to capture async router behaviors safely
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}