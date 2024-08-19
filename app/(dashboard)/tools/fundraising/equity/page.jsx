'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabaseclient';

const Equity = () => {
  const [user, setUser] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showBankerMessage, setShowBankerMessage] = useState(false);
  const [progress, setProgress] = useState(0); // State to track progress
  const [filteredInvestors, setFilteredInvestors] = useState([]);
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

  // Check if the user's profile is complete
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
      if (!isComplete) {
        setShowCompletionModal(true); // Show modal if profile is incomplete
      } else {
        setShowProgressModal(true); // Show progress modal if profile is complete
        startProgress(); // Start progress bar
      }
    }
  };

  // Function to handle the progress bar animation
  const startProgress = () => {
    setProgress(0); // Initialize progress to 0
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval); // Stop the interval when progress reaches 100%
          setTimeout(() => {
            setShowProgressModal(false); // Hide the progress modal
            router.push('/tools/fundraising/equity/investors'); // Redirect after progress completes
          }, 500);
          return 100;
        }
        return Math.min(oldProgress + 5, 100); // Increment progress by 5 every 500ms
      });
    }, 500);
  };

  // Check the connection status and show appropriate modal
  const checkConnectionStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connected_startups')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No rows found for the specified user_id.');
          setShowConnectionModal(true); // Show connect modal if user_id is not found
        } else {
          console.error('Error checking connection status:', error.message);
        }
        return;
      }

      if (data) {
        setShowBankerMessage(true); // Show message if user_id is found
      }
    } catch (error) {
      console.error('Error checking connection status:', error.message);
    }
  };

  const handleConnect = async (userType) => {
    if (!user) return;

    // Fetch the user's profile data from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_name, name, email, mobile, linkedin_profile')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile data:', profileError.message);
      return;
    }

    // Destructure the necessary fields from the profile
    const { company_name, name, email, mobile, linkedin_profile } = profile;

    console.log({
      startup_name: company_name,
      founder_name: name,
      linkedin_profile: linkedin_profile,
      email: email,
      mobile: mobile,
      user_type: userType,
      user_id: user.id,
    });

    try {
      const { data, error } = await supabase
        .from('connected_startups')
        .insert({
          startup_name: company_name,
          founder_name: name,
          linkedin_profile: linkedin_profile,
          email: email,
          mobile: mobile,
          user_type: userType,
          user_id: user.id,
          has_connected: true,
          // Add any other fields you need to insert here
        });

      if (error) {
        throw error;
      }

      setShowConnectionModal(false);
      router.push('/tools/fundraising/equity/investors');
    } catch (error) {
      console.error('Error inserting connection data:', error.message);
    }
  };

  return (
    <div className='flex min-h-screen bg-gray-50 relative'>
      <main
        className={`flex-1 p-8 ${
          showCompletionModal || showProgressModal || showConnectionModal || showBankerMessage ? 'blur-sm' : ''
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
          <div className='cursor-pointer' onClick={checkConnectionStatus}>
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

      {showConnectionModal && (
        <div className="absolute inset-0 flex justify-center items-center flex-col z-10">
          <div className="bg-[#1a235e] text-white p-4 rounded shadow text-center message-container">
            <p className="text-lg font-bold mb-2">
            Our Investment banker will reach out to you soon!!
            </p>
            <button
              onClick={() => handleConnect('equity')} // Pass userType as 'equity' or your desired type
              className="py-2 px-4 bg-[#e7ad6c] text-white rounded transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showBankerMessage && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-[#1a235e] text-white p-6 rounded shadow-lg relative justify-center'>
            <h2 className='text-xl font-bold mb-4 text-white text-center'>
              Our Investment banker will reach out to you soon!!
            </h2>
            <button
              onClick={() => {
                setShowBankerMessage(false);
                router.push('/tools/fundraising/equity/investors');
              }}
              className='py-2 px-4 bg-[#e7ad6c] text-white rounded transition duration-200'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equity;
