import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import useDarkMode from '@/hooks/useDarkMode';
import useSidebar from '@/hooks/useSidebar';
import useSemiDark from '@/hooks/useSemiDark';
import useSkin from '@/hooks/useSkin';

const SidebarLogo = ({ menuHover }) => {
  const [isDark] = useDarkMode();
  const [collapsed, setMenuCollapsed] = useSidebar();
  // semi dark
  const [isSemiDark] = useSemiDark();
  // skin
  const [skin] = useSkin();
  return (
    <div
      className={` logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] py-6  px-4 
      ${menuHover ? 'logo-hovered' : ''}
      ${
        skin === 'bordered'
          ? ' border-b border-r-0 border-slate-200 dark:border-slate-700'
          : ' border-none'
      }
      
      `}
    >
      <Link href='/dashboard'>
        <div className='flex items-center space-x-4'>
          {collapsed && !menuHover ? (
            <img
              src={
                isDark
                  ? 'assets/images/logo/X (2).png'
                  : 'assets/images/logo/X (11).png'
              }
              alt=''
              style={{ margin: '0 auto', height: '3rem' }}
            />
          ) : (
            <img
              src={
                isDark
                  ? 'assets/images/logo/X (1).png'
                  : 'assets/images/logo/X (10).png'
              }
              alt=''
              style={{ height: '3.9rem' }}
            />
          )}
        </div>
      </Link>

      {(!collapsed || menuHover) && (
        <div
          className='cursor-pointer text-2xl font-bold'
          onClick={() => setMenuCollapsed(!collapsed)}
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
