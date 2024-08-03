import React, { useState } from 'react';
import useCompletionPercentage from '@/hooks/useCompletionPercentage';
import Loading from '@/components/Loading';

const FormCompletionBanner = () => {
  const { completionPercentage, loading } = useCompletionPercentage();
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  if (!isBannerVisible || loading) {
    return <Loading />;
  }

  return (
    <div className='completion-banner bg-grey-100 text-black py-4 px-6 flex items-center justify-between shadow-md rounded-md'>
      <div>
        <p className='font-medium text-lg'>
          {completionPercentage === 100
            ? 'Your profile is complete'
            : 'Few steps away from completing your profile'}
        </p>
        <p className='text-sm'>Form Completion: {completionPercentage}%</p>
      </div>
      <div className='flex items-center'>
        <button
          onClick={handleCloseBanner}
          className='ml-4 text-black red-500 text-xl font-bold'
          aria-label='Close Banner'
        >
          &#x2716;
        </button>
      </div>
    </div>
  );
};

export default FormCompletionBanner;
