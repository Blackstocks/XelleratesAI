'use client';
import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import Sidebar from '@/components/partials/blog/Sidebar';
import useFetchBlogs from '@/hooks/useFetchBlogs'; // Import the custom hook
import Loading from '@/app/loading';

const BlogPage = () => {
  const { blogs, loading, error } = useFetchBlogs(); // Use the hook to get blogs

  if (loading) {
    return (
      <p>
        <Loading />
      </p>
    );
  }

  if (error) {
    return <p>Error fetching blogs: {error}</p>;
  }

  return (
    <div className='lg:flex flex-wrap blog-posts lg:space-x-5 space-y-5 lg:space-y-0 rtl:space-x-reverse'>
      {/* Sidebar for categories and other content */}
      <div className='flex-none'>
        <div className='lg:max-w-[360px]'>
          <Card>
            <Sidebar />
          </Card>
        </div>
      </div>

      {/* Main content area for blog posts */}
      <div className='flex-1'>
        <div className='grid xl:grid-cols-2 grid-cols-1 gap-5'>
          {blogs.map((blog, index) => (
            <div
              key={blog.id}
              className={index === 0 ? 'xl:col-span-2 col-span-1' : ''}
            >
              <Card>
                {/* Blog Thumbnail or Video */}
                <div className='h-[248px] w-full mb-6'>
                  {blog.thumbnail_url.endsWith('.mp4') ? (
                    <video
                      src={blog.thumbnail_url}
                      alt={blog.title}
                      className='w-full h-full object-cover'
                      controls
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={blog.thumbnail_url}
                      alt={blog.title}
                      className='w-full h-full object-cover'
                    />
                  )}
                </div>

                {/* Blog Details */}
                <div className={index === 0 ? '' : ' pb-6'}>
                  <div className='flex justify-between mb-4'>
                    <Link href={`blog/${blog.id}`}>
                      <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                        <Icon
                          icon='heroicons-outline:calendar'
                          className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                        />
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                    <div className='flex space-x-4 rtl:space-x-reverse'>
                      <Link href='#'>
                        <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                          <Icon
                            icon='heroicons-outline:chat'
                            className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                          />
                          {blog.likes}
                        </span>
                      </Link>
                      <Link href='#'>
                        <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                          <Icon
                            icon='heroicons-outline:share'
                            className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                          />
                          {blog.shares}
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Blog Title and Content Rendering */}
                  <h6 className='card-title text-slate-900 '>
                    <Link href={`blog/${blog.id}`}>{blog.title}</Link>
                  </h6>
                  {index === 0 && (
                    <div className='card-text dark:text-slate-300 mt-4 space-y-4'>
                      {/* Render HTML Content safely */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: blog.content.slice(0, 500),
                        }}
                      />
                      <Button
                        className='btn-outline-dark'
                        text='Read more'
                        link={`blog/${blog.id}`}
                      />
                    </div>
                  )}

                  {index !== 0 && (
                    <div className='text-sm card-text dark:text-slate-300 mt-4'>
                      {/* Render Shortened HTML Content safely */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: blog.content.slice(0, 200),
                        }}
                      />
                      <div className='mt-4 space-x-4 rtl:space-x-reverse'>
                        <Link href={`blog/${blog.id}`} className='btn-link'>
                          Learn more
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
