"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import useDarkMode from "@/hooks/useDarkMode";
import { colors } from "@/constant/data";

const StackBarChart = ({ height = 410 }) => {
  const [isDark] = useDarkMode();
  const series = [
    {
      name: "Previous rounds",
      data: [1400, 1200, 200, 100, 10, 10], // Your data here
    },
    {
      name: "Last Equity Round Funding",
      data: [200, 300, 100, 50, 10, 10], // Your data here
    },
  ];

  const options = {
    chart: {
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        endingShape: "rounded",
        barHeight: "55%",
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "12px",
      fontFamily: "Inter",
      offsetY: 0,
      markers: {
        width: 6,
        height: 6,
        offsetY: 0,
        offsetX: -5,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
      labels: {
        colors: isDark ? "#CBD5E1" : "#475569",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },
    xaxis: {
      categories: [
        "Xiaomi",
        "Meizu",
        "Nothing",
        "Boat Lifestyle",
        "MoLife",
        "Noise"
      ],
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      title: {
        text: "Total Equity Funding in Linear Scale",
        style: {
          fontSize: '12px',
          fontWeight: 'normal',
          fontFamily: "Inter",
          color: isDark ? "#CBD5E1" : "#475569"
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val + "M";
        },
      },
    },
    colors: ["#1E3A8A", "#3B82F6"],
    grid: {
      show: true,
      borderColor: isDark ? "#334155" : "#E2E8F0",
      strokeDashArray: 10,
      position: "back",
    },
  };

  return (
    <>
      <Chart options={options} series={series} type="bar" height={height} width="100%" />
    </>
  );
};

export default StackBarChart;
