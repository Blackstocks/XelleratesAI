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

  let founderPercentage = 0;
  let othersPercentage = 0;

  // Calculate the founder's percentage and the percentage for others
  capTable.forEach((entry) => {
    if (entry.designation?.toLowerCase() === 'founder') {
      founderPercentage += parseFloat(entry.percentage) || 0;
    } else {
      othersPercentage += parseFloat(entry.percentage) || 0;
    }
  });

  // Handle the case where the total percentage doesn't sum to 100%
  const remainingPercentage = 100 - (founderPercentage + othersPercentage);
  if (remainingPercentage > 0) {
    othersPercentage += remainingPercentage;
  }

  const series = [founderPercentage, othersPercentage];
  const labels = ['Founder', 'Others'];

  const options = {
    labels: labels,
    dataLabels: {
      enabled: false,
    },
    colors: ['#0CE7FA', '#E2F6FD'], // Colors for Founder and Others
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
              color: isDark ? '#cbd5e1' : '#020617',
              formatter(val) {
                return `${parseInt(val)}%`;
              },
            },
            total: {
              show: true,
              fontSize: '10px',
              label: 'Total',
              formatter() {
                return `${founderPercentage}%`;
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
