-- Run the get_recent_lectures function
SELECT get_recent_lectures(auth.uid(), 3);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_recent_lectures TO authenticated; 