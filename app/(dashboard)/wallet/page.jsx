"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import GroupChart6 from '@/components/partials/widget/chart/group-chart6';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/app/loading';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const CardSlider3 = dynamic(() => import('@/components/partials/widget/CardSlider3'), {
  ssr: false,
});
import TransactionsTable2 from '@/components/partials/table/transactionwallet';

const Wallet = () => {
  const [greeting, setGreeting] = useState('Good Evening');
  const [companyName, setCompanyName] = useState('');
  const { user, loading } = useUserDetails();
  const { profile } = useCompleteUserDetails();

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning');
    } else if (currentHour < 16) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
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
    <div className='space-y-6 p-6 bg-gray-100 min-h-screen'>
      <Card className='bg-white shadow-md rounded-lg p-6'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='flex items-center mb-4 md:mb-0'>
            <div className='h-20 w-20 rounded-full overflow-hidden shadow-md'>
              <img
                src={profile?.company_logo || '/default-logo.png'}
                alt='Company Logo'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='ml-4'>
              <h4 className='text-xl font-semibold text-gray-800 mb-1'>
                {greeting}, <br></br><b>{profile ? `Mr. ${profile?.name}` : 'Loading...'}</b>
              </h4>
              <p className='text-lg text-gray-500'>
                Welcome to Xellerates AI!
              </p>
            </div>
          </div>
          <div className='w-full md:w-auto'>
            <GroupChart6 profileId={user.id} />
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-4 col-span-12'>
          <Card className='bg-white shadow-md rounded-lg p-6'>
            <h5 className='text-xl font-semibold text-gray-800 mb-4'>Saved Payment Method</h5>
            <div className='max-w-full'>
              <CardSlider3 profileId={user.id} />
            </div>
          </Card>
        </div>
        <div className='lg:col-span-8 col-span-12'>
          <Card className='bg-white shadow-md rounded-lg p-6'>
            <h5 className='text-xl font-semibold text-gray-800 mb-4'>Transaction History</h5>
            <div className='space-y-5'>
              <TransactionsTable2 profileId={user.id} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
