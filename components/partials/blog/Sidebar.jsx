'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import InputGroup from '@/components/ui/InputGroup';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { supabase } from '@/lib/supabaseclient'; // Import Supabase client

const categories = [
  { cta: 'All Posts' },
  { cta: 'Legal Clinic' },
  { cta: 'Case Study' },
  { cta: 'Fundraising' },
  { cta: 'Startup Evaluation' },
];

const Sidebar = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [postCounts, setPostCounts] = useState({}); // To store post counts by category

  // Fetch latest blogs and post counts by category
  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const { data: blogs, error } = await supabase
          .from('blogs') // Replace 'blogs' with your actual table name
          .select('id, title, created_at, categories, thumbnail_url')
          .order('created_at', { ascending: false })
          .limit(5); // Fetch latest 5 blogs

        if (error) throw error;

        setLatestPosts(blogs);

        // Calculate post counts by category
        const counts = {};
        blogs.forEach((blog) => {
          blog.categories.forEach((category) => {
            counts[category] = (counts[category] || 0) + 1; // Increment count for each category
          });
        });

        setPostCounts(counts);
      } catch (error) {
        console.error('Error fetching blogs:', error.message);
      }
    };

    fetchLatestBlogs();
  }, []);

  return (
    <div className='space-y-5 divide-y divide-slate-100 dark:divide-slate-700 -mx-6'>
      {/* Search Input */}
      <div className='px-6'>
        <InputGroup
          type='text'
          placeholder='Search....'
          append={
            <Button
              icon='heroicons-outline:search'
              className='btn-dark dark:bg-slate-600'
            />
          }
        />
      </div>

      {/* Latest Blogs Section */}
      <div className='pt-4 px-6'>
        <h4 className='text-slate-600 dark:text-slate-300 text-xl font-medium mb-4'>
          Latest Blogs Post
        </h4>
        <ul className='list-item space-y-4'>
          {latestPosts.map((post) => (
            <li key={post.id}>
              <div className='flex space-x-4 rtl:space-x-reverse'>
                <div className='flex-none'>
                  <div className='h-20 w-20'>
                    {/* Render blog video or image */}
                    {post.thumbnail_url.endsWith('.mp4') ? (
                      <video
                        src={post.thumbnail_url}
                        alt={post.title}
                        className='w-full h-full object-contain'
                        controls
                      ></video>
                    ) : (
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className='w-full h-full object-contain'
                      />
                    )}
                  </div>
                </div>

                <div className='flex-1 flex flex-col'>
                  <h4 className='text-sm text-slate-600 font-regular leading-5 mb-4'>
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h4>
                  <span className='text-xs text-slate-400'>
                    <Link href={`/blog/${post.id}`}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </Link>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories Section */}
      <div className='pt-4 px-6'>
        <h4 className='text-slate-600 dark:text-slate-300 text-xl font-medium mb-4'>
          Category
        </h4>
        <ul className='list-item space-y-6'>
          {categories.map((item, i) => (
            <li key={i}>
              <Link
                href='#'
                className='flex space-x-1 items-start leading-[1] text-sm text-slate-500 dark:text-slate-300 hover:text-slate-900 transition duration-150 rtl:space-x-reverse'
              >
                <span className='text-sm'>
                  <Icon icon='heroicons:chevron-right-solid' />
                </span>
                <span>
                  {item.cta} ({postCounts[item.cta] || 0}){' '}
                  {/* Render category count */}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Subscription Section */}
      <div className='mx-6 bg-slate-950 dark:bg-slate-950 text-white rounded-xl p-6 space-y-4'>
        <h4 className='text-xl font-medium text-white'>
          Subscribe to our blog
        </h4>
        <div className='text-sm'>
          Global platform for startups to be investment ready through our AI
          model
        </div>
        <form action='#' className='space-y-4'>
          <input
            type='text'
            placeholder='Enter your email'
            className='form-control py-2 bg-transparent border-secondary-500 text-white placeholder:text-slate-400'
          />
          <button type='button' className='btn btn-light btn-sm w-full'>
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
