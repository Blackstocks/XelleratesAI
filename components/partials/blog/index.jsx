import React from 'react';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
const Bloglabel = () => {
  return (
    <>
      <span className='relative lg:h-[32px] font-black lg:w-[32px] lg:bg-slate-100 text-slate-900 lg:dark:bg-slate-900 dark:text-white cursor-pointer rounded-full text-[20px] flex flex-col items-center justify-center'>
        <Link href='/blog'>
          <Icon icon='heroicons:document-text' />
          <span className='absolute lg:right-0 font-black lg:top-0 -top-2 -right-2 h-4 w-4 text-[8px]  flex flex-col items-center text-lg justify-center rounded-full z-[99]'>
            <Icon icon='heroicons:pencil' />
          </span>
        </Link>
      </span>
    </>
  );
};

export default Bloglabel;
