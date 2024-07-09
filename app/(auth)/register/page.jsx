'use client';

import React from 'react';
import Link from 'next/link';
import useDarkMode from '@/hooks/useDarkMode';
import RegForm1 from '@/components/partials/auth/reg-form1';
import Social from '@/components/partials/auth/social';
import Globe from '@/components/globe'; // Import the Globe component

const Register = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <div className='loginwrapper'>
        <div className='lg-inner-column'>
          <div
            className='left-column relative z-[1]'
            style={{ backgroundColor: 'black' }}
          >
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
          <div className='right-column relative bg-white dark:bg-slate-800'>
            <div className='inner-content h-full flex flex-col bg-white dark:bg-slate-800'>
              <div className='auth-box h-full flex flex-col justify-center'>
                {/* <div className='mobile-logo text-center mb-6 lg:hidden block'>
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
                </div> */}
                <div className='text-center 2xl:mb-10 mb-5'>
                  <h4 className='font-medium'>Sign up</h4>
                  <div className='text-slate-500 dark:text-slate-400 text-base mt-3'>
                    Create an account
                  </div>
                </div>
                <RegForm1 />

                <div className='max-w-[225px] mx-auto font-normal text-slate-500 dark:text-slate-400 2xl:mt-3 mt-3 uppercase text-sm'>
                  Already registered?
                  <Link
                    href='/'
                    className='text-slate-900 dark:text-white font-medium hover:underline'
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
