"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Card_D from "@/components/card_dashboard";
import Loading from "@/components/Loading";
import useUserDetails from "@/hooks/useUserDetails";

import ImageBlock2 from "@/components/partials/widget/block/image-block-2";

import ImageBlock3 from "@/components/partials/widget/block/image-block-3";
import ImageBlock4 from "@/components/partials/widget/block/image-block-4";

import Button from "@/components/ui/Button";
import SendReportButton from "@/components/DownloadReportButton";
import GroupChart2 from "@/components/partials/widget/chart/group-chart-2";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import ProfitChart from "@/components/partials/widget/chart/profit-chart";
import OrderChart from "@/components/partials/widget/chart/order-chart";
import EarningChart from "@/components/partials/widget/chart/earning-chart";
import SelectMonth from "@/components/partials/SelectMonth";
import Customer from "@/components/partials/widget/customer";
import RecentOrderTable from "@/components/partials/table/recentOrder-table";
import BasicArea from "@/components/partials/chart/appex-chart/BasicArea";
import VisitorRadar from "@/components/partials/widget/chart/visitor-radar";
import MostSales2 from "@/components/partials/widget/most-sales2";
import Products from "@/components/partials/widget/products";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

const Ecommerce = () => {
  const { user, details, loading } = useUserDetails();
  const [locked, setLocked] = useState({
    availStartupIndiaCertificate: true,
    gstCertificate: true, // Example: GST Certificate is locked by default
    intellectualProperty: true,
    virtualOfficeSupport: true,
    capTableManagement: true,
    diyPitchDeck: true,
    financialInsights: true,
    connectWithIncubators: true,
    debtFundraising: true,
    equityFundraising: true,
    ma: true,
    valuateMyBusiness: true,
    investmentBankingSupport: true,
    fundraisingSecondaryShares: true,
    contractsAndAgreements: true,
    reviewMyTermsheet: true,
    reviewMySHA: true,
    globalDealflow: true,
    valuateStartup: true,
    createSyndicate: true,
    joinSyndicate: true,
    followInvestment: true,
    sellShares: true,
    exitStrategy: true,
    dueDiligenceSupport: true,
    shaSupport: true,
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      {user?.user_type === "startup" && (
        <div className="w-full border">
          <section className="py-8 w-full">
            <div className="container px-4 mx-auto">
              <div className="grid grid-cols-12 gap-5 mb-5">
                <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
                  <ImageBlock2 />
                </div>
                <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
                  <ImageBlock3 />
                </div>
                <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
                  <ImageBlock4 />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/Invest.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Investment Readiness
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Achieve investment readiness with our comprehensive
                        tools for incorporation, certification, and cap table
                        management.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/pitchdeck.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        DIY Pitch Deck
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Create your own pitch deck effortlessly with our DIY
                        tool, equipped with templates and customization options.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/financial.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Financial Insights
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Gain comprehensive financial insights with our advanced
                        analytics tool, providing real-time data and trends.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/fund.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Fundraising
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Streamline your fund raising with our platform, offering
                        tailored solutions and connections to potential
                        investors.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/legal.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Legal Help Desk
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Access legal assistance with our help desk, offering
                        guidance on contracts,compliance and legal
                        documentation.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/connect.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Connect with Incubators
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Connect with top incubators through our platform,
                        fostering growth and providing valuable mentorship and
                        resources.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {user?.user_type === "investor" && (
        <div className="w-full border">
          <section className="py-8 w-full">
            <div className="container px-4 mx-auto">
              <div className="grid grid-cols-12 gap-5 mb-5">
                <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
                  <ImageBlock2 />
                </div>
                <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
                  <ImageBlock3 />
                </div>
                <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
                  <ImageBlock4 />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/Invest.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Global Dealflow
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Access global deal flow opportunities, connecting with
                        investors and startups worldwide for strategic growth.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <Button
                        text="Explore"
                        link="/global-dealflow"
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/pitchdeck.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Document Management
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Streamline your document management with our secure
                        platform, ensuring easy access and organization of
                        critical files.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/financial.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Syndicate
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Join or create syndicates to pool resources, share
                        risks, and invest in promising startups collaboratively.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-8 w-full">
            <div className="container px-4 mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/fund.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Portfolio Management
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Optimize your investments with our portfolio management
                        tools, providing insights and tracking performance.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/legal.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Valuate a Startup
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Accurately valuate startups using our comprehensive
                        tools, offering detailed financial and market
                        evaluations.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
                <div className="md:p-4">
                  <div className="p-4 bg-white rounded">
                    <div className="relative h-40 w-full mb-4">
                      <img
                        className="w-full h-full object-cover rounded"
                        src="/assets/images/dashboard/connect.jpg"
                        alt=""
                      />
                    </div>
                    <div className="flex mb-6 justify-center items-center">
                      <h1
                        className="text-sm font-medium text-center"
                        style={{ fontSize: "large" }}
                      >
                        Post Term Sheet
                      </h1>
                    </div>
                    <div className="flex mb-2 justify-between items-center">
                      <h3 className="text-xs font-medium">
                        Manage post-term sheet activities efficiently with our
                        tools, ensuring smooth transitions and adherence to
                        agreements.
                      </h3>
                    </div>
                    <div className="flex items-center justify-center border-t border-gray-50 pt-4">
                      <a
                        className="py-2 px-3 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition duration-200"
                        href="#"
                      >
                        Explore
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Ecommerce;
