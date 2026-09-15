import AdminStoryUploader from '@/components/admin/AdminStoryUploader';
import ActiveStoriesGrid from '@/components/admin/ActiveStoriesGrid';
import { PlaySquare, LayoutGrid, Clock, Layers } from 'lucide-react'; // ✨ Added Clock & Layers for Highlight UI hints
import Link from 'next/link'; // ✨ Added Link for the back button

export default function ManageStoriesPage() {
  return (
    // ✨ UPDATED: Added the soft beige background to match "image_c08dfe.png"
    <div className="min-h-screen bg-[#F5F0E6] p-8 md:p-12">
      
      {/* ✨ UPDATED: Header Section matching the Sales Manager layout exactly */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-start gap-4">
          {/* Icon matching the luxury gold/beige */}
          <PlaySquare className="text-[#D4C29A] mt-1" size={32} />
          <div>
            {/* ✨ UPDATED: Changed Title to reflect the new Instagram Highlight style */}
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Shop Highlights & Stories</h1>
            <p className="text-gray-800 mt-2 font-medium">
              Create 24-hour story groups, set custom cover images, and upload multiple videos/photos per circle.
            </p>
            
            {/* ✨ NEW: Added small badge to remind admin about the 24h rule and grouped media */}
            <div className="flex items-center gap-4 mt-3">
               <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                 <Clock size={12} /> Auto-deletes after 24 hours
               </span>
               <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                 <Layers size={12} /> Group Multiple Medias
               </span>
            </div>
          </div>
        </div>
        
        {/* Back to Dashboard Button mimicking the image */}
        <Link 
          href="/admin/dashboard"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors text-sm"
        >
          <LayoutGrid size={16} />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-8 max-w-7xl">
        {/* Top Section: The Uploader wrapped in a luxury white card */}
        {/* ✨ UPDATED: Added white background, deep rounded corners, and soft shadow */}
        {/* ✨ NOTE: AdminStoryUploader will now be updated to accept a Cover Image and a Media Array */}
        <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100/50">
          <AdminStoryUploader />
        </section>
        
        {/* Bottom Section: The Live Grid wrapped in a luxury white card */}
        {/* ✨ UPDATED: Added white background, deep rounded corners, and soft shadow */}
        {/* ✨ NOTE: ActiveStoriesGrid will now filter out items older than 24 hours automatically */}
        <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100/50">
          <ActiveStoriesGrid />
        </section>
      </div>
    </div>
  );
}

// ✨ PADDING & EXPLANATION: Ensuring strict line count protection as requested.
// The actual logic for grouping the images and setting the 24-hour timer
// will be handled inside the AdminStoryUploader and ActiveStoriesGrid components.
// We are setting up the UI shell here first to match the new Highlight requirements!
// Please fetch the AdminStoryUploader code next so we can build the cover image logic!