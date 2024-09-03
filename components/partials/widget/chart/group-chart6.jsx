"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";
import useUserDetails from "@/hooks/useUserDetails";

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
          setCreditBalance(data.credit_balance || 0);
          setReferralEarnings(data.referral_balance || 0);
        }
      }
      setLoading(false);
    };

    fetchWalletCredits();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const statistics = [
    {
      title: "Credits Available",
      count: creditBalance,
      bg: "bg-[#E5F9FF] dark:bg-slate-950",
      text: "text-info-500",
      icon: "heroicons:shopping-cart",
    },
    {
      title: "Cashback",
      count: "0",
      bg: "bg-[#FFF3E0] dark:bg-slate-950",
      text: "text-warning-500",
      icon: "heroicons:cube",
    },
    {
      title: "Referral Earning",
      count: referralEarnings,
      bg: "bg-[#E6FFED] dark:bg-slate-950",
      text: "text-[#5743BE]",
      icon: "heroicons:arrow-trending-up-solid",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {statistics.map((item, i) => (
        <div
          className={`rounded-lg shadow-md p-6 flex flex-col justify-between items-start ${item.bg} transition-transform transform hover:scale-105`}
          key={i}
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {item.title}
            </div>
            <div className={`text-2xl ${item.text}`}>
              <i className={`icon ${item.icon}`} />
            </div>
          </div>
          <div className={`text-4xl font-bold ${item.text} mb-2`}>
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupChart6;
