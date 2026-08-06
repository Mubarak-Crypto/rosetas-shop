'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ExternalLink, Share2 } from 'lucide-react';

type Story = {
  id: string;
  media_url: string;
  media_type: string;
  link_url: string | null;
};

export default function StorefrontStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0); // ✨ NEW: State to track video playback percentage
  const supabase = createClient();

  useEffect(() => {
    const fetchStories = async () => {
      const { data, error } = await supabase
        .from('shop_stories')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString()) // Only fetch non-expired stories
        .order('created_at', { ascending: false });

      // ✨ NEW: Added comprehensive console logs to debug and inspect database response payload instantly
      if (error) {
        console.error('Error fetching storefront stories from Supabase:', error);
      } else {
        console.log('Successfully fetched storefront stories data:', data);
        if (data) {
          setStories(data);
        }
      }
    };

    fetchStories();
  }, []);

  // Prevent scrolling on the main page when the story viewer is open
  useEffect(() => {
    if (activeStoryIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [activeStoryIndex]);

  // ✨ NEW: Auto-advance timer for image stories so it acts like Instagram
  useEffect(() => {
    // ✨ NEW: Reset video progress whenever the active story changes
    setVideoProgress(0);

    // If no story is open, we do nothing
    if (activeStoryIndex === null) return;
    
    const currentStory = stories[activeStoryIndex];
    
    // If the current story is an image (not a video), we set a 5-second timer
    if (currentStory && currentStory.media_type !== 'video') {
      const timer = setTimeout(() => {
        setActiveStoryIndex((prev) => {
          // Safety check
          if (prev === null) return null;
          // Go to the next story if there is one
          if (prev < stories.length - 1) return prev + 1;
          // Otherwise, close the viewer when the last story is done
          return null; 
        });
      }, 5000); // 5000ms = 5 seconds
      
      // Clean up the timer if the user manually clicks next/prev before it finishes
      return () => clearTimeout(timer);
    }
  }, [activeStoryIndex, stories]);

  if (stories.length === 0) return null; // Don't render anything if there are no live stories

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="w-full py-6 bg-[#F5F0E6] border-b border-gray-200">
      {/* Insta-style Circles Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {stories.map((story, index) => (
            <div 
              key={story.id} 
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
            >
              {/* The Story Ring */}
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#D4C29A] to-black">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-black flex items-center justify-center">
                  {story.media_type === 'video' ? (
                    <video 
                      src={story.media_url} 
                      className="w-full h-full object-cover opacity-80" 
                      muted 
                      playsInline 
                    />
                  ) : (
                    <img 
                      src={story.media_url} 
                      alt="Story thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                View
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Story Viewer Modal */}
      {activeStoryIndex !== null && activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
          
          {/* Action Buttons Container */}
          <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
            {/* Share Button */}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/story/${activeStory.id}`);
                alert('Link copied to clipboard!');
              }}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
              title="Share Story"
            >
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Share</span>
              <Share2 size={24} />
            </button>

            {/* Close Button */}
            <button 
              onClick={() => setActiveStoryIndex(null)}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Close"
            >
              <X size={32} />
            </button>
          </div>

          {/* Previous/Next Click Areas */}
          <div 
            className="absolute left-0 top-0 w-1/3 h-full z-40 cursor-pointer"
            onClick={() => setActiveStoryIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
          />
          <div 
            className="absolute right-0 top-0 w-1/3 h-full z-40 cursor-pointer"
            onClick={() => setActiveStoryIndex(prev => (prev !== null && prev < stories.length - 1 ? prev + 1 : null))}
          />

          {/* Media Container */}
          <div className="relative w-full max-w-md h-[80vh] bg-black rounded-xl overflow-hidden shadow-2xl">
            {/* ✨ NEW: Animation wrapper. The key={activeStory.id} forces React to re-mount this div smoothly triggering the Tailwind slide-in animation */}
            <div 
              key={activeStory.id}
              className="absolute inset-0 w-full h-full animate-in fade-in slide-in-from-right-8 duration-300 ease-out"
            >
              {activeStory.media_type === 'video' ? (
                <video 
                  src={activeStory.media_url} 
                  className="w-full h-full object-contain" 
                  autoPlay 
                  playsInline 
                  controls={false} // Hides native controls for a cleaner look
                  muted // ✨ NEW: Added muted to ensure autoPlay policies don't block the video
                  // ✨ NEW: Swapped 'loop' for 'onEnded' to advance naturally when the video finishes
                  onEnded={() => setActiveStoryIndex(prev => (prev !== null && prev < stories.length - 1 ? prev + 1 : null))}
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
                  src={activeStory.media_url} 
                  alt="Live Story" 
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Shoppable Link Overlay */}
            {activeStory.link_url && (
              <div className="absolute bottom-10 left-0 w-full flex justify-center z-50 pointer-events-none">
                <a 
                  href={activeStory.link_url}
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

          {/* Animated Progress Indicator */}
          <div className="absolute top-6 w-full max-w-md px-4 flex gap-1 z-50 pointer-events-none">
            {/* ✨ NEW: CSS keyframes for perfectly smooth 5-second image timer animation */}
            <style>{`
              @keyframes fill-progress {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            `}</style>
            
            {/* ✨ NEW: Now mapping the 'story' object directly so we can check its media type for the animation logic */}
            {stories.map((story, idx) => (
              <div 
                key={idx} 
                // ✨ NEW: Outer div acts as the track (darkened background)
                className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
              >
                <div 
                  // ✨ NEW: Inner div is the animated white progress line
                  className="h-full bg-white"
                  style={{
                    // Fill 100% if we've passed this story, otherwise use the tracked video progress, or 0%
                    width: idx !== null && activeStoryIndex !== null && idx < activeStoryIndex 
                      ? '100%' 
                      : (idx === activeStoryIndex && story.media_type === 'video') 
                        ? `${videoProgress}%` 
                        : '0%',
                    // If it's an image and it's active, use CSS to animate it smoothly over 5 seconds
                    animation: (idx === activeStoryIndex && story.media_type !== 'video') 
                      ? 'fill-progress 5s linear forwards' 
                      : 'none',
                    // Add a tiny transition to smooth out the video tracking updates so it doesn't look jittery
                    transition: (idx === activeStoryIndex && story.media_type === 'video') 
                      ? 'width 0.2s linear' 
                      : 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
  </div>
  );
}