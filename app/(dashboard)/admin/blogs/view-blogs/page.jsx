'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify';
import Card from '@/components/ui/Card'; // Assuming you have a Card component
import Icon from '@/components/ui/Icon'; // Assuming you have an Icon component
import Loading from '@/app/loading'; // Assuming you have a Loading component

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch blogs from the Supabase database
  const fetchBlogs = async () => {
    setLoading(true); // Start loading
    const { data, error } = await supabase
      .from('blogs') // Replace with your actual table name
      .select('id, title,likes,shares, created_at, updated_at') // Select relevant columns
      .order('created_at', { ascending: false }); // Ordering by latest

    if (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs.');
    } else {
      setBlogs(data);
    }
    setLoading(false); // End loading
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Function to handle blog deletion
  const deleteBlog = async (id) => {
    setLoading(true); // Start loading when deleting
    const { error } = await supabase
      .from('blogs') // Replace with your actual table name
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog.');
    } else {
      toast.success('Blog deleted successfully.');
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    }
    setLoading(false); // End loading
  };

  return (
    <Card>
      <div className='md:flex justify-between items-center mb-6'>
        <h4 className='card-title'>Blogs</h4>
      </div>
      {loading ? (
        <Loading /> // Render loading component when loading
      ) : (
        <div className='overflow-x-auto -mx-6'>
          <div className='inline-block min-w-full align-middle'>
            <div className='overflow-hidden'>
              <table className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'>
                <thead className='bg-slate-200 dark:bg-slate-700'>
                  <tr>
                    <th className='table-th'>SI.No</th>
                    <th className='table-th'>Title</th>
                    <th className='table-th'>Likes</th>
                    <th className='table-th'>Shares</th>
                    <th className='table-th'>Date</th>
                    <th className='table-th'>Actions</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700'>
                  {blogs.map((blog, index) => (
                    <tr key={blog.id}>
                      <td className='table-td'>{index + 1}</td>
                      <td className='table-td'>{blog.title}</td>
                      <td className='table-td'>{blog.likes}</td>
                      <td className='table-td'>{blog.shares}</td>
                      <td className='table-td'>
                        {new Date(
                          blog.updated_at || blog.created_at
                        ).toLocaleDateString()}
                      </td>
                      <td className='table-td'>
                        <button
                          className='btn btn-danger flex justify-center items-center'
                          onClick={() => deleteBlog(blog.id)}
                        >
                          <Icon icon='heroicons:trash-solid' />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BlogList;
