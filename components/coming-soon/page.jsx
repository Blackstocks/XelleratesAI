'use client';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import useDarkMode from '@/hooks/useDarkMode';

const ComingSoonPage = () => {
  const [isDark] = useDarkMode();
  return (
    <div className=''>
      <div className='container mt-20'>
        <div className='flex md:justify-between justify-center flex-wrap items-center'>
          <div className='md:max-w-[500px] space-y-4'>
            <div className='relative flex space-x-3 items-center text-2xl text-slate-900 dark:text-white'>
              <span className='inline-block w-[25px] bg-secondary-500 h-[1px]'></span>
              <span>Coming soon</span>
            </div>
            <div className='xl:text-[70px] xl:leading-[70px] text-4xl font-semibold text-slate-900 dark:text-white'>
              Get notified when we launch
            </div>
            <div className='bg-white flex items-center px-3 rounded'>
              <input
                type='text'
                placeholder='Enter your email'
                className='flex-1 bg-transparent h-full block w-full py-6 placeholder:text-secondary-500 text-base focus:outline-none focus:ring-0'
              />
              <div className='flex-none'>
                <button type='button' className='btn btn-dark btn-sm px-6'>
                  Notify me
                </button>
              </div>
            </div>
            <div className='text-sm text-slate-500 dark:text-slate-400'>
              *Don’t worry we will not spam you :
            </div>
          </div>
          <div>
            <img src='/assets/images/svg/img-1.svg' alt='' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
