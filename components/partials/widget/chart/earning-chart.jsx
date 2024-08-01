import React from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import useDarkMode from "@/hooks/useDarkMode";

const EarningChart = ({
  className = "bg-slate-50 dark:bg-slate-900 rounded py-3 px-4 md:col-span-2",
}) => {
  const [isDark] = useDarkMode();

  const series = [
    {
      name: "Earnings",
      data: [8.7, 49.5, 86.5, 69.4, -124.6],
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        endingShape: "flat",
        colors: {
          ranges: [
            {
              from: -Infinity,
              to: 0,
              color: "#FF0000", // Red color for loss
            },
            {
              from: 0.01,
              to: Infinity,
              color: "#00FF00", // Green color for profit
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}Cr`,
      style: {
        colors: isDark ? ["#CBD5E1"] : ["#475569"],
      },
    },
    xaxis: {
      categories: [
        "FY 18-19",
        "FY 19-20",
        "FY 20-21",
        "FY 21-22",
        "FY 22-23",
      ],
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
        },
      },
      title: {
        text: "Amount in INR (Cr)",
        style: {
          color: isDark ? "#CBD5E1" : "#475569",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Cr`,
      },
    },
    grid: {
      borderColor: isDark ? "#334155" : "#E2E8F0",
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className={` ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <b>Amount in INR (Cr)</b>
        </div>
      </div>
      <Chart
        type="bar"
        height="350"
        options={options}
        series={series}
      />
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <b>CAGR (5 Years) = 100%</b>
        </div>
        <div className="text-red-500">▼</div>
      </div>
    </div>
  );
};

export default EarningChart;
