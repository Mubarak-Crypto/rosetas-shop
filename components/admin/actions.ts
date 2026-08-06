'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function uploadStoryAction(formData: FormData) {
  const file = formData.get('file') as File;
  const linkUrl = formData.get('linkUrl') as string;

  if (!file) {
    return { success: false, error: 'No file provided' };
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
    const fileExt = file.name.split('.').pop();
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // 3. Upload the file securely from the server
    const { error: uploadError } = await supabase.storage
      .from('shop_stories')
      .upload(cleanFileName, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Generate the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shop_stories')
      .getPublicUrl(cleanFileName);

    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    // 5. Save the story to the database
    const { error: dbError } = await supabase
      .from('shop_stories')
      .insert({
        media_url: publicUrl,
        media_type: mediaType,
        link_url: linkUrl.trim() === '' ? null : linkUrl.trim(),
      });

    if (dbError) throw dbError;

    return { success: true };

  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { success: false, error: error.message || 'Server upload failed' };
  }
}