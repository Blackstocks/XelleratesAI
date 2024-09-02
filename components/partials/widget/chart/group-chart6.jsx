"use client";
import React, { useEffect, useState } from "react";
import { colors } from "@/constant/data";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseclient";
import useUserDetails from "@/hooks/useUserDetails";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const columnChartTemplate = {
  series: [
    {
      name: "Revenue",
      data: [40, 70, 45, 100, 75, 40, 80, 90],
    },
  ],
  options: {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        columnWidth: "60px",
        barHeight: "100%",
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val + "k";
        },
      },
    },
    xaxis: { show: false },
    grid: { show: false },
  },
};

// Adjust colors for each chart according to the original template
const columnCharthome2 = {
  ...columnChartTemplate,
  colors: ["#FF9838"], // Light Orange
};

const columnCharthome3 = {
  ...columnChartTemplate,
  colors: ["#1EABEC"], // Light Blue
};

const columnCharthome4 = {
  ...columnChartTemplate,
  colors: ["#5743BE"], // Light Purple
};

const GroupChart6 = () => {
  const { user } = useUserDetails();
  const [creditBalance, setCreditBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletCredits = async () => {
      if (user && user.id) {
        const { data, error } = await supabase
          .from("wallet_credits")
          .select("credit_balance, referral_balance")
          .eq("startup_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching wallet credits:", error.message);
        } else if (data) {
          setCreditBalance(data.credit_balance || 0); // Set to 0 if undefined
          setReferralEarnings(data.referral_balance || 0); // Set to 0 if undefined
        }
      }
      setLoading(false);
    };

    fetchWalletCredits();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching
  }

  const statistics = [
    {
      name: columnCharthome3,
      title: "Credits Available",
      count: creditBalance, // Display 0 if no data
      bg: "bg-[#E5F9FF] dark:bg-slate-950",
      text: "text-info-500",
      icon: "heroicons:shopping-cart",
    },
    {
      name: columnCharthome2,
      title: "Cashback",
      count: "0", // Static cashback
      bg: "bg-[#FFF3E0] dark:bg-slate-950",
      text: "text-warning-500",
      icon: "heroicons:cube",
    },
    {
      name: columnCharthome4,
      title: "Referral Earning",
      count: referralEarnings, // Display 0 if no data
      bg: "bg-[#E6FFED] dark:bg-slate-950",
      text: "text-[#5743BE]",
      icon: "heroicons:arrow-trending-up-solid",
    },
  ];

  return (
    <>
      {statistics.map((item, i) => (
        <div
          className={`rounded p-4 ${item.bg}`}
          key={i}
        >
          <div className="text-slate-600 dark:text-slate-400 text-sm mb-1 font-medium">
            <h6>
              <b>{item.title}</b>
            </h6>
          </div>
          <div className={`text-lg font-medium ${item.text}`}>
            {item.count}
          </div>
          <div className="ml-auto max-w-[124px]">
            <Chart
              options={item.name.options}
              series={item.name.series}
              type="bar"
              height="48"
              width="124"
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default GroupChart6;
