// hooks/useFetchBlogDetails.js
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useFetchBlogDetails = (blogId) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!blogId) return; // Return early if blogId is not available yet

    const fetchBlogDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs') // Ensure your table name is correct
          .select('*')
          .eq('id', blogId)
          .single();

        if (error) throw error;

        setBlog(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [blogId]);

  return { blog, loading, error };
};

export default useFetchBlogDetails;
