'use client';
import useStartupsRaw from '@/hooks/useStartupsRaw'; // Adjust the import path as needed
import useMatchingStartups from '@/hooks/useMatchingStartups';
import React from 'react';
import useStartups from '@/hooks/useStartups';
import useUserDetails from '@/hooks/useUserDetails';
const statisticsTemplate = [
  {
    title: 'Total Startups',
    count: '0', // Placeholder, will be dynamically updated
    bg: 'bg-warning-500',
    text: 'text-primary-500',
    percent: '10.00%',
    icon: 'heroicons:arrow-trending-up',
    img: '/assets/images/all-img/shade-1.png',
    percentClass: 'text-primary-500',
  },
  {
    title: 'Curated Startups',
    count: '0', // Placeholder, will be dynamically updated
    bg: 'bg-info-500',
    text: 'text-primary-500',
    percent: '7.50%',
    icon: 'heroicons:arrow-trending-up',
    img: '/assets/images/all-img/shade-2.png',
    percentClass: 'text-primary-500',
  },
  {
    title: 'Open Conversations',
    count: '0',
    bg: 'bg-success-500',
    text: 'text-primary-500',
    percent: '5.00%',
    icon: 'heroicons:arrow-trending-up',
    img: '/assets/images/all-img/shade-3.png',
    percentClass: 'text-primary-500',
  },
  {
    title: 'Closed Transactions',
    count: '0',
    bg: 'bg-danger-500',
    text: 'text-primary-500',
    percent: '2.50%',
    icon: 'heroicons:arrow-trending-up',
    img: '/assets/images/all-img/shade-4.png',
    percentClass: 'text-primary-500',
  },
];

const GroupChartNew3 = () => {
  const { startups, loading: startupsLoading, startupCount } = useStartupsRaw();
  const { matchingStartups, loading: matchingLoading } = useMatchingStartups();
  const { user, loading: userLoading } = useUserDetails();
  const { startupCount: curatedCount } = useStartups(user?.id);

  const statistics = statisticsTemplate.map((stat) => {
    if (stat.title === 'Total Startups') {
      return { ...stat, count: startupsLoading ? 'Loading...' : startupCount };
    }
    if (stat.title === 'Curated Startups') {
      return { ...stat, count: matchingLoading ? 'Loading...' : curatedCount };
    }
    return stat;
  });

  const isLoading = startupsLoading || matchingLoading || userLoading;

  return (
    <>
      {statistics.map((item, i) => (
        <div
          key={i}
          className={`${item.bg} rounded-md p-4 bg-opacity-[0.15] dark:bg-opacity-25 relative z-[1]`}
        >
          <div className='overlay absolute left-0 top-0 w-full h-full z-[-1]'>
            <img
              src={item.img}
              alt=''
              draggable='false'
              className='w-full h-full object-contain'
            />
          </div>
          <span className='block mb-6 text-sm text-slate-900 dark:text-white font-medium'>
            <h7>
              <b>{item.title}</b>
            </h7>
          </span>
          {isLoading ? (
            <div className='animate-pulse'>
              <div className='h-2 bg-[#C4C4C4] dark:bg-slate-500 rounded-full mb-6'></div>
            </div>
          ) : (
            <span className='block text-2xl text-slate-900 dark:text-white font-medium mb-6'>
              {item.count}
            </span>
          )}
        </div>
      ))}
    </>
  );
};

export default GroupChartNew3;
