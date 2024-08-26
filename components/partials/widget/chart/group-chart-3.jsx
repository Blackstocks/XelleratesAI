'use client';
import useInvestorCounts from '@/hooks/useInvestorCounts'; // Adjust the path based on your project structure
import useScheduledMeetingCount from '@/hooks/useScheduledMeetingCount'; // Adjust the path based on your project structure

const GroupChart3 = ({ startupId, userId }) => {
  // console.log('startupId', startupId);
  // console.log('userId', userId);
  const { investorCount, assignedInvestorCount, loading } = useInvestorCounts(
    startupId,
    userId
  );
  // console.log('assignedInvestorCount', assignedInvestorCount);
  const { scheduledMeetingCount, loading: meetingLoading } =
    useScheduledMeetingCount(startupId);

  const statistics = [
    {
      title: 'Available Investors',
      count: loading ? 'Loading...' : investorCount.toString(),
      img: '/assets/images/dashboard/sdash1.svg',
    },
    {
      title: 'Reach Out',
      count: loading ? 'Loading...' : assignedInvestorCount.toString(),
      img: '/assets/images/dashboard/sdash2.svg',
    },
    {
      title: 'Scheduled Meetings',
      count: meetingLoading ? 'Loading...' : scheduledMeetingCount.toString(), // New scheduled meetings count
      img: '/assets/images/dashboard/sdash3.svg',
    },
  ];

  return (
    <div className='flex flex-col lg:flex-row gap-4'>
      {statistics.map((item, i) => (
        <div key={i} className='relative w-full h-32 flex-shrink-0 m-auto rounded-md'>
          <img
            src={item.img}
            alt={item.title}
            draggable='false'
            className='w-full h-full object-contain rounded-md'
          />
          <div className='absolute inset-0 flex items-center justify-center ml-2'>
            <div className='bg-white dark:bg-slate-950 rounded-full h-10 w-10 flex items-center justify-center ml-12'>
              <span className='text-xl text-slate-900 dark:text-white font-medium'>
                {item.count}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupChart3;
