"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useCompleteUserDetails from "@/hooks/useCompleUserDetails";  // Ensure this hook exists and the path is correct
import Loading from "@/components/Loading";
import DountChart from "@/components/partials/widget/chart/dount-chart2";
import ImageBlock1 from "@/components/partials/widget/block/image-block-1";
import ImageBlock2 from "@/components/partials/widget/block/image-block-2";
import { supabase } from "@/lib/supabaseclient";
import 'react-toastify/dist/ReactToastify.css';
import { InvestorsCard, InvestmentCard, GeographicsCard, TransactionsCard } from '@/components/ui/Card';

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
          <button onClick={() => history.back()} className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded">
            Back
          </button>
          <div className="text-center w-full">
            <img
              src="/assets/images/auth/logo1.svg"
              alt="Company Logo"
              className="mx-auto mb-4 h-20 w-43"
            />
            <h1 className="text-2xl font-bold mb-6">Fundraising</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-1">
            <div className="h-32 lg:h-35">
              <ImageBlock2 />
            </div>
            <div className="h-32 lg:h-30">
              <ImageBlock1 companyName={companyName} />
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-center">Profile Completion</h3>
              <DountChart />
            </div>
            <div className="h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-center">Investment Readiness Score</h3>
              <DountChart />
            </div>
            <div className="h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-center">Equity Available with Founders</h3>
              <DountChart />
            </div>
          </div>
        </div>
        <br />
        <br/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Equity Fundraising (Components - Cards)", color: "bg-gradient-to-r from-blue-500 to-blue-700", link: "/tools/fundraising/equity" },
            { title: "Debt Fundraising", color: "bg-gradient-to-r from-green-500 to-green-700", link: "#" },
            { title: "Mergers and Acquisitions", color: "bg-gradient-to-r from-red-500 to-red-700", link: "#" },
            { title: "Sale of Secondary Shares", color: "bg-gradient-to-r from-orange-500 to-orange-700", link: "#" },
          ].map((card, index) => (
            <div key={index} className={`relative ${card.color} text-white p-4 rounded shadow hover:shadow-lg transition-shadow h-36`}>
              <h2 className="text-lg font-semibold mb-2 text-center">{card.title}</h2>
              <a
                href={card.link}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black-500 text-xs font-medium rounded px-4 py-2 hover:bg-gray-200 transition"
              >
                Explore
              </a>
            </div>
          ))}
        </div>
        <br />
        <br/>
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Why Us?</h1>
            <br />
            <br />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InvestorsCard />
              <InvestmentCard />
              <GeographicsCard />
              <TransactionsCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fundraising;
