import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ComingSoonModal from '@/components/ComingSoonModal';
import GetStartupInsightsModal from '@/components/GetStartupInsights'; // Adjust import as needed
import GetStartupInsightsModal1 from '@/components/GetStartupInsights1'; // Adjust import as needed
import generateReport from '@/components/report/report-functions';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import { supabase } from '@/lib/supabaseclient';


const HomeBredCurbs = ({ title, companyName, userType }) => {
  const [greeting, setGreeting] = useState('Good evening');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const toastIdRef = useRef(null);

  const {
    fundingInformation,
    companyProfile,
    founderInformation,
    businessDetails,
    companyDocuments,
    ctoInfo,
    profile,
    loading,
  } = useCompleteUserDetails();

  //const companyName = companyProfile?.company_name || 'NA';
  // console.log(companyProfile);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    return () => {
      // Dismiss the toast when the component is unmounted
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);




  const handleGenerateInvestmentReadinessReport = async () => {

    try {
      // Fetch current wallet credits
      const { data: walletCredits, error: creditError } = await supabase
        .from('wallet_credits')
        .select('*')
        .eq('startup_id', profile.id)
        .single();

      if (creditError) {
        console.error('Error fetching credits:', creditError);
        toast.error('Failed to fetch wallet credits.');
        return;
      }

      let currentCredits = walletCredits?.credit_balance || 0;

      // Check if there are enough credits to generate the report
      if (currentCredits >= 10) {
        // Deduct 10 credits for generating the report
        const { error: updateError } = await supabase
          .from('wallet_credits')
          .update({ credit_balance: currentCredits - 10 })
          .eq('startup_id', profile.id);

        if (updateError) {
          console.error('Error deducting credits:', updateError);
          toast.error('Failed to deduct credits.');
          return;
        }

        toast.success('10 credits have been deducted for generating the investment readiness report.');

        // Generate the investment readiness report
        toastIdRef.current = toast.loading('Generating report, please wait...');

        const firstUpdate = setTimeout(() => {
          toast.update(toastIdRef.current, {
            render: 'Taking longer than usual...',
            type: toast.TYPE.INFO,
            isLoading: true,
            autoClose: false,
          });
        }, 15000);

        const secondUpdate = setTimeout(() => {
          toast.update(toastIdRef.current, {
            render: 'Almost there...',
            type: toast.TYPE.INFO,
            isLoading: true,
            autoClose: false,
          });
        }, 30000);

        const clearToastUpdates = () => {
          clearTimeout(firstUpdate);
          clearTimeout(secondUpdate);
        };

        const shortDescription = companyProfile?.short_description || 'Default description';
        const industrySector = companyProfile?.industry_sector || 'Default sector';
        const currentStage = companyProfile?.current_stage || 'Not Available';
        const previousFunding = fundingInformation?.previous_funding || [];

        try {
          const result = await generateReport(
            companyProfile,
            fundingInformation,
            founderInformation,
            businessDetails,
            companyDocuments,
            ctoInfo,
            profile,
            shortDescription,
            industrySector,
            companyName,
            currentStage,
            previousFunding
          );

          if (result.status === 'docs') {
            toast.update(toastIdRef.current, {
              render: (
                <div>
                  Cannot generate report: Missing documents or incorrect format:
                  <br />
                  {result.message}
                </div>
              ),
              type: 'warning',
              isLoading: false,
              autoClose: 5000,
            });
            clearToastUpdates();
          } else {
            toast.update(toastIdRef.current, {
              render: 'Report generated successfully!',
              type: 'success',
              isLoading: false,
              autoClose: 5000,
            });
            clearToastUpdates();
            toastIdRef.current = null;

            try {
              const newWindow = window.open('', '_blank');

              if (newWindow) {
                newWindow.document.write(result.html);
                newWindow.document.close();
              } else {
                throw new Error(
                  'Popup blocked. Please allow popups for this site.'
                );
              }
            } catch (error) {
              toast.update(toastIdRef.current, {
                render: `Cannot generate Report! ${error.message || error}`,
                type: 'error',
                isLoading: false,
                autoClose: 5000,
              });
              clearToastUpdates();
              toastIdRef.current = null;
            }
          }
        } catch (error) {
          toast.update(toastIdRef.current, {
            render: `Cannot generate Report! Error: ${error.message || error}`,
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          });
          clearToastUpdates();
          toastIdRef.current = null;
        }

      } else {
        toast.error('Not enough credits to generate the investment readiness report.');
      }
    } catch (error) {
      console.error('Error in Report:', error.message);
      toast.error('An unexpected error occurred while generating the report.');
    }
  };

  



  const handleImageClick = async (type) => {
    if (toastIdRef.current) {
      // If a toast is already displayed, prevent further action
      return;
    }

    if (type === 'startup') {
      if (
        loading ||
        !companyProfile ||
        !fundingInformation ||
        !founderInformation
      ) {
        toast.warning('Please wait, data is still loading...');
        return;
      }
    }

    if (type === 'investment') {
      
      handleGenerateInvestmentReadinessReport();

      // toastIdRef.current = toast.loading('Generating report, please wait...');

      // const firstUpdate = setTimeout(() => {
      //   toast.update(toastIdRef.current, {
      //     render: 'Taking longer than usual...',
      //     type: toast.TYPE.INFO,
      //     isLoading: true,
      //     autoClose: false,
      //   });
      // }, 15000);

      // // Second update after 10 seconds
      // const secondUpdate = setTimeout(() => {
      //   toast.update(toastIdRef.current, {
      //     render: 'Almost there...',
      //     type: toast.TYPE.INFO,
      //     isLoading: true,
      //     autoClose: false,
      //   });
      // }, 30000);

      // // Ensure to clear the timeouts if the process completes early or fails
      // const clearToastUpdates = () => {
      //   clearTimeout(firstUpdate);
      //   clearTimeout(secondUpdate);
      // };

      // const shortDescription =
      //   companyProfile?.short_description || 'Default description';
      // const industrySector =
      //   companyProfile?.industry_sector || 'Default sector';
      // const currentStage = companyProfile?.current_stage || 'Not Available';
      // const previousFunding = fundingInformation?.previous_funding || [];

      // try {
      //   const result = await generateReport(
      //     companyProfile,
      //     fundingInformation,
      //     founderInformation,
      //     businessDetails,
      //     companyDocuments,
      //     ctoInfo,
      //     profile,
      //     shortDescription,
      //     industrySector,
      //     companyName,
      //     currentStage,
      //     previousFunding
      //   );
      //   //generatePDF(reportHtml);

      //   if (result.status === 'docs') {
      //     toast.update(toastIdRef.current, {
      //       render: (
      //         <div>
      //           Cannot generate report: Missing documents or incorrect format:
      //           <br />
      //           {result.message}
      //         </div>
      //       ),
      //       type: 'warning',
      //       isLoading: false,
      //       autoClose: 5000,
      //     });
      //     clearToastUpdates();
      //   } else {
      //     toast.update(toastIdRef.current, {
      //       render: 'Report generated successfully!',
      //       type: 'success',
      //       isLoading: false,
      //       autoClose: 5000,
      //     });
      //     clearToastUpdates();
      //     toastIdRef.current = null;

      //     try {
      //       const newWindow = window.open('', '_blank');

      //       if (newWindow) {
      //         newWindow.document.write(result.html);
      //         newWindow.document.close();
      //       } else {
      //         throw new Error(
      //           'Popup blocked. Please allow popups for this site.'
      //         );
      //       }
      //     } catch (error) {
      //       toast.update(toastIdRef.current, {
      //         render: `Cannot generate Report! ${error.message || error}`,
      //         type: 'error',
      //         isLoading: false,
      //         autoClose: 5000,
      //       });
      //       clearToastUpdates();
      //       toastIdRef.current = null;
      //     }
      //   }
      // } catch (error) {
      //   toast.update(toastIdRef.current, {
      //     render: `Cannot generate Report! Error: ${error.message || error}`,
      //     type: 'error',
      //     isLoading: false,
      //     autoClose: 5000,
      //   });
      //   clearToastUpdates();
      //   toastIdRef.current = null;
      //   // console.error('Error Generating Report', error.message);
      // }
    } else {
      setModalType(type);
      setIsModalOpen(true);
    }
  };

  function loadExternalScripts(win) {
    // Load Tailwind CSS
    const tailwindScript = win.document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    tailwindScript.onload = () => {
      console.log('Tailwind CSS loaded in new window.');
    };
    win.document.head.appendChild(tailwindScript);

    // Load Chart.js
    const chartScript = win.document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    chartScript.onload = () => {
      console.log('Chart.js loaded in new window.');
    };
    win.document.head.appendChild(chartScript);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  return (
    <div className='flex flex-col lg:flex-row justify-between flex-wrap items-center mb-6'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 w-full lg:space-x-4 mt-4'>
        <div
          className='lg:col-span-4 bg-no-repeat bg-cover bg-center shadow-lg p-5 rounded-[6px] relative flex-1 mb-4 lg:mb-0'
          style={{
            backgroundImage: `url(/assets/images/all-img/widget-bg-2.png)`,
          }}
        >
          <div>
            <h4 className='text-xl font-medium text-white mb-2'>
              <span className='block font-normal'>{greeting},</span>
              <span className='block'>
                <h5 className='text-white'>
                  <b>{companyName ? companyName : 'Loading...'}</b>
                </h5>
              </span>
            </h4>
          </div>
        </div>
        <div className='lg:col-span-4 p-4 rounded bg-white shadow-lg text-black flex-1 mb-4 lg:mb-0 dark:bg-slate-900'>
          <p>
            <h5>Welcome to Xellerates AI,</h5>I am <b>Zephyr</b>
            <span className='inline-block ml-2 animate-waving-hand'>👋🏻</span>,
            your personal Investment Banker
          </p>
        </div>
        <div className='lg:col-span-4 flex items-center justify-center lg:justify-end flex-1 mt-4 lg:mt-0'>
          {userType === 'startup' ? (
            <>
              <img
                src='/assets/images/dashboard/investment-readiness.png'
                alt='Investment Readiness'
                className={`block dark:hidden w-full h-auto cursor-pointer ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={!loading ? () => handleImageClick('investment') : null}
              />
              <img
                src='/assets/images/dashboard/investment-readinessdark.svg'
                alt='Investment Readiness Dark'
                className={`hidden dark:block w-full h-auto cursor-pointer ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={!loading ? () => handleImageClick('investment') : null}
              />
            </>
          ) : (
            <>
              <img
                src='/assets/images/dashboard/latest-insight.png'
                alt='Latest Insight'
                className='block dark:hidden w-full h-auto cursor-pointer'
                onClick={() => handleImageClick('insight')}
              />
              <img
                src='/assets/images/dashboard/latest-insightdark.svg'
                alt='Latest Insight Dark'
                className='hidden dark:block w-full h-auto cursor-pointer'
                onClick={() => handleImageClick('insight')}
              />
            </>
          )}
        </div>
      </div>

      {isModalOpen && modalType === 'insight' && (
        <GetStartupInsightsModal1
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* <ToastContainer /> */}

      <style jsx>{`
        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          30% {
            transform: rotate(14deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(10deg);
          }
          60% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .animate-waving-hand {
          display: inline-block;
          animation: wave 2s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  );
};

export default HomeBredCurbs;
