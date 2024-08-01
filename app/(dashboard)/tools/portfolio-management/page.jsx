'use client'
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import GroupChart5 from '@/components/partials/widget/chart/group-chart5';
import PortfolioTable from '@/components/partials/table/portfolioTable';
import HomeBredCurbs from '@/components/partials/HomeBredCurbs';
import Icon from '@/components/ui/Icon';
import RecentOrderTable from '@/components/partials/table/recentOrder-table';
import ProfitChart from '@/components/partials/widget/chart/profit-chart';
import OrderChart from '@/components/partials/widget/chart/order-chart';
import EarningChart from '@/components/partials/widget/chart/earning-chart';
import CompanyTable from '@/components/partials/table/company-table';
import useUserDetails from '@/hooks/useUserDetails';
import GlobalFilter from '@/components/partials/table/GlobalFilter';
import HistoryChart from '@/components/partials/widget/chart/history-chart';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import { DocumentProvider } from '@/context/DocumentContext';
import Loading from '@/components/Loading';
import CompetitorsCard from '@/components/partials/widget/competitorsCard';

const CardSlider = dynamic(
  () => import('@/components/partials/widget/CardSlider_portfolio'),
  {
    ssr: false,
  }
);
const CardSlider2 = dynamic(
  () => import('@/components/partials/widget/CardSlider2'),
  {
    ssr: false,
  }
);

const BankingPage = () => {
  const { profile, investorSignup } = useCompleteUserDetails();
  const { user, loading: userLoading, details } = useUserDetails();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCard, setSelectedCard] = useState('portfolio');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && profile) {
      setIsLoading(false);
    }
  }, [userLoading, profile]);

  const handleSearch = (value) => {
    setGlobalFilter(value);
  };

  const handleSelectChange = (event) => {
    setSelectedCard(event.target.value);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <DocumentProvider>
      <div className='space-y-5'>
        <Card>
          <div className='grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5 place-content-center'>
            <div className='flex space-x-4 h-full items-center rtl:space-x-reverse'>
              <div className='flex-none'>
                <div className='h-20 w-20 rounded-full relative overflow-hidden'>
                  {investorSignup?.profile_photo ? (
                    <img
                      src={investorSignup.profile_photo}
                      alt='Profile Photo'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <img
                      src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                      alt=''
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </div>
              </div>

              <div className='flex-1'>
                <h4 className='text-xl font-medium mb-2'>
                  <span className='block font-light'>Good evening,</span>
                  <span className='block'>{investorSignup?.name}</span>
                </h4>
                <p className='text-sm dark:text-slate-300'>
                  Welcome to Xellerates AI
                </p>
              </div>
            </div>
            <GroupChart5 />
          </div>
        </Card>
        <div className='grid grid-cols-12 gap-5'>
          <div className='lg:col-span-4 col-span-12 space-y-5'>
            <Card title=''>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='card-title'>
                  {selectedCard === 'portfolio'
                    ? 'My Portfolios'
                    : 'Track Potential Startups'}
                </h4>
                <select
                  onChange={handleSelectChange}
                  className='form-select block w-1/3 mt-1 text-sm border-gray-300 rounded-md'
                >
                  <option value='portfolio'>My Portfolios</option>
                  <option value='track'>Track Potential Startups</option>
                </select>
              </div>
              <div className='max-w-[90%] mx-auto mt-2'>
                {selectedCard === 'portfolio' ? (
                  <CardSlider />
                ) : (
                  <CardSlider2 />
                )}
              </div>
            </Card>
            <Card>
              <div className='flex justify-between mb-6'>
                <h4 className='card-title'>Activities</h4>
                <select
                  onChange={handleSelectChange}
                  className='form-select block w-1/3 mt-1 text-sm border-gray-300 rounded-md'
                >
                  <option value='My Portfolios'>My Portfolios</option>
                  <option value='Track Potential Startups'>Track Potential Startups</option>
                </select>
              </div>
            </Card>
          </div>
          <div className='lg:col-span-8 col-span-12'>
            <div className='space-y-5 bank-table'>
              <PortfolioTable />
              <Card title='Progress'>
                <div className='legend-ring4'>
                  <HistoryChart />
                </div>
              </Card>
            </div>
          </div>
        </div>
        <div>
        <CompetitorsCard />
        </div>
        <div className='grid lg:grid-cols-2 grid-cols-1 gap-5'>
          <Card title='Cap Table' noborder>
            <RecentOrderTable />
          </Card>
          <Card title='Financial Snapshot'>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5'>
              <OrderChart />
              <ProfitChart />
              <div className='md:col-span-2'>
                <EarningChart />
              </div>
            </div>
          </Card>
        </div>
        <div className='lg:col-span-8 col-span-12'>
          <Card noborder>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='text-xl font-medium text-slate-900 dark:text-white'>
                All Companies
              </h4>
              <div className='w-64'>
                <GlobalFilter filter={globalFilter} setFilter={handleSearch} />
              </div>
            </div>
            <CompanyTable />
          </Card>
        </div>
      </div>
    </DocumentProvider>
  );
};

export default BankingPage;
