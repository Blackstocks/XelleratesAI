'use client';

import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'; // Importing FontAwesome icons
import { supabase } from '@/lib/supabaseclient';

const ShareModal = ({
  isOpen,
  onClose,
  blogUrl,
  blogId,
  incrementShareCount,
}) => {
  if (!isOpen) return null;

  const handleShareClick = async (platform) => {
    try {
      // Fetch the current share count from the database
      const { data: currentData, error: fetchError } = await supabase
        .from('blogs')
        .select('shares')
        .eq('id', blogId)
        .single();

      if (fetchError) {
        console.error('Error fetching current share count:', fetchError);
        return;
      }

      // Update the share count in the database
      const newShareCount = currentData.shares + 1;
      await supabase
        .from('blogs')
        .update({ shares: newShareCount })
        .eq('id', blogId);

      // Open the sharing URL
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            blogUrl
          )}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            blogUrl
          )}&text=Check this out!`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            blogUrl
          )}`;
          break;
        default:
          break;
      }

      window.open(shareUrl, '_blank', 'noopener,noreferrer');

      // Call the function to update the share count in the parent component
      incrementShareCount(blogId);
    } catch (error) {
      console.error('Error updating share count:', error);
    }
    onClose();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'
      role='dialog'
      aria-modal='true'
    >
      <div className='bg-white rounded-xl overflow-hidden shadow-lg max-w-sm w-full relative p-6'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200 focus:outline-none'
          aria-label='Close modal'
        >
          &times;
        </button>
        <h3 className='text-xl font-semibold text-gray-800 mb-4 text-center'>
          Share this post
        </h3>
        <div className='flex justify-center space-x-6 mt-4'>
          {/* Social Media Icons */}
          <button
            onClick={() => handleShareClick('facebook')}
            className='bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-all duration-300 shadow-lg transform hover:scale-105'
            aria-label='Share on Facebook'
          >
            <FaFacebook className='text-2xl' />
          </button>
          <button
            onClick={() => handleShareClick('twitter')}
            className='bg-blue-400 hover:bg-blue-500 text-white rounded-full p-3 transition-all duration-300 shadow-lg transform hover:scale-105'
            aria-label='Share on Twitter'
          >
            <FaTwitter className='text-2xl' />
          </button>
          <button
            onClick={() => handleShareClick('linkedin')}
            className='bg-blue-700 hover:bg-blue-800 text-white rounded-full p-3 transition-all duration-300 shadow-lg transform hover:scale-105'
            aria-label='Share on LinkedIn'
          >
            <FaLinkedin className='text-2xl' />
          </button>
        </div>
        <p className='text-gray-500 text-sm text-center mt-6'>
          Click an icon to share this post on your favorite platform!
        </p>
      </div>
    </div>
  );
};

export default ShareModal;
