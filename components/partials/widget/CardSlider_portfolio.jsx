'use client';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { fetchInvestorDocuments } from '@/lib/actions/investorActions';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/components/Loading';
import { useDocumentContext } from '@/context/DocumentContext';

const CardSlider = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useCompleteUserDetails();
  const { setSelectedDocuments } = useDocumentContext();

  useEffect(() => {
    if (profile?.id) {
      fetchDocuments(profile.id);
    }
  }, [profile]);

  const fetchDocuments = async (profileId) => {
    setIsLoading(true);
    const result = await fetchInvestorDocuments(profileId);
    if (result.error) {
      setDocuments([]);
    } else {
      setDocuments(result);
      // Set initial documents to the first startup's documents
      setSelectedDocuments(result[0]);
    }
    setIsLoading(false);
  };

  const handleSlideChange = (swiper) => {
    const activeIndex = swiper.activeIndex;
    setSelectedDocuments(documents[activeIndex]);
    console.log('Selected Documents: ', documents[activeIndex]);
  };

  if (isLoading) {
    return <Loading />;
  }

  console.log('Fetched Documents: ', documents);

  return (
    <div className='relative'>
      <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[EffectCards]}
        onSlideChange={handleSlideChange}
      >
        {documents.map((document, i) => (
          <SwiperSlide key={i}>
            <div className='from-[#1EABEC] to-primary-500 h-[200px] bg-gradient-to-r relative rounded-md z-[1] p-4 text-white'>
              <div className='overlay absolute left-0 top-0 h-full w-full -z-[1]'>
                <img
                  src='/assets/images/all-img/visa-card-bg.png'
                  alt=''
                  className='h-full w-full object-contain'
                />
              </div>
              <div className='h-10 w-10 rounded-full'>
                {document?.company_logo ? (
                  <img
                    src={document.company_logo}
                    alt='Company Logo'
                    className='w-full h-full object-contain rounded-full'
                  />
                ) : (
                  <img
                    src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                    alt=''
                    className='w-full h-full object-contain rounded-full'
                  />
                )}
              </div>
              <div className='mt-[18px] font-semibold text-lg mb-[17px]'>
                {document.company_name}
              </div>
              <div className='text-xs text-opacity-75 mb-[2px]'>
                Investment Amount
              </div>
              <div className='text-2xl font-semibold'>$10,975</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider;
