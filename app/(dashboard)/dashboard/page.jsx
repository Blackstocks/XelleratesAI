"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/components/Loading';
import Card from '@/components/ui/Card';
import GroupChart3 from '@/components/partials/widget/chart/group-chart-3';
import GroupChartNew3 from '@/components/partials/widget/chart/group-chart-new3';
import RecentOrderTable from '@/components/partials/table/recentOrder-table';
import Calculation from '@/components/partials/widget/chart/Calculation';
import Customer from '@/components/partials/widget/customer';
import HomeBredCurbs from '@/components/partials/HomeBredCurbs';
import Chatbot from '@/components/chatbot'; // Import the Chatbot component

const financials = [
  { name: "Financials", value: "" },
  { name: "Revenue", value: "$120,000" },
  { name: "Expenses", value: "$70,000" },
  { name: "Profit/Loss", value: "$50,000" },
];
const Portfolios = [
  { name: "Portfolio Name", value: "" },
  { name: "Xellerates", value: "" },
  { name: "Conqr", value: "" },
  { name: "Adios", value: "" },
];

const Dashboard = () => {
  const { user, details, loading } = useUserDetails();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("company_name")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching company name:", error);
        } else {
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
    <div className="w-full">
      {user?.user_type === "startup" && (
        <div>
          <HomeBredCurbs title="Crm" companyName={companyName} userType={user.user_type} />
          <div className="space-y-5">
            <div className="grid grid-cols-12 gap-5">
              <div className="lg:col-span-8 col-span-12 space-y-5">
                <Card>
                  <div className="grid grid-cols-3 gap-4">
                    <GroupChart3 />
                  </div>
                </Card>
                <Card>
                  <div className="xl:col-span-6 col-span-12">
                    <Card title="Top Conversations" noborder>
                      <RecentOrderTable />
                    </Card>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-4 col-span-12 space-y-5">
                <div className="lg:col-span-4 col-span-12 space-y-5">
                  <Card title="Current Numbers">
                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                      {financials.map((item, i) => (
                        <li
                          key={i}
                          className="first:text-xs text-sm first:text-slate-600 text-slate-600 dark:text-slate-300 py-2 first:uppercase"
                        >
                          <div className="flex justify-between">
                            <span>{item.name}</span>
                            <span>{item.value}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card title="Cap Table">
                    <div className="legend-ring3">
                      <Calculation />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
            {/* Add the Chatbot component here */}
            <Chatbot />
          </div>
        </div>
      )}
      {user?.user_type === "investor" && (
        <div>
          <div>
            <HomeBredCurbs title="Crm" companyName={companyName} userType={user.user_type} />
            <div className="space-y-5">
              <div className="grid grid-cols-12 gap-5">
                <div className="lg:col-span-8 col-span-12 space-y-5">
                  <Card>
                    <div className="grid grid-cols-4 gap-4">
                      <GroupChartNew3 />
                    </div>
                  </Card>
                  <Card>
                    <div className="xl:col-span-6 col-span-12">
                      <Card title="Top Conversations" noborder>
                        <RecentOrderTable />
                      </Card>
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-4 col-span-12 space-y-5">
                  <div className="lg:col-span-4 col-span-12 space-y-5">
                    <Card title="Top Performing Portfolios">
                      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                        {Portfolios.map((item, i) => (
                          <li
                            key={i}
                            className="first:text-xs text-sm first:text-slate-600 text-slate-600 dark:text-slate-300 py-2 first:uppercase"
                          >
                            <div className="flex justify-between">
                              <span>{item.name}</span>
                              <span>{item.value}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card title="Hot Deals">
                      <Customer />
                    </Card>
                  </div>
                </div>
              </div>
              {/* Add the Chatbot component here */}
              <Chatbot />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
