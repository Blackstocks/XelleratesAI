'use client';

import React, { Fragment } from 'react';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import { Menu } from '@headlessui/react';
import Card from '@/components/ui/Card';
import useNotifications from '@/hooks/useNotifications';
import Loading from '@/components/Loading';

const NotificationPage = () => {
  const notifications = useNotifications();
  // console.log('notifications:', notifications);
  if (notifications.length === 0) return <Loading />;

  return (
    <div>
      <Card bodyClass='p-0'>
        <div className='flex justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-600'>
          <div className='text-sm text-slate-800 dark:text-slate-200 font-medium leading-6'>
            All Notifications
          </div>
        </div>
        <div className='divide-y divide-slate-100 dark:divide-slate-800'>
          <Menu as={Fragment}>
            {notifications?.map((item, i) => (
              <Menu.Item key={item.id}>
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
                        <div className='flex-none ltr:mr-3 rtl:ml-3'>
                          <div className='h-8 w-8 bg-white rounded-full'>
                            <img
                              src={item.image || '/default-image.png'}
                              alt='Notification'
                              className={`${
                                active ? ' border-white' : ' border-transparent'
                              } block w-full h-full object-contain rounded-full border`}
                            />
                          </div>
                        </div>
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
                            {new Date(item.created_at).toLocaleString()}
                          </div>
                        </div>
                        {item.notification_read_status === 'unread' && (
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
          </Menu>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPage;
