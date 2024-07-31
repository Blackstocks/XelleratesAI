import React from 'react';
import Dropdown from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import { Menu } from '@headlessui/react';
import useNotifications from '@/hooks/useNotifications';

const notifyLabel = (unreadCount) => {
  return (
    <span className='relative lg:h-[32px] lg:w-[32px] lg:bg-slate-100 text-slate-900 lg:dark:bg-slate-900 dark:text-white cursor-pointer rounded-full text-[20px] flex flex-col items-center justify-center'>
      <Icon icon='heroicons-outline:bell' className='animate-tada' />
      {unreadCount > 0 && (
        <span className='absolute lg:right-0 lg:top-0 -top-2 -right-2 h-4 w-4 bg-red-500 text-[8px] font-semibold flex flex-col items-center justify-center rounded-full text-white z-[99]'>
          {unreadCount}
        </span>
      )}
    </span>
  );
};

const Notification = () => {
  const notifications = useNotifications();

  const unreadCount = notifications.filter(
    (notif) => notif.notification_read_status === 'unread'
  ).length;

  return (
    <Dropdown
      classMenuItems='md:w-[300px] top-[58px]'
      label={notifyLabel(unreadCount)}
    >
      <div className='flex justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-600'>
        <div className='text-sm text-slate-800 dark:text-slate-200 font-medium leading-6'>
          Notifications
        </div>
        <div className='text-slate-800 dark:text-slate-200 text-xs md:text-right'>
          <Link href='/notifications' className='underline'>
            View all
          </Link>
        </div>
      </div>
      <div className='divide-y divide-slate-100 dark:divide-slate-800'>
        {notifications.map((item, i) => (
          <Menu.Item key={i}>
            {({ active }) => (
              <Link href={`/notifications/${item.id}`} passHref>
                <div
                  className={`${
                    active
                      ? 'bg-slate-100 dark:bg-slate-700 dark:bg-opacity-70 text-slate-800'
                      : 'text-slate-600 dark:text-slate-300'
                  } block w-full px-4 py-2 text-sm cursor-pointer`}
                >
                  <div className='flex ltr:text-left rtl:text-right'>
                    <div className='flex-1'>
                      <div
                        className={`${
                          active
                            ? 'text-slate-600 dark:text-slate-300'
                            : ' text-slate-600 dark:text-slate-300'
                        } text-sm`}
                      >
                        {item.notification_type}
                      </div>
                      <div
                        className={`${
                          active
                            ? 'text-slate-500 dark:text-slate-200'
                            : ' text-slate-600 dark:text-slate-300'
                        } text-xs leading-4`}
                      >
                        {item.notification_message}
                      </div>
                      <div className='text-slate-400 dark:text-slate-400 text-xs mt-1'>
                        {new Date(item.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    {item.notification_status === 'unread' && (
                      <div className='flex-0'>
                        <span className='h-[10px] w-[10px] bg-danger-500 border border-white dark:border-slate-400 rounded-full inline-block'></span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )}
          </Menu.Item>
        ))}
      </div>
    </Dropdown>
  );
};

export default Notification;
