'use client';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import useDarkMode from '@/hooks/useDarkMode';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const Calculation = ({ height = 300 }) => {
  const [isDark] = useDarkMode();
  const { fundingInformation } = useCompleteUserDetails();
  // console.log('fundinginfo', fundingInformation);

  // Extract series and labels from fundingInformation.cap_table
  const capTable = fundingInformation?.cap_table || [];

  // Prepare the data for the pie chart
  const series = capTable.map((item) => parseFloat(item.percentage));
  const labels = capTable.map((item) => item.designation || 'No Designation');

  // Calculate total percentage
  const totalPercentage = series.reduce((total, num) => total + num, 0);

  // If total percentage is less than 100%, add the "Others" category
  if (totalPercentage < 100) {
    series.push(100 - totalPercentage);
    labels.push('Others');
  }

  const options = {
    labels: labels,
    dataLabels: {
      enabled: true,
    },
    colors: [
      '#FF5722', // Deep Orange
      '#FFEB3B', // Yellow (for emphasis)
      '#CDDC39', // Lime
      '#009688', // Teal
      '#34A853', // Green (lighter green for a prominent share)

      '#FF9800', // Orange

      '#673AB7', // Deep Purple
      '#2196F3', // Blue
      '#FFC107', // Amber

      '#00BCD4', // Cyan
      '#607D8B', // Blue Grey for "Others"
    ],
    legend: {
      show: false, // Hide the legend
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            show: false, // Hide the legend on small screens as well
          },
        },
      },
    ],
  };

  return (
    <>
      {capTable?.length > 0 ? (
        <Chart
          options={options}
          series={series}
          type='pie'
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
