import React, { useState, useMemo } from 'react';
import useCompletionPercentage from '@/hooks/useCompletionPercentage';

const FormCompletionBanner = ({
  profileId,
  profile,
  companyProfile,
  businessDetails,
  founderInformation,
  fundingInformation,
  ctoInfo,
  companyDocuments,
  investorSignup,
}) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const completionInput = useMemo(
    () => ({
      profileId,
      profile,
      companyProfile,
      businessDetails,
      founderInformation,
      fundingInformation,
      ctoInfo,
      companyDocuments,
      investorSignup,
    }),
    [
      profileId,
      profile,
      companyProfile,
      businessDetails,
      founderInformation,
      fundingInformation,
      ctoInfo,
      companyDocuments,
      investorSignup,
    ]
  );

  const { completionPercentage, loading } =
    useCompletionPercentage(completionInput);

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  if (!isBannerVisible) return null;

  if (loading) {
    return (
      <div className='completion-banner bg-grey-100 text-black py-4 px-6 flex items-center justify-between shadow-md rounded-md animate-pulse'>
        <div>
          <div className='bg-[#C4C4C4] dark:bg-slate-500 h-4 w-100 mb-2 rounded'></div>
          <div className='bg-[#C4C4C4] dark:bg-slate-500 h-3 w-60 rounded'></div>
        </div>
        <div className='flex items-center'>
          <div className='bg-[#C4C4C4] dark:bg-slate-500 h-6 w-6 rounded-full'></div>
        </div>
      </div>
    );
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
