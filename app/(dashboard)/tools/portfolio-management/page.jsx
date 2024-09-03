'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import ProfitChart from '@/components/partials/widget/chart/profit-chart';
import useUserDetails from '@/hooks/useUserDetails';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/app/loading';
import CaptableCard from '@/components/CapTable';
import FairMarketValueCard from '@/components/FairMarketValueCard';
import ImageBlock2 from '@/components/partials/widget/block/image-block-2';
import GroupChart2 from '@/components/partials/widget/chart/group-chart-2';
import MixedChart from '@/components/partials/chart/appex-chart/Mixed';
import ActivityCard from '@/components/ActivityCard';

const BankingPage = () => {
  const { profile } = useCompleteUserDetails();
  const { user, loading: userLoading } = useUserDetails();
  const [isLoading, setIsLoading] = useState(true);

  // Sample activities data
  const activities = [
    { time: '12 Hrs', user: 'John Doe', description: 'Updated the product description for Widget X.' },
    { time: '4:32pm', user: 'Jane Smith', description: 'Added a new user with username janesmith89.' },
    { time: '11:45am', user: 'Michael Brown', description: 'Changed the status of order #12345 to Shipped.' },
    { time: '9:27am', user: 'David Wilson', description: 'Added John Smith to academy group this day.' },
    { time: '8:56pm', user: 'Robert Jackson', description: 'Added a comment to the task Update website layout.' },
  ];

  useEffect(() => {
    if (!userLoading && profile) {
      setIsLoading(false);
    }
  }, [userLoading, profile]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="p-6">
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
          <ImageBlock2 />
        </div>
        <div className="2xl:col-span-9 lg:col-span-8 col-span-12">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <GroupChart2 />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        {/* Captable Card */}
        <div className="col-span-12 md:col-span-3">
          <CaptableCard />
        </div>

        {/* Financials Card */}
        <div className="col-span-12 md:col-span-6">
          <Card title="Financials">
            <MixedChart />
          </Card>
        </div>

        {/* Fair Market Value Card */}
        <div className="col-span-12 md:col-span-3">
          <FairMarketValueCard />
        </div>
        
        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 col-span-12">
          <ActivityCard title="Company and Founder's Information" imageSrc="\assets\images\all-img\founder.png" activities={activities} />
          <ActivityCard title="Series wise Documents" imageSrc="/images/documents.png" activities={activities} />
          <ActivityCard title="Approvals" imageSrc="/images/approvals.png" activities={activities} />
          <ActivityCard title="Financials" imageSrc="\assets\images\all-img\financials.png" activities={activities} />
        </div>
      </div>
    </main>
  );
};

export default BankingPage;
