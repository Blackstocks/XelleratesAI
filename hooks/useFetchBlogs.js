// hooks/useFetchBlogs.js
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useFetchBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs') // Ensure your table name is correct
          .select(
            'id, title, content, thumbnail_url, created_at, likes, shares'
          );

        if (error) throw error;

        setBlogs(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return { blogs, loading, error };
};

export default useFetchBlogs;
