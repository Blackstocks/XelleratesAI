import React from 'react';
import useHotDeals from '@/hooks/useHotDeals';
import ProgressBar from '@/components/ui/ProgressBar';

const Customer = () => {
  const { hotDeals, loading, error } = useHotDeals();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='pb-2'>
      <div className='grid md:grid-cols-3 grid-cols-1 gap-5'>
        {hotDeals.map((item, i) => (
          <div
            key={i}
            className={`relative z-[1] text-center p-6 rounded before:w-full before:h-[calc(100%-60px)] before:absolute before:left-0 before:top-[60px] before:rounded before:z-[-1] before:bg-opacity-[0.1] ${
              item.bg || 'before:bg-info-500'
            }`}
          >
            <div
              className={`${
                item.rank === 1 ? 'ring-2 ring-[#FFC155]' : ''
              } h-[70px] w-[70px] rounded-full mx-auto mb-4 relative`}
            >
              {item.rank === 1 && (
                <span className='crown absolute -top-[24px] left-1/2 -translate-x-1/2'>
                  <img src='/assets/images/icon/crown.svg' alt='Crown' />
                </span>
              )}
              <img
                src={item.companyLogo} // Assuming companyLogo is fetched
                alt={item.name} // Assuming name is fetched
                className='w-full h-full rounded-full'
              />
              <span className='h-[27px] w-[27px] absolute right-0 bottom-0 rounded-full bg-[#FFC155] border border-white flex flex-col items-center justify-center text-white text-xs font-medium'>
                {item.rank}
              </span>
            </div>
            <h4 className='text-sm text-slate-600 font-semibold mb-4'>
              {item.companyName} {/* Ass70png founderName is fetched */}
            </h4>
            <div className='flex justify-center bg-slate-900 text-white px-[10px] py-[6px] text-xs font-medium rounded-full min-w-[60px] mt-2 '>
              {item.founderName}
            </div>

            <div>
              {/* <div className='flex justify-between text-sm font-normal dark:text-slate-300 mb-3 mt-4'>
                <span>Progress</span>
                <span className='font-normal'>{item.value || 0}%</span>
              </div> */}
              {/* <ProgressBar
                value={item.value || 0}
                className={item.barColor || 'bg-info-500'}
              /> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customer;
