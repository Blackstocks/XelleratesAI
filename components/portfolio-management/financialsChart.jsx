import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import useDarkMode from '@/hooks/useDarkMode';
import { useEffect, useState } from 'react';

export const fetchFinancials = async ({ startupId, misFilePath }) => {
  try {
    if (!startupId || !misFilePath) {
      throw new Error('Startup ID or MIS file path is not available');
    }
    console.log("misfile: ", misFilePath);

    const mis = { mis: misFilePath };

    const response = await fetch('/api/apiDataExtractionStage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mis),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching financial data:', error.message);
    return null;
  }
};

const FinancialChart = ({ startupId, misFilePath }) => {
  const [isDark] = useDarkMode();
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const getFinancialData = async () => {
      setLoading(true); // Set loading to true before fetching data
      if (!misFilePath) {
        setLoading(false); // Set loading to false if misFilePath is not available
        return;
      }

      const data = await fetchFinancials({ startupId, misFilePath });
      setFinancialData(data);
      setLoading(false); // Set loading to false after data is fetched
    };

    if (startupId) {
      getFinancialData();
    } else {
      setLoading(false); // Set loading to false if startupId is not available
    }
  }, [startupId, misFilePath]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div>Loading...</div></div>;
  }

  if (!misFilePath) {
    return <div>No MIS file available for this stage.</div>;
  }

  if (!financialData) {
    return <div className="flex justify-center items-center h-full"><div>Error fetching financial data.</div></div>;
  }

  const { revenue, expense } = financialData;
  const categories = revenue.Yearly.map((item) => String(item.month));
  const revenueData = revenue.Yearly.map((item) => Number(item.value));
  const expenseData = expense.Yearly.map((item) => Number(item.value));

  const profitData = revenueData.map((revenue, index) => (revenue - expenseData[index] > 0 ? revenue - expenseData[index] : 0));
  const lossData = revenueData.map((revenue, index) => (revenue - expenseData[index] < 0 ? Math.abs(revenue - expenseData[index]) : 0));

  const hasProfit = profitData.some((value) => value > 0);
  const hasLoss = lossData.some((value) => value > 0);

  const series = [
    {
      name: 'Revenue',
      type: 'area',
      data: revenueData,
    },
    {
      name: 'Expense',
      type: 'line',
      data: expenseData,
    },
    ...(hasProfit ? [{
      name: 'Profit',
      type: 'column',
      data: profitData,
    }] : []),
    ...(hasLoss ? [{
      name: 'Loss',
      type: 'column',
      data: lossData,
    }] : []),
  ];

  const options = {
    chart: {
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: 'xy',
        autoScaleYaxis: true,
      },
    },
    stroke: {
      width: [2, 2, 2, 2],
      curve: 'smooth',
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
      },
    },
    fill: {
      opacity: [0.5, 1, 1, 1],
    },
    xaxis: {
      type: 'category',
      categories: categories,
      labels: {
        style: {
          colors: isDark ? '#CBD5E1' : '#475569',
          fontFamily: 'Inter',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        title: {
          text: 'Revenue & Expense',
        },
        labels: {
          style: {
            colors: '#000000',
            fontFamily: 'Inter',
          },
        },
      },
      {
        opposite: true,
        title: {
          text: 'Profit & Loss',
        },
        labels: {
          style: {
            colors: '#000000',
            fontFamily: 'Inter',
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y, { seriesIndex }) {
          return y ? y.toLocaleString() : y;
        },
      },
    },
    legend: {
      labels: {
        colors: ['#0077b6', '#FF5733', '#32CD32', '#FF0000'],
        useSeriesColors: false,
      },
    },
    grid: {
      show: true,
      borderColor: isDark ? '#334155' : '#e2e8f0',
      position: 'back',
    },
    colors: ['#0077b6', '#FF5733', '#32CD32', '#FF0000'],
  };

  return (
    <div className="p-2">
      <Chart options={options} series={series} type="line" height={350} width="100%" />
    </div>
  );
};

export default FinancialChart;
