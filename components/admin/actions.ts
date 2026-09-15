'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function uploadStoryAction(formData: FormData) {
  // ✨ UPDATED: Extract all the new Highlight Group data instead of a single file
  const coverImage = formData.get('coverImage') as File;
  const title = formData.get('title') as string;
  const mediaFiles = formData.getAll('mediaFiles') as File[];
  const linkUrl = formData.get('linkUrl') as string;

  // ✨ UPDATED: Validate that the cover and interior media exist
  if (!coverImage || mediaFiles.length === 0) {
    return { success: false, error: 'Cover image and at least one media file are required' };
  }

  // 1. Properly AWAIT the cookies() function for newer Next.js versions
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Actions
          }
        },
      },
    }
  );

  // 2. Verify the session using the cleanly decoded cookie
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session) {
    return { success: false, error: 'Your session expired or is invalid. Please log in again.' };
  }

  try {
    // ✨ NEW: Generate safe name for the Cover Image
    const coverExt = coverImage.name.split('.').pop();
    const cleanCoverName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
    
    // 3. Upload the file securely from the server (Now uploading the Cover first)
    const { error: coverUploadError } = await supabase.storage
      .from('shop_stories')
      .upload(cleanCoverName, coverImage, {
        upsert: true,
      });

    if (coverUploadError) throw coverUploadError;

    // 4. Generate the public URL (Now specifically for the cover)
    const { data: { publicUrl: coverUrl } } = supabase.storage
      .from('shop_stories')
      .getPublicUrl(cleanCoverName);

    // ✨ NEW: Loop through and upload all the internal story files
    const uploadedItems = [];
    for (const file of mediaFiles) {
      const fileExt = file.name.split('.').pop();
      const cleanMediaName = `media-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: mediaUploadError } = await supabase.storage
        .from('shop_stories')
        .upload(cleanMediaName, file, { upsert: true });
        
      if (mediaUploadError) throw mediaUploadError;
      
      const { data: { publicUrl: mediaUrl } } = supabase.storage
        .from('shop_stories')
        .getPublicUrl(cleanMediaName);
        
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      uploadedItems.push({ url: mediaUrl, type: mediaType });
    }

    // 5. Save the story to the database
    // ✨ UPDATED: We now save the cover, the title, and the JSON array of media items!
    const { error: dbError } = await supabase
      .from('shop_stories')
      .insert({
        media_url: coverUrl, // Backwards compatible cover URL
        media_type: 'highlight_group', // ✨ NEW: Identifier for grouped stories
        title: title || null, // ✨ NEW: Save the Highlight name
        media_items: uploadedItems, // ✨ NEW: Save the array of interior videos/photos
        link_url: linkUrl.trim() === '' ? null : linkUrl.trim(),
      });

    if (dbError) throw dbError;

    return { success: true };

  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { success: false, error: error.message || 'Server upload failed' };
  }
}