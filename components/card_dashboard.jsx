import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

const Card_D = ({ title, text, isLocked, href }) => {
  return (
    <div className='relative group'>
      <div
        className={`relative bg-slate-50 dark:bg-slate-950 p-4 rounded text-center ${
          isLocked ? 'pointer-events-none' : ''
        }`}
      >
        <span
          className={`text-slate-600 dark:text-slate-300 font-semibold mb-4 block ${
            isLocked ? 'group-hover:blur-sm' : ''
          }`}
        >
          {title}
        </span>
        <Link
          href={href}
          className={`btn max-w-[10rem] mx-auto btn-secondary dark:bg-slate-1000 dark:hover:bg-slate-600 block w-full text-center btn-sm ${
            isLocked ? 'group-hover:blur-md' : ''
          }`}
        >
          {text}
        </Link>
      </div>
      {isLocked && (
        <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 pointer-events-auto z-10'>
          <Icon icon='heroicons:lock-closed-16-solid' />
          <span className=' font-bold'>Locked</span>
        </div>
      )}
    </div>
  );
};

export default Card_D;
