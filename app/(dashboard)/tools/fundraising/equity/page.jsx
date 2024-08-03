'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Ensure correct import from 'next/navigation'
import { supabase } from '../../../../../lib/supabaseclient';

const Equity = () => {
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session) {
      console.error('Error fetching session:', error);
      return;
    }

    const user = session.user;
    if (!user) {
      console.error('No user found in session');
      return;
    }

    setUser(user);
    console.log('User found:', user);
  };

  const checkProfileCompletion = async () => {
    if (!user) {
      console.error('User is not defined');
      return;
    }

    console.log('Checking profile completion for user:', user.id);

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select(
        'name, email, mobile, user_type, status, linkedin_profile, company_name'
      )
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    } else {
      const requiredFields = [
        'name',
        'email',
        'mobile',
        'user_type',
        'status',
        'linkedin_profile',
        'company_name',
      ];
      const isComplete = requiredFields.every((field) => data[field]);
      setIsProfileComplete(isComplete);
      console.log('Profile completion status:', isComplete);
      if (!isComplete) {
        setShowCompletionModal(true);
      } else {
        setShowProgressModal(true);
        startProgress();
      }
    }
  };

  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowProgressModal(false);
            router.push('/tools/fundraising/equity/investors');
          }, 500);
          return 100;
        }
        return Math.min(oldProgress + 5, 100);
      });
    }, 500);
  };

  return (
    <div className='flex min-h-screen bg-gray-50 relative'>
      <main
        className={`flex-1 p-8 ${
          showCompletionModal || showProgressModal ? 'blur-sm' : ''
        }`}
      >
        <div className='absolute top-4 left-4'>
          <button
            onClick={() => router.back()}
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            Back
          </button>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12'>
          <div className='cursor-pointer' onClick={checkProfileCompletion}>
            <img
              src='/assets/images/tools/equityInvestor.png'
              alt='Equity Investor'
              className='rounded w-full h-50 object-contain'
            />
          </div>
          <div className='cursor-pointer'>
            <img
              src='/assets/images/tools/equityInvestment.png'
              alt='Equity Investment'
              className='rounded w-full h-50 object-contain'
            />
          </div>
        </div>
      </main>

      {showCompletionModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white p-6 rounded shadow-lg relative'>
            <button
              className='absolute top-2 right-2'
              onClick={() => setShowCompletionModal(false)}
            >
              X
            </button>
            <h2 className='text-xl font-bold mb-4'>Profile Incomplete</h2>
            <p>
              Please complete your profile first before connecting with an
              investor.
            </p>
            <button
              onClick={() => setShowCompletionModal(false)}
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showProgressModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white p-6 rounded shadow-lg relative'>
            <div className='flex flex-col items-center'>
              <p className='mb-4'>
                Our Xellerates AI model is analyzing your profile...
              </p>
              <div className='w-full bg-gray-200 rounded'>
                <div
                  className='bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded'
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equity;
