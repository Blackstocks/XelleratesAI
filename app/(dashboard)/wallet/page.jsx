"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import GroupChart6 from '@/components/partials/widget/chart/group-chart6';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/app/loading';

const CardSlider3 = dynamic(() => import('@/components/partials/widget/CardSlider3'), {
  ssr: false,
});
import TransactionsTable2 from '@/components/partials/table/transactionwallet';

const Wallet = () => {
  const [greeting, setGreeting] = useState('Good evening');
  const [companyName, setCompanyName] = useState('');
  const { user, loading } = useUserDetails();

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    const fetchCompanyName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching company name:', error);
        } else {
          setCompanyName(data.company_name);
        }
      }
    };

    fetchCompanyName();
  }, [user]);

  if (loading || !companyName) {
    return <Loading />;
  }

  return (
    <div className='space-y-5'>
      <Card>
        <div className='grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5 place-content-center'>
          <div className='flex space-x-4 h-full items-center rtl:space-x-reverse'>
            <div className='flex-none'>
              <div className='h-20 w-20 rounded-full'>
                <img
                  src='/assets/images/all-img/main-user.png'
                  alt=''
                  className='w-full h-full'
                />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='text-xl font-medium mb-2'>
                <span className='block font-light'>{greeting},</span>
                <span className='block'>
                  <b>{companyName ? `Mr. ${companyName}` : 'Loading...'}</b>
                </span>
              </h4>
              <p className='text-sm dark:text-slate-300'>
                Welcome to Xellerates AI
              </p>
            </div>
          </div>
          <GroupChart6 profileId={user.id} />
        </div>
      </Card>
      <div className='grid grid-cols-12 gap-5'>
        <div className='lg:col-span-4 col-span-12 space-y-5'>
          <Card title='Saved Payment Method'>
            <div className='max-w-[90%] mx-auto mt-2'>
              <CardSlider3 profileId={user.id} />
            </div>
          </Card>
        </div>
        <div className='lg:col-span-8 col-span-12'>
          <div className='space-y-5 bank-table'>
            <TransactionsTable2 profileId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
