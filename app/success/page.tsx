"use client";

import { useEffect } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart as soon as the page loads because the payment worked
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
      
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
      >
        <CheckCircle size={48} className="text-white" />
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-gray-400 max-w-md mb-12 text-lg">
        Thank you for your order. We have received your payment and are preparing your luxury bouquet.
      </p>

      <div className="space-y-4 w-full max-w-sm">
        <Link href="/">
          <button className="w-full bg-neon-rose text-white font-bold py-4 rounded-xl shadow-glow-rose hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
            Continue Shopping <ArrowRight size={18} />
          </button>
        </Link>
        
        <p className="text-gray-500 text-sm mt-4">
          A confirmation email has been sent to your inbox.
        </p>
      </div>

    </div>
  );
}