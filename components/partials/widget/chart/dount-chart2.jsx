import React from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import useDarkMode from "@/hooks/useDarkMode";

const DonutChart2 = (
  { height = 200, 
    colors = ["#0CE7FA", "#E2F6FD"],
    businessDetails

   }) => {
  const [isDark] = useDarkMode();

  // Calculate investment readiness score
  const currentTraction = businessDetails?.current_traction;
  const newCustomers = businessDetails?.new_Customers;
  const CAC = businessDetails?.customer_AcquisitionCost;
  const LTV = businessDetails?.customer_Lifetime_Value;

  const normalizedTraction = Math.min((currentTraction / 1000000) * 100, 100);
  const normalizedNewCustomers = Math.min((newCustomers / 5000) * 100, 100);
  const normalizedCAC = Math.min((1000 / CAC) * 100, 100);
  const normalizedLTV = Math.min((LTV / 1000) * 100, 100);

  const tractionScore = Math.round(
    (normalizedTraction * 0.4) +
    (normalizedNewCustomers * 0.2) +
    (normalizedCAC * 0.2) +
    (normalizedLTV * 0.2)
  );

  // Chart series: the readiness score and the remaining percentage
  const series = [tractionScore, 100 - tractionScore];

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
              color: isDark ? "#cbd5e1" : "#0f172a",
              formatter(val) {
                return `${parseInt(val)}`;
              },
            },
            total: {
              show: true,
              fontSize: "16px",
              label: "",
              formatter() {
                return `${tractionScore}`;
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