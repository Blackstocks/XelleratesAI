'use client';

import React, { useEffect, useState } from 'react';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/components/Loading';
import { supabase } from '@/lib/supabaseclient';
import ComingSoonModal from '@/components/ComingSoonModal';
import Link from 'next/link';

const Tools = () => {
  const { user, details, loading } = useUserDetails();
  const [companyName, setCompanyName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', user?.id)
          .single();

        if (error) {
          console.error('Error fetching company name:', error);
        } else {
          setCompanyName(data.company_name);
        }
      }
    };

    fetchCompanyName();
  }, [user]);

  const handleLinkClick = (e, link) => {
    if (link === '#') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  const cardContent = (title, imgSrc, link) => (
    <Link
      href={link}
      onClick={(e) => handleLinkClick(e, link)}
      className='relative z-[1] transform transition-transform duration-500'
    >
      <img
        src={imgSrc}
        alt={title}
        className='rounded-2xl w-full'
        onClick={
          imgSrc === '/assets/images/tools/1.png' ? handleImageClick : undefined
        }
      />
    </Link>
  );

  const cardContentWithDarkMode = (
    title,
    imgSrc,
    darkImgSrc,
    logoSrc,
    logoAlt
  ) => (
    <div className='relative z-[1] transform transition-transform duration-500'>
      <img
        src={imgSrc}
        alt={title}
        className='rounded-2xl w-full block dark:hidden'
      />
      <img
        src={darkImgSrc}
        alt={title}
        className='rounded-2xl w-full hidden dark:block'
      />
      {logoSrc && (
        <img
          src={logoSrc}
          alt={logoAlt}
          className='absolute inset-0 h-12 w-12 animate-zoom'
          style={{
            top: '15%',
            left: '54%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );

  const additionalCards = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
      {cardContentWithDarkMode(
        'Few steps away from completing your profile',
        '/assets/images/tools/uppers4.png',
        '/assets/images/tools/supperl1.png'
      )}
      {cardContentWithDarkMode(
        'Connect with investors in a single click',
        '/assets/images/tools/uppers2.png',
        '/assets/images/tools/supperl3.png',
        '/assets/images/tools/customer.png',
        'Customer Care'
      )}
      {cardContentWithDarkMode(
        'Free consultation with an Investment Banker',
        '/assets/images/tools/uppers1.png',
        '/assets/images/tools/supperl2.png',
        '/assets/images/tools/clickr.png',
        'Click'
      )}
      {cardContentWithDarkMode(
        'Wallet Balance',
        '/assets/images/tools/uppers3.png',
        '/assets/images/tools/supperl4.png',
        '/assets/images/tools/walletr.png',
        'Wallet'
      )}
    </div>
  );

  const additionalCards2 = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
      {cardContentWithDarkMode(
        'Get free consultation with an Investment Banker',
        '/assets/images/tools/upper1.png',
        '/assets/images/tools/upperl4.png',
        '/assets/images/tools/walletr.png',
        'Wallet'
      )}
      {cardContentWithDarkMode(
        'Raise funds for your portfolio startup(s)',
        '/assets/images/tools/upper2.png',
        '/assets/images/tools/upperl2.png',
        '/assets/images/tools/clickr.png',
        'Click'
      )}
      {cardContentWithDarkMode(
        'Explore exit opportunities',
        '/assets/images/tools/upper3.png',
        '/assets/images/tools/upperl3.png',
        '/assets/images/tools/stock.png',
        'Stock'
      )}
      {cardContentWithDarkMode(
        'Invest in upcoming IPOs',
        '/assets/images/tools/upper4.png',
        '/assets/images/tools/upperl1.png',
        '/assets/images/tools/customer.png',
        'Customer Care'
      )}
    </div>
  );

  return (
    <div className='w-full relative'>
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-40'></div>
      )}
      <div className='w-full'>
        <div className='container px-4 mx-auto'>
          {user?.user_type === 'startup' && additionalCards()}
        </div>
        {user?.user_type === 'startup' && (
          <div className='w-full'>
            <section className='py-8 w-full'>
              <div className='container px-4 mx-auto'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {cardContent(
                    'Investment Readiness',
                    '/assets/images/tools/1.png',
                    '#'
                  )}
                  {cardContent(
                    'DIY Pitch Deck',
                    '/assets/images/tools/2.png',
                    '#'
                  )}
                  {cardContent(
                    'Financial Insights',
                    '/assets/images/tools/3.png',
                    '#'
                  )}
                  {cardContent(
                    'Fundraising',
                    '/assets/images/tools/4.png',
                    '/tools/fundraising'
                  )}
                  {cardContent(
                    'Legal Help Desk',
                    '/assets/images/tools/5.png',
                    '#'
                  )}
                  {cardContent(
                    'Connect with Incubators',
                    '/assets/images/tools/6.png',
                    '/tools/incubators'
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
        <div className='container px-4 mx-auto'>
          {user?.user_type === 'investor' && additionalCards2()}
        </div>
        {user?.user_type === 'investor' && (
          <div className='w-full'>
            <section className='py-8 w-full'>
              <div className='container px-4 mx-auto'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {cardContent(
                    'Curated Dealflow',
                    '/assets/images/tools/11.png',
                    '/tools/global-dealflow'
                  )}
                  {cardContent(
                    'Document Management',
                    '/assets/images/tools/12.png',
                    '/tools/document-management'
                  )}
                  {cardContent('Syndicate', '/assets/images/tools/13.png', '#')}
                  {cardContent(
                    'Portfolio Management',
                    '/assets/images/tools/15.png',
                    '/tools/portfolio-management'
                  )}
                  {cardContent(
                    'Valuate a Startup',
                    '/assets/images/tools/16.png',
                    '#'
                  )}
                  {cardContent(
                    'Post Term Sheet',
                    '/assets/images/tools/17.png',
                    '#'
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
      {isModalOpen && (
        <ComingSoonModal isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
      <style jsx>{`
        a {
          perspective: 1000px;
          display: block;
        }
        a:hover img {
          transform: rotateY(10deg) translateY(-10px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        @keyframes zoom {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-zoom {
          animation: zoom 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Tools;
