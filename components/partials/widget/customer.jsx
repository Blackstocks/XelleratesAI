import React from 'react';
import useHotDeals from '@/hooks/useHotDeals';

const Customer = ({ investorId }) => {
  const { hotDeals, loading, error } = useHotDeals(investorId);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error || 'An unexpected error occurred.'}</p>;

  return (
    <div className='pb-2 flex-col justify-center'>
      <h6 className='ml-6 mb-4 text-center'>Hot Deals</h6>
      <div className='grid md:grid-cols-3 grid-cols-1 gap-5'>
        {hotDeals.map((item, i) => {
          // Determine the border and fill color based on rank
          let borderColor = '';
          let fillColor = '#FFC155'; // Default gold color for 1st place

          if (item.rank === 1) {
            borderColor = 'ring-2 ring-[#FFC155]'; // Gold border for 1st place
          } else if (item.rank === 2) {
            borderColor = 'ring-2 ring-[#C0C0C0]'; // Silver border for 2nd place
            fillColor = '#C0C0C0'; // Silver fill color for 2nd place
          } else if (item.rank === 3) {
            borderColor = 'ring-2 ring-[#CD7F32]'; // Bronze border for 3rd place
            fillColor = '#CD7F32'; // Bronze fill color for 3rd place
          }

          return (
            <div
              key={i}
              className={`relative z-[1] text-center p-4 rounded before:w-full before:h-[calc(100%-60px)] before:absolute before:left-0 before:top-[60px] before:rounded before:z-[-1] before:bg-opacity-[0.1] ${
                item.bg || 'before:bg-info-500'
              }`}
            >
              <div
                className={`h-[70px] w-[70px] rounded-full mx-auto mb-4 relative ${borderColor}`}>
                {item.rank === 1 && (
                  <span className='crown absolute -top-[24px] left-1/2 -translate-x-1/2'>
                    <img src='/assets/images/icon/crown.svg' alt='Crown' />
                  </span>
                )}
                <img
                  src={item.company_logo || '/assets/images/default-logo.png'} // Fallback to default logo
                  alt={item.company_name || 'Company Logo'} // Fallback to 'Company Logo'
                  className='w-full h-full rounded-full object-cover'
                />
                <span
                  className='h-[27px] w-[27px] absolute right-0 bottom-0 rounded-full border border-white flex flex-col items-center justify-center text-white text-xs font-medium'
                  style={{ backgroundColor: fillColor }}
                >
                  {item.rank}
                </span>
              </div>

              <div className="grid grid-rows-3 flex flex-col items-center justify-center">
                <h4 className='row-span-2 text-sm text-slate-600 font-semibold mb-2'>
                  {item.company_name || 'Unnamed Company'}
                </h4>
                <div className='row-span-1 bg-slate-950 text-white px-[10px] py-[6px] text-xs font-medium rounded-full min-w-[60px]'>
                  {item.founder_name || 'Unknown Founder'}
                </div>
              </div>
            </div>
          );
        })}
        
      </div>
      <button
                className="bg-slate-950 text-white px-[10px] py-[6px] text-xs font-medium rounded-full w-full mt-4"
                onClick={() => window.location.href = "/tools/curated-dealflow"}
              >
                Connect
        </button>
    </div>
  );
};

export default Customer;
