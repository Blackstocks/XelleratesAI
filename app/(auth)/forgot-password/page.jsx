'use client';

import React from 'react';
import Link from 'next/link';
import ForgotPass from '@/components/partials/auth/forgot-pass';
import useDarkMode from '@/hooks/useDarkMode';
import Globe from '@/components/globe'; 

const ForgotPassPage = () => {
  const [isDark] = useDarkMode();
  return (
    <div className='loginwrapper'>
      <div className='lg-inner-column'>
      <div className='left-column relative z-[1]' style={{ backgroundColor: 'black' }}>
            <div className='absolute left-0 2xl:bottom-[-10px] bottom-[-10px] h-full w-full z-[-1]'>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  height: '10vh',
                }}
              >
                <img
                  src='assets/images/logo/X.gif'
                  alt='Logo'
                  style={{
                    height: '300px', // increased height
                    width: '350px', // increased width
                    objectFit: 'contain',
                    marginTop: '25vh',
                  }}
                />
              </div>

              <div>
                <Globe /> {/* Replace the GIF with the Globe component */}
              </div>
            </div>
        </div>
        <div className='right-column relative'>
          <div className='inner-content h-full flex flex-col bg-white dark:bg-slate-800'>
            <div className='auth-box2 flex flex-col justify-center h-full'>
              <div className='mobile-logo text-center mb-6 lg:hidden block'>
                <Link href='/'>
                  <img
                    src={
                      isDark
                        ? '/assets/images/logo/logo-white.svg'
                        : '/assets/images/logo/logo.svg'
                    }
                    alt=''
                    className='mx-auto'
                  />
                </Link>
              </div>
              <div className='text-center 2xl:mb-10 mb-5'>
                <h4 className='font-medium mb-4'>Forgot Your Password?</h4>
                <div className='text-slate-500 dark:text-slate-400 text-base'>
                  Reset Password with Dashcode.
                </div>
              </div>
              <div className='font-normal text-base text-slate-500 dark:text-slate-400 text-center px-2 bg-slate-100 dark:bg-slate-600 rounded py-3 mb-4 mt-10'>
                Enter your Email and instructions will be sent to you!
              </div>

              <ForgotPass />
              <div className='md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 2xl:mt-12 mt-8 uppercase text-sm'>
                Forget It,
                <Link
                  href='/'
                  className='text-slate-900 dark:text-white font-medium hover:underline'
                >
                  Send me Back
                </Link>
                to The Sign In
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassPage;
