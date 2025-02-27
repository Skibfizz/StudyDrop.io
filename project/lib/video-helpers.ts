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

    if (error) throw error;
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
  try {
    const { data, error } = await supabase
      .rpc('get_recent_lectures', {
        p_user_id: userId,
        p_limit: limit
      });

    if (error) throw error;
    return data;
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