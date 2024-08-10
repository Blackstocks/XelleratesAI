'use client';
import useStartups from '@/hooks/useStartups'; // Adjust the import path as needed
import useMatchingStartups from '@/hooks/useMatchingStartups';

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
  const { startups, loading: startupsLoading, startupCount } = useStartups();
  const {
    matchingStartups,
    loading: matchingLoading,
    count: curatedCount,
  } = useMatchingStartups();

  // console.log('Loading state:', startupsLoading); // Log loading state
  // console.log('Startup count:', startupCount); // Log startup count
  // console.log('Startups data:', startups); // Log startups data

  const statistics = statisticsTemplate.map((stat) => {
    if (stat.title === 'Total Startups') {
      return { ...stat, count: startupsLoading ? 'Loading...' : startupCount };
    }
    if (stat.title === 'Curated Startups') {
      // console.log('Curated startups count:', curatedCount); // Log curated startups count
      return { ...stat, count: matchingLoading ? 'Loading...' : curatedCount };
    }
    return stat;
  });

  // console.log(
  //   'Statistics with updated total startups and curated startups:',
  //   statistics
  // ); // Log updated statistics

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
          <span className='block text-2xl text-slate-900 dark:text-white font-medium mb-6'>
            {item.count}
          </span>
        </div>
      ))}
    </>
  );
};

export default GroupChartNew3;
