"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generates a random, temporary ID for this specific browser tab session
// ✨ FIX: Upgraded to crypto.randomUUID() and sessionStorage to persist across hard refreshes
const getSessionId = () => {
  const existing = sessionStorage.getItem("live-visitor-id");
  if (existing) return existing;
  
  const id = crypto.randomUUID();
  sessionStorage.setItem("live-visitor-id", id);
  return id;
};

export default function LiveTracker() {
  const pathname = usePathname();
  const sessionId = useRef("");

  useEffect(() => {
    // ✨ NEW: Stop the tracker from pinging if the user is on an admin dashboard
    // This prevents you and Madina from polluting the live traffic stats!
    if (pathname.startsWith('/admin')) return;

    // Initialize session ID only once per tab
    // ✨ FIX: Now pulls from sessionStorage so refreshes don't spawn duplicate ghost visitors
    if (!sessionId.current) {
      sessionId.current = getSessionId();
    }

    // Basic device detection
    const device = window.innerWidth <= 768 ? "Mobile" : "Desktop";
    
    const sendHeartbeat = () => {
      fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          device,
          currentPath: window.location.pathname,
        }),
      }).catch(() => {
        // Fail silently; we don't want to break the UI or spam the console if a heartbeat drops
      });
    };

    // 1. Send a pulse immediately upon route change
    sendHeartbeat();

    // 2. Continue sending a silent pulse every 30 seconds to prove the tab is alive
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null; // This component is completely invisible
}