'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Story = {
  id: string;
  media_url: string;
  media_type: string;
  link_url: string | null;
  created_at: string;
};

export default function ActiveStoriesGrid() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch the active stories when the component loads
  const fetchStories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('shop_stories')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString()) // Only get stories that haven't expired
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

  if (isLoading) return <div className="mt-8 text-gray-500">Loading active stories...</div>;

  if (stories.length === 0) return <div className="mt-8 text-gray-500">No active stories at the moment.</div>;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Currently Live Stories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stories.map((story) => (
          <div key={story.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
            
            {/* Media Display */}
            <div className="aspect-[9/16] w-full bg-black relative">
              {story.media_type === 'video' ? (
                <video src={story.media_url} className="w-full h-full object-cover" muted loop playsInline />
              ) : (
                <img src={story.media_url} alt="Shop Story" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Shoppable Link Indicator */}
            {story.link_url && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                Has Link
              </div>
            )}

            {/* Delete Button (Shows on hover) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => handleDelete(story.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
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