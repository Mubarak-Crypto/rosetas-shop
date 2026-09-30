import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lightweight, instance-level rate limiter for serverless environments
const rateLimit = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous_ip';
    const now = Date.now();
    const lastSeen = rateLimit.get(ip);
    
    // Strict 5-second cooldown per IP
    if (lastSeen && now - lastSeen < 5000) { 
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    rateLimit.set(ip, now);
    if (rateLimit.size > 1000) rateLimit.clear();

    const body = await request.json();
    const { sessionId, device, currentPath } = body;
    
    // ✨ FIX: Stricter validation for currentPath as requested by the architecture review
    // Added checks to ensure it starts with '/' and rejects malicious control characters
    if (
      typeof sessionId !== 'string' || sessionId.length > 50 ||
      (device !== 'Mobile' && device !== 'Desktop' && device !== 'Tablet') ||
      typeof currentPath !== 'string' || 
      currentPath.length > 200 ||
      !currentPath.startsWith('/') ||
      /[\u0000-\u001F\u007F]/.test(currentPath)
    ) {
      return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
    }

    const safePayload = {
      sessionId,
      device,
      currentPath,
      timestamp: Date.now(), 
    };

    // ✨ FIX: Initialize a fresh client INSIDE the function for serverless stability
    // Added persistSession: false to prevent it from getting stuck looking for cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const channel = supabase.channel('store-traffic', {
      config: { private: true }
    });
    
    await new Promise((resolve, reject) => {
      let isHandled = false;
      
      channel.subscribe(async (status) => {
        if (isHandled) return;
        
        if (status === 'SUBSCRIBED') {
          isHandled = true;
          await channel.send({
            type: 'broadcast',
            event: 'heartbeat',
            payload: safePayload,
          });
          resolve(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          isHandled = true;
          reject(new Error('Relay failed to connect to Realtime'));
        }
      });
      
      setTimeout(() => {
        if (!isHandled) {
          isHandled = true;
          reject(new Error('Subscription timeout'));
        }
      }, 5000);
    });

    await supabase.removeChannel(channel);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Traffic relay error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}