"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import GroupChart5 from "@/components/partials/widget/chart/group-chart5";
import Link from "next/link";
import SimpleBar from "simplebar-react";
import HistoryChart from "@/components/partials/widget/chart/history-chart";
import AccountReceivable from "@/components/partials/widget/chart/account-receivable";
import AccountPayable from "@/components/partials/widget/chart/account-payable";
import { supabase } from "@/lib/supabaseclient"; // Import supabase client
import TransactionsTable from "@/components/partials/table/transactions";
import SelectMonth from "@/components/partials/SelectMonth";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Menu } from "@headlessui/react";
import RecentOrderTable from "@/components/partials/table/recentOrder-table";
import ProfitChart from "@/components/partials/widget/chart/profit-chart";
import OrderChart from "@/components/partials/widget/chart/order-chart";
import EarningChart from "@/components/partials/widget/chart/earning-chart";
import CompanyTable from "@/components/partials/table/company-table";
import useUserDetails from "@/hooks/useUserDetails"; 
import GlobalFilter from "@/components/partials/table/GlobalFilter";

const CardSlider = dynamic(
  () => import("@/components/partials/widget/CardSlider"),
  {
    ssr: false,
  }
);
const CardSlider2 = dynamic(
  () => import("@/components/partials/widget/CardSlider2"),
  {
    ssr: false,
  }
);

const users = [
  { name: "Ab" },
  { name: "Bc" },
  { name: "Cd" },
  { name: "Df" },
  { name: "Ab" },
  { name: "Sd" },
  { name: "Sg" },
];

const BankingPage = () => {
  const { user, loading } = useUserDetails(); // Assuming you have a hook to fetch user details
  const [activeIndex, setActiveIndex] = useState(0);
  const [clientName, setClientName] = useState("Client");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchClientName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("client_name")
          .eq("id", user.id)
          .single(); // Adjust query as per your schema

        if (error) {
          console.error("Error fetching client name:", error);
        } else {
          setClientName(data.client_name);
        }
      }
    };

    fetchClientName();
  }, [user]);

  const handleSearch = (value) => {
    setGlobalFilter(value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5 place-content-center">
          <div className="flex space-x-4 h-full items-center rtl:space-x-reverse">
            <div className="flex-none">
              <div className="h-20 w-20 rounded-full">
                <img
                  src="/assets/images/all-img/main-user.png"
                  alt=""
                  className="w-full h-full"
                />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-medium mb-2">
                <span className="block font-light">Good evening,</span>
                <span className="block">{clientName}</span>
              </h4>
              <p className="text-sm dark:text-slate-300">
                Welcome to Xellerates AI
              </p>
            </div>
          </div>
          <GroupChart5 />
        </div>
      </Card>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-4 col-span-12 space-y-5">
          <Card title="My Portfolios">
            <div className="max-w-[90%] mx-auto mt-2">
              <CardSlider />
            </div>
          </Card>
          <Card title="Track Potential Startups">
            <div className="max-w-[90%] mx-auto mt-2">
              <CardSlider2 />
            </div>
          </Card>
          <Card>
            <div className="flex justify-between mb-6">
              <h4 className="card-title">Activities</h4>
              <Dropdown
                classMenuItems="right-0 w-[180px] top-[110%]"
                label={
                  <span className="text-sm text-center block w-full">
                    <Icon icon="heroicons-outline:filter" />
                    <span className="ml-2">{selectedFilter}</span>
                  </span>
                }
              >
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {["open transaction", "closed transaction"].map((filter) => (
                    <Menu.Item key={filter}>
                      <div
                        onClick={() => setSelectedFilter(filter)}
                        className={`hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50 w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center rtl:space-x-reverse ${
                          selectedFilter === filter
                            ? "bg-slate-200 dark:bg-slate-700"
                            : ""
                        }`}
                      >
                        <span>
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </span>
                      </div>
                    </Menu.Item>
                  ))}
                </div>
              </Dropdown>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-8 col-span-12">
          <div className="space-y-5 bank-table">
            <TransactionsTable />
            <Card title="Progress">
              <div className="legend-ring4">
                <HistoryChart />
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Cap Table" noborder>
          <RecentOrderTable />
        </Card>
        <Card title="Financial Snapshot">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
            <OrderChart />
            <ProfitChart />
            <div className="md:col-span-2">
              <EarningChart />
            </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-8 col-span-12">
        <Card noborder>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-medium text-slate-900 dark:text-white">All Companies</h4>
            <div className="w-64">
              <GlobalFilter filter={globalFilter} setFilter={handleSearch} />
            </div>
          </div>
          <CompanyTable />
        </Card>
      </div>
    </div>
  );
};

export default BankingPage;
