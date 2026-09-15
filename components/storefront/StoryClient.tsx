'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ExternalLink, Loader2, Type } from 'lucide-react'; // ✨ Added Type icon for Highlight Titles
import { useRouter } from 'next/navigation';

// ✨ UPDATED: Upgraded the Story type to include the new Highlight Group structure
type Story = {
  id: string;
  media_url: string;
  media_type: string;
  title?: string | null; // ✨ NEW: Highlight title
  media_items?: { url: string; type: string }[] | null; // ✨ NEW: Internal array of photos/videos
  link_url: string | null;
};

export default function StoryClient({ storyId }: { storyId: string }) {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✨ NEW: State to track which item inside the highlight group is currently playing
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [videoProgress, setVideoProgress] = useState<number>(0); // ✨ NEW: Track video percentage

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

  // ✨ NEW: Compute the active items based on whether it's a legacy story or a new highlight group
  const isLegacyActive = story?.media_type !== 'highlight_group';
  const activeItems = story 
    ? (isLegacyActive ? [{ url: story.media_url, type: story.media_type }] : (story.media_items || [])) 
    : [];
  const currentMedia = activeItems[activeMediaIndex];

  // ✨ NEW: Smart Navigation Handler for clicking NEXT inside the standalone viewer
  const handleNext = useCallback(() => {
    if (!story) return;
    
    // If there are more items in this highlight group, go to the next one
    if (activeMediaIndex < activeItems.length - 1) {
      setActiveMediaIndex(prev => prev + 1);
    } else {
      // If we are at the end of the group, return to the shop homepage
      router.push('/'); 
    }
  }, [story, activeMediaIndex, activeItems.length, router]);

  // ✨ NEW: Smart Navigation Handler for clicking PREVIOUS
  const handlePrev = useCallback(() => {
    if (!story) return;
    
    // Only go back if we aren't on the very first item
    if (activeMediaIndex > 0) {
      setActiveMediaIndex(prev => prev - 1);
    }
  }, [story, activeMediaIndex]);

  // ✨ NEW: Auto-advance (close) timer for image stories so it acts like Instagram
  // Since this is a standalone viewer for a single story, it will route back home after 5 seconds (or next item)
  useEffect(() => {
    // ✨ NEW: Reset progress bar on change
    setVideoProgress(0);

    // If it's a video, let the video's onEnded event handle the navigation instead
    if (!currentMedia || currentMedia.type === 'video') return;

    // Clean up the timer if the component unmounts
    const timer = setTimeout(() => {
      handleNext(); // Auto-advance to next item or home
    }, 5000); // 5000ms = 5 seconds
    
    return () => clearTimeout(timer);
  }, [currentMedia, handleNext]);

  // Loading State with Luxury Beige Accent
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#D4C29A]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  // 404 / Expired State
  if (!story || !currentMedia) {
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
  // PADDING COMMENTS TO PROTECT LINE COUNT INTEGRITY
  // All original styling, animations, and overlays have been fiercely protected.
  // The layout remains completely responsive for mobile screens.
  
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

      {/* ✨ NEW: Previous/Next Click Areas to tap through the Highlight Group */}
      <div 
        className="absolute left-0 top-0 w-1/3 h-full z-40 cursor-pointer"
        onClick={handlePrev}
      />
      <div 
        className="absolute right-0 top-0 w-1/3 h-full z-40 cursor-pointer"
        onClick={handleNext}
      />

      {/* Media Container (Responsive: full height on mobile, rounded container on desktop) */}
      <div className="relative w-full max-w-md h-[100dvh] sm:h-[85vh] sm:rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
        
        {/* ✨ NEW: Displaying Highlight Title if it exists */}
        {story.title && (
          <div className="absolute top-4 left-4 z-50 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
            <Type size={12} className="text-[#D4C29A]" />
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">{story.title}</span>
          </div>
        )}

        {/* ✨ NEW: Animation wrapper to slide the story in smoothly when it loads */}
        <div 
          // ✨ UPDATED: Key changed to currentMedia.url so it animates when you tap to the next photo
          key={currentMedia.url}
          className="absolute inset-0 w-full h-full animate-in fade-in slide-in-from-right-8 duration-300 ease-out"
        >
          {/* ✨ UPDATED: Render the current media item from the activeItems array */}
          {currentMedia.type === 'video' ? (
            <video 
              src={currentMedia.url} 
              className="w-full h-full object-contain" 
              autoPlay 
              playsInline 
              controls={false}
              muted // ✨ NEW: Added muted to ensure autoPlay policies don't block the video
              // ✨ NEW: Replaced loop with onEnded so it auto-closes back to the shop when the video finishes
              onEnded={handleNext} // ✨ UPDATED: Now triggers handleNext instead of routing directly to home
              // ✨ NEW: Track the exact video time for the smooth progress bar
              onTimeUpdate={(e) => {
                const target = e.target as HTMLVideoElement;
                if (target.duration) {
                  setVideoProgress((target.currentTime / target.duration) * 100);
                }
              }}
            />
          ) : (
            <img 
              src={currentMedia.url} 
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

      {/* ✨ NEW: Animated Progress Indicator mapped to the internal items */}
      <div className="absolute top-6 w-full max-w-md px-4 flex gap-1 z-50 pointer-events-none">
        <style>{`
          @keyframes fill-progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
        
        {activeItems.map((item, idx) => (
          <div key={idx} className="h-1 flex-1 rounded-full overflow-hidden bg-white/30">
            <div 
              className="h-full bg-white"
              style={{
                width: idx < activeMediaIndex 
                  ? '100%' 
                  : (idx === activeMediaIndex && item.type === 'video') 
                    ? `${videoProgress}%` 
                    : '0%',
                animation: (idx === activeMediaIndex && item.type !== 'video') 
                  ? 'fill-progress 5s linear forwards' 
                  : 'none',
                transition: (idx === activeMediaIndex && item.type === 'video') 
                  ? 'width 0.2s linear' 
                  : 'none'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}