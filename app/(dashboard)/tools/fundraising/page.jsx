"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useCompleteUserDetails from "@/hooks/useCompleUserDetails"; // Ensure this hook exists and the path is correct
import Loading from "@/components/Loading";
import DountChart from "@/components/partials/widget/chart/dount-chart2";
import ImageBlock1 from "@/components/partials/widget/block/image-block-1";
import ImageBlock2 from "@/components/partials/widget/block/image-block-2";
import { supabase } from "@/lib/supabaseclient";
import "react-toastify/dist/ReactToastify.css";
import Button from "@/components/ui/Button";
// import { InvestorsCard, InvestmentCard, GeographicsCard, TransactionsCard } from '@/components/ui/Card';

const rabitWidget = [
  {
    bg: "bg-slate-900 dark:bg-slate-800",
  },
];

const Fundraising = () => {
  const { user, details, loading } = useCompleteUserDetails();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("company_name")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setCompanyName(data.company_name);
        }
      }
    };

    fetchCompanyName();
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => history.back()}
            className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-1">
            <div className="h-32 lg:h-35">
              <ImageBlock2 />
            </div>
            <div
              className="bg-no-repeat bg-cover bg-center px-5 py-8 rounded-[6px] relative flex items-center"
              style={{
                backgroundImage: `url(/assets/images/all-img/widget-bg-5.png)`,
              }}
            >
              <div className="flex-1">
                <div className="max-w-[180px]">
                  <h4 className="text-xl font-medium text-white mb-0">
                    <span className="block text-sm text-white">
                      <h6>
                        <b>CompanyName...</b>
                      </h6>
                    </span>
                    <span className="block text-sm">Evaluation Report</span>
                  </h4>
                </div>
              </div>
              <div className="flex-none">
                <Button
                  icon="heroicons-outline:eye"
                  text="View Report"
                  className="btn-light bg-white btn-sm "
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-center">
                Profile Completion
              </h3>
              <DountChart />
            </div>
            <div className="h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-center">
                Investment Readiness Score
              </h3>
              <DountChart />
            </div>
            <div className="h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-center">
                Equity Available with Founders
              </h3>
              <DountChart />
            </div>
          </div>
        </div>
        <br />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Equity Fundraising",
              color: "bg-primary-500",
              link: "/tools/fundraising/equity",
            },
            {
              title: "Debt Fundraising",
              color: "bg-success-400",
              link: "#",
            },
            {
              title: "Mergers and Acquisitions",
              color: "bg-danger-500",
              link: "#",
            },
            {
              title: "Sale of Secondary Shares",
              color: "bg-warning-400",
              link: "#",
            },
          ].map((card, index) => (
            <div
              key={index}
              className={`relative ${card.color} text-white p-4 rounded shadow hover:shadow-lg transition-shadow`}
            >
              <h2 className="text-lg font-semibold mb-8 text-center">
                {card.title}
              </h2>
              <a
                href={card.link}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-black-500 text-xs font-medium rounded px-4 py-2 hover:bg-gray-200 transition"
              >
                Explore
              </a>
            </div>
          ))}
        </div>
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="flex text-2xl font-bold mb-6 justify-center">
              Why Us?
            </h1>
            <div className="flex justify-center">
              <img
                src="\assets\images\tools\whyus.png"
                alt="Why Us?"
                className="w-1/2 h-auto"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fundraising;
