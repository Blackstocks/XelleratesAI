'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import Sidebar from '@/components/partials/blog/Sidebar';
import useFetchBlogs from '@/hooks/useFetchBlogs';
import Loading from '@/app/loading';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';
import ShareModal from '@/components/blog/ShareModal'; // Import the ShareModal

const BlogPage = () => {
  const { blogs, loading, error } = useFetchBlogs();
  const [blogsState, setBlogsState] = useState([]);
  const [likedBlogs, setLikedBlogs] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const { user, loading: userLoading } = useUserDetails();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // State for modal visibility
  const [shareUrl, setShareUrl] = useState(''); // State to hold the blog URL to be shared
  const [selectedBlogId, setSelectedBlogId] = useState(null); // State to hold the selected blog ID

  useEffect(() => {
    const fetchLikes = async () => {
      if (!user || userLoading) return;

      const { data: likedBlogsData, error } = await supabase
        .from('blog_likes')
        .select('blog_id')
        .eq('user_id', user.id);

      if (likedBlogsData) {
        const likedBlogIds = likedBlogsData.reduce((acc, curr) => {
          acc[curr.blog_id] = true;
          return acc;
        }, {});
        setLikedBlogs(likedBlogIds);
      }
    };

    if (blogs.length && user) {
      setBlogsState(blogs);
      fetchLikes();
    }
  }, [blogs, user, userLoading]);

  const handleLike = async (blogId) => {
    if (!user || likeLoading[blogId]) return;

    setLikeLoading((prev) => ({ ...prev, [blogId]: true }));

    try {
      if (likedBlogs[blogId]) {
        await supabase
          .from('blog_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('blog_id', blogId);

        await supabase
          .from('blogs')
          .update({
            likes: blogsState.find((blog) => blog.id === blogId).likes - 1,
          })
          .eq('id', blogId);

        setLikedBlogs((prev) => {
          const newLikedBlogs = { ...prev };
          delete newLikedBlogs[blogId];
          return newLikedBlogs;
        });

        setBlogsState((prevState) =>
          prevState.map((blog) =>
            blog.id === blogId ? { ...blog, likes: blog.likes - 1 } : blog
          )
        );
      } else {
        await supabase
          .from('blog_likes')
          .insert([{ user_id: user.id, blog_id: blogId }]);

        await supabase
          .from('blogs')
          .update({
            likes: blogsState.find((blog) => blog.id === blogId).likes + 1,
          })
          .eq('id', blogId);

        setLikedBlogs((prev) => ({ ...prev, [blogId]: true }));

        setBlogsState((prevState) =>
          prevState.map((blog) =>
            blog.id === blogId ? { ...blog, likes: blog.likes + 1 } : blog
          )
        );
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [blogId]: false }));
    }
  };

  const handleShare = (blogId) => {
    const blogToShare = blogsState.find((blog) => blog.id === blogId);
    if (blogToShare) {
      setShareUrl(`https://yourwebsite.com/blog/${blogToShare.id}`); // Set the share URL
      setSelectedBlogId(blogId); // Set the selected blog ID
      setIsShareModalOpen(true); // Open the share modal
    }
  };

  const incrementShareCount = async (blogId) => {
    setBlogsState((prevState) =>
      prevState.map((blog) =>
        blog.id === blogId ? { ...blog, shares: blog.shares + 1 } : blog
      )
    );
  };

  if (loading || userLoading) {
    return <Loading />;
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
          {blogsState.map((blog, index) => (
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
                      <button
                        onClick={() => handleLike(blog.id)}
                        disabled={likeLoading[blog.id]}
                      >
                        <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                          <Icon
                            icon={
                              likedBlogs[blog.id]
                                ? 'heroicons-solid:heart'
                                : 'heroicons-outline:heart'
                            }
                            className={`${
                              likedBlogs[blog.id]
                                ? 'text-red-500'
                                : 'text-slate-400'
                            } ltr:mr-2 rtl:ml-2 text-lg`}
                          />
                          {blog.likes}
                        </span>
                      </button>
                      <button onClick={() => handleShare(blog.id)}>
                        <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                          <Icon
                            icon='heroicons-outline:share'
                            className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                          />
                          {blog.shares}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Blog Title and Content Rendering */}
                  <h6 className='card-title text-slate-900 '>
                    <Link href={`blog/${blog.id}`}>{blog.title}</Link>
                  </h6>
                  {index === 0 && (
                    <div className='card-text dark:text-slate-300 mt-4 space-y-4'>
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

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        blogUrl={shareUrl}
        blogId={selectedBlogId}
        incrementShareCount={incrementShareCount}
      />
    </div>
  );
};

export default BlogPage;
