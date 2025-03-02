import { supabase } from '@/lib/supabase';

/**
 * Save a video summary to the database
 */
export const saveVideoSummary = async (
  userId: string,
  videoData: {
    videoId: string;
    title: string;
    duration: string;
    summary: string;
    transcript: string;
  }
) => {
  console.log('saveVideoSummary called with userId:', userId, 'videoId:', videoData.videoId);
  try {
    const { data, error } = await supabase
      .from('content')
      .insert({
        user_id: userId,
        type: 'video',
        title: videoData.title,
        content: {
          videoId: videoData.videoId,
          duration: videoData.duration,
          summary: videoData.summary,
          transcript: videoData.transcript
        },
        metadata: {
          source: 'youtube'
        }
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error saving video summary:', error);
      throw error;
    }
    console.log('Video summary saved successfully with id:', data?.id);
    return data;
  } catch (error) {
    console.error('Error saving video summary:', error);
    throw error;
  }
};

/**
 * Get recent lectures for the current user
 */
export const getRecentLectures = async (userId: string, limit: number = 3) => {
  console.log('getRecentLectures called with userId:', userId, 'limit:', limit);
  if (!userId) {
    console.log('No userId provided, returning empty array');
    return [];
  }
  
  try {
    // Ensure limit is at least 3 but not more than 10 for performance
    const safeLimit = Math.max(3, Math.min(limit, 10));
    console.log('Using safeLimit:', safeLimit);
    
    const { data, error } = await supabase
      .rpc('get_recent_lectures', {
        p_user_id: userId,
        p_limit: safeLimit
      });

    if (error) {
      console.error('Supabase error fetching recent lectures:', error);
      throw error;
    }
    
    console.log('Fetched lectures data:', data);
    
    // Ensure we're returning an array even if the data is null
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching recent lectures:', error);
    return [];
  }
};

/**
 * Get a specific lecture by ID
 */
export const getLectureById = async (lectureId: string) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', lectureId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lecture:', error);
    return null;
  }
}; 