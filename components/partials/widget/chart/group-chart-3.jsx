"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseclient";
import Icon from "@/components/ui/Icon";

const GroupChart3 = () => {
  const [investorCount, setInvestorCount] = useState(0);

  useEffect(() => {
    const fetchInvestorCount = async () => {
      const { count, error } = await supabase
        .from("investor_signup")
        .select("*", { count: "exact" });

      if (error) {
        console.error("Error fetching investor count:", error);
      } else {
        setInvestorCount(count);
      }
    };

    fetchInvestorCount();
  }, []);

  const statistics = [
    {
      title: "Available Investors",
      count: investorCount.toString(),
      img: "/assets/images/dashboard/sdash1.png",
    },
    {
      title: "Reach Out",
      count: "0",
      img: "/assets/images/dashboard/sdash2.png",
    },
    {
      title: "Interest Received",
      count: "0",
      img: "/assets/images/dashboard/sdash3.png",
    },
  ];

  return (
    <div className="flex gap-4">
      {statistics.map((item, i) => (
        <div key={i} className="relative w-35 h-32 flex-shrink-0 ml-3">
          <img
            src={item.img}
            alt={item.title}
            draggable="false"
            className="w-full h-full object-contain rounded-md"
          />
          <div className="absolute inset-0 flex items-center justify-center ml-2">
            <div className="bg-white dark:bg-slate-900 rounded-full h-10 w-10 flex items-center justify-center ml-12">
              <span className="text-xl text-slate-900 dark:text-white font-medium">
                {item.count}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupChart3;
