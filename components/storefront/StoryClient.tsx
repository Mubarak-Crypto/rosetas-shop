'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Story = {
  id: string;
  media_url: string;
  media_type: string;
  link_url: string | null;
};

export default function StoryClient({ storyId }: { storyId: string }) {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchStory = async () => {
      const { data, error } = await supabase
        .from('shop_stories')
        .select('*')
        .eq('id', storyId)
        .single(); // .single() ensures we just get the exact object, not an array

      if (!error && data) {
        setStory(data);
      }
      setIsLoading(false);
    };

    fetchStory();
  }, [storyId, supabase]);

  // ✨ NEW: Auto-advance (close) timer for image stories so it acts like Instagram
  // Since this is a standalone viewer for a single story, it will route back home after 5 seconds
  useEffect(() => {
    if (story && story.media_type !== 'video') {
      const timer = setTimeout(() => {
        router.push('/'); // Auto-return to home
      }, 5000); // 5000ms = 5 seconds
      
      // Clean up the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [story, router]);

  // Loading State with Luxury Beige Accent
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#D4C29A]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  // 404 / Expired State
  if (!story) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex flex-col items-center justify-center space-y-6">
        <p className="font-black tracking-widest uppercase text-xl text-gray-900">Story Unavailable</p>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // The Standalone Story View
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Return to Homepage Button */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 right-6 z-50 text-white p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
        title="Return to Shop"
      >
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Close</span>
        <X size={32} />
      </button>

      {/* Media Container (Responsive: full height on mobile, rounded container on desktop) */}
      <div className="relative w-full max-w-md h-[100dvh] sm:h-[85vh] sm:rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
        {/* ✨ NEW: Animation wrapper to slide the story in smoothly when it loads */}
        <div 
          key={story.id}
          className="absolute inset-0 w-full h-full animate-in fade-in slide-in-from-right-8 duration-300 ease-out"
        >
          {story.media_type === 'video' ? (
            <video 
              src={story.media_url} 
              className="w-full h-full object-contain" 
              autoPlay 
              playsInline 
              controls={false}
              muted // ✨ NEW: Added muted to ensure autoPlay policies don't block the video
              // ✨ NEW: Replaced loop with onEnded so it auto-closes back to the shop when the video finishes
              onEnded={() => router.push('/')} 
            />
          ) : (
            <img 
              src={story.media_url} 
              alt="Live Story" 
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Shoppable Link Overlay */}
        {story.link_url && (
          <div className="absolute bottom-12 left-0 w-full flex justify-center z-50 pointer-events-none">
            <a 
              href={story.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex items-center gap-2 bg-white/95 text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-lg hover:bg-gray-100 transition-transform hover:scale-105"
            >
              <ExternalLink size={18} />
              Shop This Look
            </a>
          </div>
        )}
      </div>
    </div>
  );
}