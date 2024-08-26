'use client';
import useDarkMode from '@/hooks/useDarkMode';
import UpdatePassword from '@/components/partials/auth/update-password';
import Image from 'next/image';
import Link from 'next/link';

// image import

const UpdatePasswordPage = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <div className='loginwrapper'>
        <div className='lg-inner-column'>
          <div className='left-column relative z-[1]'>
            <div className='max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20'>
              <Link href='/'>
                <Image
                  src={
                    isDark
                      ? '/assets/images/logo/xlogo-white-removebg-preview.png'
                      : '/assets/images/logo/xlogo-white-removebg-preview.png'
                  }
                  alt=''
                  className='mb-10'
                  width={240} // 15rem converted to pixels
                  height={100}
                />
              </Link>
            </div>
            {/* <div className='absolute left-0 2xl:bottom-[-160px] bottom-[-130px] h-full w-full z-[-1]'>
              <img
                src='/assets/images/auth/ils1.svg'
                alt=''
                className='h-full w-full object-contain'
              />
            </div> */}
          </div>
          <div className='right-column relative'>
            <div className='inner-content h-full flex flex-col bg-white dark:bg-slate-900'>
              <div className='auth-box h-full flex flex-col justify-center'>
                <div className='mobile-logo text-center mb-6 lg:hidden block'>
                  <Link href='/'>
                    <Image
                      src={
                        isDark
                          ? '/assets/images/logo/xlogo-white-removebg-preview.png'
                          : '/assets/images/logo/xlogo-white-removebg-preview.png'
                      }
                      alt=''
                      className='mx-auto'
                      width={100}
                      height={100}
                    />
                  </Link>
                </div>
                <div className='text-center 2xl:mb-10 mb-4'>
                  <div className='text-slate-500 text-base'>
                    Reset your Password
                  </div>
                </div>
                <UpdatePassword />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatePasswordPage;
