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
    // First, count how many video lectures this user already has
    const { count, error: countError } = await supabase
      .from('content')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('type', 'video');
    
    if (countError) {
      console.error('Error counting existing video lectures:', countError);
    } else {
      console.log(`User ${userId} has ${count} existing video lectures`);
      
      // If user has 3 or more lectures, we'll need to delete the oldest one(s)
      if (count && count >= 3) {
        console.log(`User has reached the limit of 3 video lectures. Will need to delete oldest lecture(s)`);
        
        // Get the oldest lectures (we'll need this for the actual implementation)
        const { data: oldestLectures, error: fetchError } = await supabase
          .from('content')
          .select('id, created_at, title')
          .eq('user_id', userId)
          .eq('type', 'video')
          .order('created_at', { ascending: true })
          .limit(count - 2); // This will get lectures to delete to maintain only 3
        
        if (fetchError) {
          console.error('Error fetching oldest lectures:', fetchError);
        } else {
          console.log(`Found ${oldestLectures.length} lecture(s) that would need to be deleted:`, 
            oldestLectures.map(l => ({ id: l.id, title: l.title, created_at: l.created_at })));
          
          // In the actual implementation, we would delete these lectures here
          // For now, we're just logging them
        }
      }
    }

    // Insert the new lecture as usual
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
    
    // First try using the RPC function
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_recent_lectures', {
        p_user_id: userId,
        p_limit: safeLimit
      });

    if (rpcError) {
      console.error('Supabase RPC error fetching recent lectures:', rpcError);
      
      // Fallback to direct query if RPC fails
      console.log('Falling back to direct query');
      const { data: queryData, error: queryError } = await supabase
        .from('content')
        .select('id, title, content, created_at')
        .eq('user_id', userId)
        .eq('type', 'video')
        .order('created_at', { ascending: false })
        .limit(safeLimit);
      
      if (queryError) {
        console.error('Supabase query error fetching recent lectures:', queryError);
        throw queryError;
      }
      
      // Transform the data to match the RPC function output
      const transformedData = queryData.map(item => ({
        id: item.id,
        title: item.title,
        video_id: item.content?.videoId || '',
        duration: item.content?.duration || '',
        created_at: item.created_at
      }));
      
      console.log('Fetched lectures data via direct query:', transformedData);
      
      // If no lectures found, check localStorage
      if (transformedData.length === 0) {
        console.log('No lectures found in database, checking localStorage');
        
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('recentLectures');
          if (stored) {
            try {
              const lectures = JSON.parse(stored);
              console.log('Found lectures in localStorage:', lectures);
              
              // Transform localStorage lectures to match the expected format
              return lectures.map((lecture: any) => ({
                id: lecture.id,
                title: lecture.title,
                video_id: lecture.videoId,
                duration: lecture.duration,
                created_at: lecture.timestamp
              }));
            } catch (e) {
              console.error('Error parsing localStorage lectures:', e);
            }
          }
        }
        
        // ISSUE: Instead of returning sample lectures, we should return an empty array
        // when no real lectures are found
        console.log('DEBUG: No lectures found in database or localStorage - SHOULD RETURN EMPTY ARRAY');
        
        // Return empty array instead of sample lectures
        return [];
      }
      
      return transformedData;
    }
    
    console.log('Fetched lectures data via RPC:', rpcData);
    
    // If no lectures found, check localStorage
    if (!Array.isArray(rpcData) || rpcData.length === 0) {
      console.log('No lectures found in database, checking localStorage');
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('recentLectures');
        if (stored) {
          try {
            const lectures = JSON.parse(stored);
            console.log('Found lectures in localStorage:', lectures);
            
            // Transform localStorage lectures to match the expected format
            return lectures.map((lecture: any) => ({
              id: lecture.id,
              title: lecture.title,
              video_id: lecture.videoId,
              duration: lecture.duration,
              created_at: lecture.timestamp
            }));
          } catch (e) {
            console.error('Error parsing localStorage lectures:', e);
          }
        }
      }
      
      // ISSUE: Instead of returning sample lectures, we should return an empty array
      // when no real lectures are found
      console.log('DEBUG: No lectures found in database or localStorage via RPC - SHOULD RETURN EMPTY ARRAY');
      
      // Return empty array instead of sample lectures
      return [];
    }
    
    return rpcData;
  } catch (error) {
    console.error('Error in getRecentLectures:', error);
    return [];
  }
};

/**
 * Get a specific lecture by ID
 */
export const getLectureById = async (lectureId: string) => {
  try {
    console.log(`[getLectureById] Fetching lecture with ID: ${lectureId}`);
    
    // If it's a sample lecture ID, return sample data
    if (lectureId.startsWith('sample-')) {
      console.log(`[getLectureById] Returning sample lecture data for ID: ${lectureId}`);
      const sampleLectures = {
        'sample-1': {
          id: 'sample-1',
          title: 'Machine Learning Basics',
          content: {
            videoId: 'dQw4w9WgXcQ',
            duration: 'PT15M30S',
            summary: 'This lecture covers the fundamentals of machine learning, including supervised and unsupervised learning, regression, classification, and neural networks.',
            transcript: 'Welcome to Machine Learning Basics. In this lecture, we will cover the fundamentals of machine learning...'
          }
        },
        'sample-2': {
          id: 'sample-2',
          title: 'Data Structures and Algorithms',
          content: {
            videoId: 'dQw4w9WgXcQ',
            duration: 'PT10M45S',
            summary: 'This lecture explores essential data structures and algorithms, including arrays, linked lists, trees, sorting algorithms, and search algorithms.',
            transcript: 'Welcome to Data Structures and Algorithms. In this lecture, we will explore essential data structures...'
          }
        },
        'sample-3': {
          id: 'sample-3',
          title: 'Web Development Fundamentals',
          content: {
            videoId: 'dQw4w9WgXcQ',
            duration: 'PT20M15S',
            summary: 'This lecture covers the basics of web development, including HTML, CSS, JavaScript, and responsive design principles.',
            transcript: 'Welcome to Web Development Fundamentals. In this lecture, we will cover the basics of web development...'
          }
        }
      };
      
      return sampleLectures[lectureId as keyof typeof sampleLectures] || null;
    }
    
    console.log(`[getLectureById] Querying database for lecture ID: ${lectureId}`);
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', lectureId)
      .single();

    if (error) {
      console.error(`[getLectureById] Error fetching lecture ${lectureId}:`, error);
      throw error;
    }
    
    console.log(`[getLectureById] Successfully retrieved lecture:`, {
      id: data?.id,
      title: data?.title,
      hasContent: !!data?.content
    });
    
    return data;
  } catch (error) {
    console.error('[getLectureById] Error fetching lecture:', error);
    return null;
  }
}; 