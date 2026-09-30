"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client"; // Adjust path if necessary
import { Monitor, Smartphone, Activity, ShieldAlert } from "lucide-react";

type Visitor = {
  sessionId: string;
  device: "Mobile" | "Desktop" | "Tablet";
  currentPath: string;
  timestamp: number;
  status: "Online" | "Stale";
};

export default function LiveMonitor() {
  const [visitors, setVisitors] = useState<Map<string, Visitor>>(new Map());
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const supabase = createClient();

  // 1. Frontend Security Check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      // UI Routing check matching your exact admin emails
      if (email === 'rosetasbouquetde@gmail.com' || email === 'madina.albukaeva@icloud.com') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    });
  }, []);

  // 2. Realtime WebSocket Subscription
  useEffect(() => {
    if (!isAuthorized) return; // Don't even try to connect if not an admin

    // Connect to the private channel
    const channel = supabase.channel('store-traffic', {
      config: { private: true },
    });

    // Listen for the backend relay broadcasts
    channel.on('broadcast', { event: 'heartbeat' }, (payload) => {
      const data = payload.payload;
      setVisitors((prev) => {
        const newMap = new Map(prev);
        // Add or update the visitor in React memory
        newMap.set(data.sessionId, { ...data, status: "Online" });
        return newMap;
      });
    });

    // ✨ FIX: Added Realtime error handling to monitor subscription health
    // This ensures Askhab and Madina can see if the connection drops or is blocked
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        console.error("Live traffic channel error: Check RLS policies or channel configuration");
      }
      
      if (status === "TIMED_OUT") {
        console.error("Live traffic channel timed out: Server did not respond");
      }
    });

    // 3. Stale Cleanup Interval (Evaluates every 10 seconds)
    const cleanup = setInterval(() => {
      setVisitors((prev) => {
        const newMap = new Map(prev);
        const now = Date.now();
        let changed = false;

        for (const [id, visitor] of newMap.entries()) {
          const secondsSincePulse = (now - visitor.timestamp) / 1000;
          
          if (secondsSincePulse > 120) {
            // Remove entirely if gone for > 120 seconds
            newMap.delete(id); 
            changed = true;
          } else if (secondsSincePulse > 90 && visitor.status !== "Stale") {
            // Mark as Stale if quiet for > 90 seconds
            newMap.set(id, { ...visitor, status: "Stale" });
            changed = true;
          }
        }
        return changed ? newMap : prev;
      });
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanup);
    };
  }, [isAuthorized]);

  // UI Helpers
  const formatPageName = (path: string) => {
    if (!path || path === "/") return "Homepage";
    if (path.startsWith("/shop/makeup")) return "Makeup Collection";
    if (path.startsWith("/shop")) return "Shop All";
    if (path.startsWith("/checkout")) return "Checkout";
    if (path.startsWith("/cart")) return "Shopping Cart";
    return path;
  };

  // Loading & Unauthorized States
  if (isAuthorized === null) {
    return <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center font-bold text-gray-400">Loading secure environment...</div>;
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] flex flex-col items-center justify-center text-[#1F1F1F]">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-500">Your account does not have permission to view live store traffic.</p>
      </div>
    );
  }

  const activeVisitors = Array.from(visitors.values());
  const onlineCount = activeVisitors.filter(v => v.status === "Online").length;

  return (
    <div className="min-h-screen bg-[#F6EFE6] p-8 md:p-12 font-sans text-[#1F1F1F]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="space-y-2">
          <h1 className="text-sm font-black tracking-[0.2em] uppercase text-gray-400 flex items-center gap-2">
            <Activity size={16} /> Live Store Activity
          </h1>
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-black/5 shadow-sm w-fit">
            <span className="relative flex h-3 w-3">
              {onlineCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${onlineCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </span>
            <span className="text-xl font-bold">
              {onlineCount} {onlineCount === 1 ? 'visitor' : 'visitors'} currently online
            </span>
          </div>
        </div>

        {/* VISITORS LIST */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden min-h-[300px]">
          {activeVisitors.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium h-full flex items-center justify-center">
              Waiting for traffic...
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {activeVisitors.sort((a, b) => b.timestamp - a.timestamp).map((visitor) => (
                <div key={visitor.sessionId} className="px-6 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`p-3 rounded-xl ${visitor.status === 'Online' ? 'bg-[#F6EFE6] text-[#C9A24D]' : 'bg-gray-100 text-gray-400'}`}>
                    {visitor.device === "Mobile" ? <Smartphone size={20} /> : <Monitor size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold flex items-center gap-2 ${visitor.status === 'Stale' && 'text-gray-400'}`}>
                      {visitor.device} <span className="text-gray-300">—</span> {formatPageName(visitor.currentPath)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${visitor.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      {visitor.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}