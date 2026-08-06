import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Check the secret so randos can't trigger your script
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Initialize Supabase Admin Client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date().toISOString();

    // 3. Fetch expired stories using your actual table and expires_at column
    const { data: expiredStories, error: fetchError } = await supabase
      .from('shop_stories')
      .select('id, media_url')
      .lte('expires_at', now);

    if (fetchError) throw fetchError;
    if (!expiredStories || expiredStories.length === 0) {
      return NextResponse.json({ message: 'No expired stories found.' });
    }

    // 4. Extract just the file name from your full media_url
    const filePaths = expiredStories.map((story) => {
      const urlParts = story.media_url.split('/shop_stories/');
      return urlParts.length > 1 ? urlParts[1] : null;
    }).filter(Boolean) as string[];

    // 5. Delete the media files from your shop_stories bucket
    if (filePaths.length > 0) {
      const { error: storageError } = await supabase
        .storage
        .from('shop_stories')
        .remove(filePaths);

      if (storageError) throw storageError;
    }

    // 6. Delete the old records from the shop_stories table
    const storyIds = expiredStories.map((story) => story.id);
    const { error: dbError } = await supabase
      .from('shop_stories')
      .delete()
      .in('id', storyIds);

    if (dbError) throw dbError;

    return NextResponse.json({ 
      message: `Successfully deleted ${expiredStories.length} expired stories and media files.` 
    });

  } catch (error) {
    console.error('Error cleaning up stories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}