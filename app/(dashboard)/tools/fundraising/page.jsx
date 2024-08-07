'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails'; // Ensure this hook exists and the path is correct
import Loading from '@/components/Loading';
import DountChart from '@/components/partials/widget/chart/dount-chart2';
import DonutChart3 from '@/components/partials/widget/chart/dount-chart3';
import DountChart4 from '@/components/partials/widget/chart/dount-chart4';
import ImageBlock2 from '@/components/partials/widget/block/image-block-2';
import 'react-toastify/dist/ReactToastify.css';
import Button from '@/components/ui/Button';
import ComingSoonModal from '@/components/ComingSoonModal';
import Link from 'next/link';

const Fundraising = () => {
  const { user, companyProfile, loading } = useCompleteUserDetails();
  const [greeting, setGreeting] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning,');
    } else if (currentHour < 16) {
      setGreeting('Good afternoon,');
    } else {
      setGreeting('Good evening,');
    }
  }, []);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  const cardContent = (imgSrc, link) => (
    <Link href={link} className='block'>
      <img src={imgSrc} alt='' className='rounded w-full h-40 object-contain' />
    </Link>
  );

  return (
    <div className='flex min-h-screen bg-gray-50 relative'>
      <main className='flex-1 p-8'>
        <div className='flex justify-between items-center mb-8'>
          <button
            onClick={() => history.back()}
            className='absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded'
          >
            Back
          </button>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1 space-y-1'>
            <div className='h-32 lg:h-35'>
              <ImageBlock2 />
            </div>
            <div
              className='bg-no-repeat bg-cover bg-center px-5 py-8 rounded-[6px] relative flex items-center'
              style={{
                backgroundImage: `url(/assets/images/all-img/widget-bg-5.png)`,
              }}
            >
              <div className='flex-1'>
                <div className='max-w-[180px]'>
                  <h4 className='text-xl font-medium text-white mb-0'>
                    <span className='block text-sm text-white'>
                      <h6>
                        <b>{companyProfile?.company_name || 'Company Name'}</b>
                      </h6>
                    </span>
                    <span className='block text-sm'>Evaluation Report</span>
                  </h4>
                </div>
              </div>
              <div className='flex-none'>
                <Button
                  icon='heroicons-outline:eye'
                  text='View Report'
                  className='btn-light bg-white btn-sm '
                  onClick={handleImageClick}
                />
              </div>
            </div>
          </div>
          <div className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6'>
            <div className='h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg'>
              <h3 className='text-lg font-semibold mb-2 text-center'>
                Profile Completion
              </h3>
              <DonutChart3 />
            </div>
            <div className='h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg relative'>
              <h3 className='text-lg font-semibold mb-2 text-center text-black'>
                Investment Readiness Score
              </h3>
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-lg font-bold text-gray-700 z-10 mt-16'>
                  Coming Soon
                </span>
              </div>
              <div className='filter blur-sm z-0'>
                <DountChart />
              </div>
            </div>
            <div className='h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg'>
              <h3 className='text-lg font-semibold mb-2 text-center'>
                Equity Available with Founders
              </h3>
              <DountChart4 />
            </div>
          </div>
        </div>
        <br />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {cardContent(
            '/assets/images/tools/equity.png',
            '/tools/fundraising/equity'
          )}
          {cardContent(
            '/assets/images/tools/dept.png',
            '/tools/fundraising/debt'
          )}
          {cardContent('/assets/images/tools/m&a.png', '#')}
          {cardContent('/assets/images/tools/sale.png', '#')}
        </div>
        <div className='flex-1 p-8'>
          <div className='text-center'>
            <h1 className='flex text-2xl font-bold mb-6 justify-center'>
              Why Us?
            </h1>
            <div className='flex justify-center'>
              <img
                src='\assets\images\tools\whyus.png'
                alt='Why Us?'
                className='w-1/2 h-auto'
              />
            </div>
          </div>
        </div>
      </main>
      <ComingSoonModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Fundraising;
