"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // 1. Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();

      // 2. If no session, and we are NOT on the login page, kick them out
      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else {
        // User is okay, let them stay
        setIsLoading(false);
      }
    };

    checkSession();
  }, [pathname, router]);

  // While checking, show a loading spinner so they don't see the protected content for a split second
  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-neon-rose">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  // If we are on the login page, don't show the sidebar
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}