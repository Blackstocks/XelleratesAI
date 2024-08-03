'use client';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import useDarkMode from '@/hooks/useDarkMode';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const Calculation = ({ height = 200 }) => {
  const [isDark] = useDarkMode();
  const { fundingInformation } = useCompleteUserDetails();

  // Extract the first entry's percentage and role from fundingInformation.cap_table
  const capTable = fundingInformation?.cap_table || [];
  const firstEntry = capTable[0] || { percentage: 0, role: 'No Data' };
  const series = [parseFloat(firstEntry.percentage), 100 - parseFloat(firstEntry.percentage)];
  const labels = [firstEntry.role, 'Remaining'];

  const options = {
    labels: labels,
    dataLabels: {
      enabled: false,
    },
    colors: ['#0CE7FA', '#E2F6FD'], // Blue and white
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'Outfit',
      fontWeight: 400,
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '40%',
          labels: {
            show: true,
            name: {
              show: false,
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Inter',
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Outfit',
              color: isDark ? '#cbd5e1' : '#0f172a',
              formatter(val) {
                return `${parseInt(val)}%`;
              },
            },
            total: {
              show: true,
              fontSize: '10px',
              label: '',
              formatter() {
                return `${firstEntry.percentage}%`;
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            show: false,
          },
        },
      },
    ],
  };

  return (
    <>
      {capTable.length > 0 ? (
        <Chart
          options={options}
          series={series}
          type='donut'
          height={height}
          width='100%'
        />
      ) : (
        <div className='text-center text-gray-600'>
          Please enter the cap table details in the profile.
        </div>
      )}
    </>
  );
};

export default Calculation;
