'use client';

import React, { Fragment } from 'react';
import useDarkMode from '@/hooks/useDarkMode';
import Link from 'next/link';
import useWidth from '@/hooks/useWidth';

const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link href='/dashboard'>
        <React.Fragment>
          {width >= breakpoints.xl ? (
            <img
              src={
                isDark
                  ? 'assets/images/logo/X (1).png'
                  : 'assets/images/logo/X (8).png'
              }
              alt=''
              style={{ margin: '0 auto', height: '3em' }}
            />
          ) : (
            <img
              src={
                isDark
                  ? 'assets/images/logo/X (1).png'
                  : 'assets/images/logo/X (8).png'
              }
              alt=''
              style={{ margin: '0 auto', height: '3em' }}
            />
          )}
        </React.Fragment>
      </Link>
    </div>
  );
};

export default Logo;
