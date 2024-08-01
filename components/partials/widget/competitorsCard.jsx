import React from 'react';
import Card from '@/components/ui/Card';
import StackBarChart from '@/components/partials/widget/chart/stack-bar';
import GroupChart5 from '@/components/partials/widget/chart/group-chart-5'; // Assuming GroupChart5 is the pie chart component
import Calculation from '@/components/partials/widget/chart/Calculation';

const CompetitorsCard = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h4 className="card-title">Competitors of Boat Lifestyle</h4>
        <button className="btn btn-primary">Compare</button>
      </div>
      <div className="flex flex-wrap justify-between items-center mb-6 space-x-4">
        <div className="flex-1 min-w-[200px] p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold">2<sup>nd</sup></div>
          <div className="text-slate-500">Rank</div>
          <div className="text-slate-500 text-sm">Among 78 Competitors</div>
        </div>
        <div className="flex-1 min-w-[200px] p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold">70</div>
          <div className="text-slate-500">Active Competitors</div>
          <div className="text-slate-500 text-sm">8 Funded / 4 Exited</div>
        </div>
        <div className="flex-1 min-w-[200px] p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold">$2.85B</div>
          <div className="text-slate-500">Funding</div>
          <div className="text-slate-500 text-sm">32 Funding Rounds</div>
        </div>
        <div className="flex-1 min-w-[200px] p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold">95</div>
          <div className="text-slate-500">Investors</div>
          <div className="text-slate-500 text-sm">Among 78 Competitors</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h5 className="text-lg font-medium">Top Competitors By Funding</h5>
          <StackBarChart />
        </div>
        <div>
          <h5 className="text-lg font-medium">Latest Market Share</h5>
          <GroupChart5 height={500} /> {/* Decrease the height of the pie chart */}
        </div>
      </div>
    </Card>
  );
};

export default CompetitorsCard;
