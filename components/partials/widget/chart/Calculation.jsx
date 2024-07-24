"use client";
import { colors } from "@/constant/data";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import useDarkMode from "@/hooks/useDarkMode";

const Calculation = ({ height = 300 }) => {
  const [isDark] = useDarkMode();
  const series = [44, 55, 30];

  const options = {
    labels: ["70% Sent", "18% Opened", "12% Rejected"],
    dataLabels: {
      enabled: true,
    },
    colors: [colors.success, colors.warning, "#A3A1FB"],
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
      <Chart options={options} series={series} type="pie" height={height} width="100%" />
    </>
  );
};

export default Calculation;
