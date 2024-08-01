"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import useDarkMode from "@/hooks/useDarkMode";

const GroupChart5 = ({ height = 300 }) => {
  const [isDark] = useDarkMode();

  const series = [38, 24, 13, 13, 8]; // Percentage values
  const labels = ["Xiaomi", "Boat Lifestyle", "Noise", "Nothing", "Qubo"];

  const options = {
    chart: {
      type: 'donut',
    },
    labels: labels,
    legend: {
      position: 'bottom',
      labels: {
        colors: isDark ? "#CBD5E1" : "#475569",
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + "%";
        },
      },
    },
    colors: ['#1E3A8A', '#3B82F6', '#F59E0B', '#EF4444', '#10B981'],
    fill: {
      opacity: 1,
    },
  };

  return (
    <div className="w-full">
      <Chart options={options} series={series} type="donut" width="100%" height={height} />
    </div>
  );
};

export default GroupChart5;
