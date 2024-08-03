import React from 'react';
import dynamic from 'next/dynamic';
import useCompletionPercentage from '@/hooks/useCompletionPercentage';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import useDarkMode from '@/hooks/useDarkMode';
import Loading from '@/components/Loading'; // Assume you have a Loading component

const DonutChart3 = ({ height = 200, colors = ['#0CE7FA', '#E2F6FD'] }) => {
  const [isDark] = useDarkMode();
  const { completionPercentage, loading } = useCompletionPercentage();

  if (loading) {
    return <Loading />; // Show loading component while loading
  }

  const series = [completionPercentage, 100 - completionPercentage];

  const options = {
    labels: ['Complete', 'Left'],
    dataLabels: {
      enabled: false,
    },
    colors: [...colors],
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
                return `${completionPercentage}%`;
              },
            },
          },
        },
      },
    },
  };

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type='donut'
        height={height}
        width='100%'
      />
    </div>
  );
};

export default DonutChart3;
