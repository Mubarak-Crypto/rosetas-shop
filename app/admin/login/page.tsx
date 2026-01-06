"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    } else {
      // Success! Redirect to dashboard
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-4">
            <Lock className="text-neon-rose" size={20} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">Admin Access</h1>
          <p className="text-gray-400 text-sm">Restricted area for authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6 shadow-2xl">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-rose outline-none transition-colors"
              placeholder="admin@rosetas.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-rose outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-neon-rose text-white font-bold py-4 rounded-xl shadow-glow-rose hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Login to Dashboard"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-gray-500 text-sm hover:text-white flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={14} /> Back to Website
          </Link>
        </div>

      </div>
    </div>
  );
}