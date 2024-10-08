import React from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import useDarkMode from "@/hooks/useDarkMode";
import Loading from '@/components/Loading';

const DonutChart2 = ({ height = 200, colors = ["#0CE7FA", "#E2F6FD"], InvestmentReadinessScore }) => {
  const [isDark] = useDarkMode();

  // Check if InvestmentReadinessScore is available
  if (InvestmentReadinessScore === null || InvestmentReadinessScore === undefined) {
      return <Loading />; // Show loading component while loading
  }

  // Chart series: the readiness score and the remaining percentage
  const series = [InvestmentReadinessScore, 100 - InvestmentReadinessScore];

  const options = {
    labels: ["Investment Readiness Score", ""],
    dataLabels: {
      enabled: false,
    },
    colors: [...colors],
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Outfit",
      fontWeight: 400,
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "40%",
          labels: {
            show: true,
            name: {
              show: false,
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "Inter",
            },
            value: {
              show: true,
              fontSize: "16px",
              fontFamily: "Outfit",
              color: isDark ? "#cbd5e1" : "#020617",
              formatter(val) {
                return `${parseInt(val)}`;
              },
            },
            total: {
              show: true,
              fontSize: "16px",
              label: "",
              formatter() {
                return `${InvestmentReadinessScore}`;
              },
            },
          },
        },
      },
    },
  };

  return (
    <div>
      <Chart options={options} series={series} type="donut" height={height} width="100%" />
    </div>
  );
};

export default DonutChart2;
