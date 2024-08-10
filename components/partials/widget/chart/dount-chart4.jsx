'use client';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import useDarkMode from '@/hooks/useDarkMode';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const Calculation = ({ height = 200 }) => {
  const [isDark] = useDarkMode();
  const { fundingInformation } = useCompleteUserDetails();

  // Extract the cap_table from fundingInformation
  const capTable = fundingInformation?.cap_table || [];

  // Prepare the data for the pie chart
  const series = capTable.map((entry) => parseFloat(entry.percentage) || 0);
  const labels = capTable.map(
    (entry) => entry.designation || 'No Designation Specified'
  );

  // Handle the case where there might be leftover percentage
  const totalPercentage = series.reduce((total, num) => total + num, 0);
  if (totalPercentage < 100) {
    series.push(100 - totalPercentage);
    labels.push('Remaining');
  }

  const options = {
    labels: labels,
    dataLabels: {
      enabled: false,
    },
    colors: ['#0CE7FA', '#E2F6FD', '#FFD700', '#FF6347'], // Array of colors for different slices
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
              label: 'Total',
              formatter() {
                return `${totalPercentage}%`;
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
