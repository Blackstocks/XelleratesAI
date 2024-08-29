'use client';
import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import Sidebar from '@/components/partials/blog/Sidebar';
import { useParams } from 'next/navigation'; // Import useParams from next/navigation
import useFetchBlogDetails from '@/hooks/useFetchBlogDetails'; // Import the custom hook

const BlogDetailsPage = () => {
  const { id } = useParams(); // Extract id (blogId) from URL using useParams
  const { blog, loading, error } = useFetchBlogDetails(id); // Use the hook to get blog details

  if (loading) {
    return <p>Loading blog details...</p>;
  }

  if (error) {
    return <p>Error fetching blog details: {error}</p>;
  }

  return (
    <div>
      <div className='lg:flex flex-wrap blog-posts lg:space-x-5 space-y-5 lg:space-y-0 rtl:space-x-reverse'>
        <div className='flex-none'>
          <div className='lg:max-w-[360px]'>
            <Card>
              <Sidebar />
            </Card>
          </div>
        </div>
        <div className='flex-1'>
          <div className='grid grid-cols-1 gap-5'>
            <Card>
              {/* Blog Video */}
              <div className='h-[248px] w-full mb-6'>
                <video
                  src={blog.thumbnail_url || '/assets/videos/default-video.mp4'} // Use a default video if no URL is available
                  alt={blog.title}
                  className='w-full h-full object-cover'
                  controls // Adds video controls like play, pause, volume
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Blog Metadata */}
              <div className='flex justify-between mb-4'>
                <span className='inline-flex leading-5 text-slate-500 dark:text-slate-500 text-sm font-normal'>
                  <Icon
                    icon='heroicons-outline:calendar'
                    className='text-slate-400 dark:text-slate-500 ltr:mr-2 rtl:ml-2 text-lg'
                  />
                  {new Date(blog.created_at).toLocaleDateString()}
                </span>
                <div className='flex space-x-4 rtl:space-x-reverse'>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-500 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:chat'
                      className='text-slate-400 dark:text-slate-500 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    {blog.comments_count || 0}
                  </span>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-500 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:share'
                      className='text-slate-400 dark:text-slate-500 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    {blog.shares || 0}
                  </span>
                </div>
              </div>

              {/* Blog Title */}
              <h5 className='card-title text-slate-900'>{blog.title}</h5>

              {/* Blog Content Rendering */}
              <div
                className='card-text dark:text-slate-300 mt-4 space-y-4 leading-5 text-slate-600 text-sm border-b border-slate-100 dark:border-slate-700 pb-6'
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Social Share Icons */}
              <div className='mt-6'>
                <ul className='flex items-center space-x-3 rtl:space-x-reverse'>
                  <li className='dark:text-slate-300'>Share:</li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/tw.svg'} alt='' />
                    </a>
                  </li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/fb.svg'} alt='' />
                    </a>
                  </li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/ln.svg'} alt='' />
                    </a>
                  </li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/ins.svg'} alt='' />
                    </a>
                  </li>
                </ul>

                {/* Comments Section */}
                <ul className='comments mt-6 space-y-4'>
                  {/* Render comments dynamically if available */}
                  {blog.comments?.map((comment, index) => (
                    <li key={index} className='block'>
                      <div className='flex'>
                        <div className='flex-none'>
                          <div className='h-[56px] w-[56px] rounded-full ltr:mr-6 rtl:ml-6'>
                            <img
                              src={
                                comment.avatar || '/assets/images/post/c1.png'
                              }
                              alt=''
                              className='w-full block h-full object-contain rounded-full'
                            />
                          </div>
                        </div>
                        <div className='flex-1'>
                          <div className='flex flex-wrap justify-between mb-2'>
                            <span className='text-slate-600 text-base dark:text-slate-300 font-normal'>
                              {comment.author_name}
                            </span>
                            <span className='text-sm text-slate-500 dark:text-slate-500 flex space-x-1 rtl:space-x-reverse items-center'>
                              <Icon
                                icon='heroicons:clock'
                                className='text-base'
                              />
                              <span>
                                {new Date(comment.date).toLocaleDateString()}
                              </span>
                            </span>
                          </div>
                          <p className='text-sm text-slate-500 dark:text-slate-400'>
                            {comment.text}
                          </p>
                          <div className='mt-2'>
                            <Link
                              href='#'
                              className='flex space-x-2 items-center dark:text-slate-500 text-xs font-medium rtl:space-x-reverse'
                            >
                              <span>Reply</span>
                              <Icon
                                icon='heroicons:arrow-right-20-solid'
                                className='text-lg'
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Comment Form */}
                <div className='post-comments bg-slate-100 dark:bg-slate-950 p-6 rounded-md mt-6'>
                  <h4 className='text-lg font-medium text-slate-500 dark:text-slate-100 mb-4'>
                    Leave a comment
                  </h4>
                  <form action='#'>
                    <div className='grid lg:grid-cols-2 grid-cols-1 gap-3'>
                      <div className='lg:col-span-2'>
                        <Textarea
                          label='Comment'
                          placeholder='Write your comment'
                        />
                      </div>
                      <Textinput
                        label='Full name'
                        placeholder='Full name'
                        type='text'
                      />
                      <Textinput
                        label='Email'
                        placeholder='Email Address'
                        type='email'
                      />
                    </div>
                    <div className='text-right'>
                      <Button
                        text='Post comment'
                        type='submit'
                        className=' btn-dark mt-3 '
                      />
                    </div>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailsPage;
