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
  const [unlockedCards, setUnlockedCards] = useState({
    topConversations: false,
    currentNumbers: false,
    capTable: false,
    topPerformingPortfolios: false,
    hotDeals: false,
  });

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

  const handleUnlockClick = (cardName) => {
    setUnlockedCards(prevState => ({ ...prevState, [cardName]: true }));
  };

  const renderLockedCard = (title, content, cardName) => (
    <Card>
      <div className="relative">
        {!unlockedCards[cardName] && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-xl font-semibold text-slate-700 bg-opacity-50">
            <span>Unlock through credits</span>
            <button
              onClick={() => handleUnlockClick(cardName)}
              className="mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
            >
              Unlock
            </button>
          </div>
        )}
        <div className={`${unlockedCards[cardName] ? '' : 'blur'}`}>
          {content}
        </div>
      </div>
    </Card>
  );

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
                {renderLockedCard(
                  "Top Conversations",
                  <div className="xl:col-span-6 col-span-12">
                    <RecentOrderTable />
                  </div>,
                  "topConversations"
                )}
              </div>
              <div className="lg:col-span-4 col-span-12 space-y-5">
                {renderLockedCard(
                  "Current Numbers",
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
                  </ul>,
                  "currentNumbers"
                )}
                {renderLockedCard(
                  "Cap Table",
                  <div className="legend-ring3">
                    <Calculation />
                  </div>,
                  "capTable"
                )}
              </div>
            </div>
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
                  {renderLockedCard(
                    "Top Conversations",
                    <div className="xl:col-span-6 col-span-12">
                      <RecentOrderTable />
                    </div>,
                    "topConversations"
                  )}
                </div>
                <div className="lg:col-span-4 col-span-12 space-y-5">
                  {renderLockedCard(
                    "Top Performing Portfolios",
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
                    </ul>,
                    "topPerformingPortfolios"
                  )}
                  {renderLockedCard(
                    "Hot Deals",
                    <Customer />,
                    "hotDeals"
                  )}
                </div>
              </div>
              <Chatbot />
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .blur {
          filter: blur(8px);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
