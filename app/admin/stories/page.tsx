import AdminStoryUploader from '@/components/admin/AdminStoryUploader';
import ActiveStoriesGrid from '@/components/admin/ActiveStoriesGrid';
import { PlaySquare, LayoutGrid } from 'lucide-react'; // ✨ Added icons to match the image layout
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
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Shop Stories</h1>
            <p className="text-gray-800 mt-2 font-medium">
              Manage store-wide visual stories and upload new interactive content.
            </p>
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
        <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100/50">
          <AdminStoryUploader />
        </section>
        
        {/* Bottom Section: The Live Grid wrapped in a luxury white card */}
        {/* ✨ UPDATED: Added white background, deep rounded corners, and soft shadow */}
        <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100/50">
          <ActiveStoriesGrid />
        </section>
      </div>
    </div>
  );
}