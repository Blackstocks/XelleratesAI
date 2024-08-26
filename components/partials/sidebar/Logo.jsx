import React, { useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import useDarkMode from '@/hooks/useDarkMode';
import useSidebar from '@/hooks/useSidebar';
import useSemiDark from '@/hooks/useSemiDark';
import useSkin from '@/hooks/useSkin';
import Image from 'next/image';

const SidebarLogo = ({ menuHover }) => {
  const [isDark] = useDarkMode();
  const [collapsed, setMenuCollapsed] = useSidebar();
  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();
  return (
    <div
      className={`logo-segment flex justify-between items-center bg-white dark:bg-slate-900 z-[9] py-6 px-4 
      ${menuHover ? 'logo-hovered' : ''}
      ${
        skin === 'bordered'
          ? ' border-b border-r-0 border-slate-200 dark:border-slate-700'
          : 'border-none'
      }
      `}
    >
      <Link href='/dashboard'>
        <div className='flex items-center space-x-4'>
          {collapsed && !menuHover ? (
            <Image
              src={
                isDark
                  ? '/assets/images/logo/X (2).png'
                  : '/assets/images/logo/X (11).png'
              }
              alt='Logo'
              width={100}
              height={48}
              style={{ margin: '0 auto' }}
            />
          ) : (
            <Image
              src={
                isDark
                  ? '/assets/images/logo/X (1).png'
                  : '/assets/images/logo/xelleratesSidebar.png'
              }
              alt='Sidebar Logo'
              width={120}
              height={60}
            />
          )}
        </div>
      </Link>

      {(!collapsed || menuHover) && (
        <div
          className='cursor-pointer text-2xl font-bold'
          onClick={() => {
            setMenuCollapsed(!collapsed);
          }}
        >
          {!collapsed ? (
            <Icon icon='heroicons:arrow-left-end-on-rectangle' />
          ) : (
            <Icon icon='heroicons:arrow-right-end-on-rectangle' />
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarLogo;
