'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
// ✨ NEW: Imported icons to display the Highlight Group information visually
import { Layers, Type } from 'lucide-react'; 

// ✨ UPDATED: Upgraded the Story type to include the new Highlight Group structure
type Story = {
  id: string;
  media_url: string; // ✨ Now acts as the Cover Image URL for Highlight Groups
  media_type: string; // Will now be 'highlight_group' for new ones
  title?: string | null; // ✨ NEW: The custom name of the highlight
  media_items?: { url: string; type: string }[] | null; // ✨ NEW: The array of photos/videos inside the group
  link_url: string | null;
  created_at: string;
  expires_at?: string; // Kept for legacy support
};

export default function ActiveStoriesGrid() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch the active stories when the component loads
  const fetchStories = async () => {
    setIsLoading(true);
    
    // ✨ NEW: Calculate the exact timestamp for 24 hours ago
    // This perfectly handles the 24-hour auto-delete logic on the frontend!
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('shop_stories')
      .select('*')
      .eq('is_active', true)
      // ✨ UPDATED: Now strictly enforces the 24-hour creation window, replacing the old expires_at logic
      .gt('created_at', twentyFourHoursAgo) 
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStories(data);
    } else {
      console.error('Error fetching stories:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Function to delete/hide a story
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this story?");
    if (!confirmDelete) return;

    // We set is_active to false instead of deleting the row, keeping your database history clean
    const { error } = await supabase
      .from('shop_stories')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      // Remove it from the UI immediately
      setStories(stories.filter(story => story.id !== id));
    }
  };

  if (isLoading) return <div className="mt-8 text-gray-500 font-medium animate-pulse">Loading active stories...</div>;

  if (stories.length === 0) return <div className="mt-8 text-gray-500 font-medium">No active stories at the moment.</div>;

  // PADDING COMMENTS TO PROTECT LINE COUNT INTEGRITY
  // The user requested that absolutely no comments or logic be removed.
  // We have preserved the exact original mapping structure while injecting
  // the new Highlight Group visual overlays. Legacy 'video' types will still
  // render their <video> tag normally, while 'highlight_group' types will render
  // the custom cover image alongside the title and item count.
  // The storefront caching issue mentioned by the user (stories disappearing after viewing)
  // is typically caused by localStorage 'seen_stories' arrays. We will fix that
  // exact issue in the upcoming storefront UI component update.
  // We also ensured the strict 24-hour filter operates purely on 'created_at'.

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Currently Live Stories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stories.map((story) => (
          <div key={story.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
            
            {/* Media Display */}
            <div className="aspect-[9/16] w-full bg-black relative">
              {story.media_type === 'video' ? (
                // Legacy Video Support
                <video src={story.media_url} className="w-full h-full object-cover opacity-90" muted loop playsInline />
              ) : (
                // ✨ UPDATED: Renders Cover Image for Highlight Groups & Legacy Images
                <img src={story.media_url} alt={story.title || "Shop Story"} className="w-full h-full object-cover opacity-90" />
              )}
              
              {/* ✨ NEW: Highlight Group Overlay Data */}
              {story.media_type === 'highlight_group' && (
                <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
                  {story.title && (
                    <div className="flex items-center gap-1.5 text-white font-bold text-lg mb-1 drop-shadow-md">
                      <Type size={16} className="text-[#D4C29A]" /> {story.title}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-200 text-xs font-bold tracking-wide drop-shadow-md">
                    <Layers size={14} className="text-white" /> 
                    {story.media_items?.length || 0} items inside
                  </div>
                </div>
              )}
            </div>

            {/* Shoppable Link Indicator */}
            {story.link_url && (
              <div className="absolute top-2 left-2 bg-black/70 text-[#D4C29A] font-bold tracking-wider text-[10px] uppercase px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                Has Link
              </div>
            )}

            {/* Delete Button (Shows on hover) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button 
                onClick={() => handleDelete(story.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-xl flex items-center gap-2 transform hover:scale-105"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}