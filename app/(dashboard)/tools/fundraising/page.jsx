'use client';

import React, { useEffect, useState } from 'react';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/app/loading';
import DonutChart2 from '@/components/partials/widget/chart/dount-chart2';
import DonutChart3 from '@/components/partials/widget/chart/dount-chart3';
import DonutChart4 from '@/components/partials/widget/chart/dount-chart4';
import ImageBlock2 from '@/components/partials/widget/block/image-block-2';
import Button from '@/components/ui/Button';
import ComingSoonModal from '@/components/ComingSoonModal';
import Link from 'next/link';
import axios from 'axios';
import getCollegeType from '@/components/report/college-analysis';

function companyIsTechScore(companyProfile) {
  const techKeywords = ["software", "technology", "IT", "SaaS", "AI", "ML", "blockchain", "cloud", "cybersecurity", "fintech", "edtech", "healthtech", "tech"];
  const combinedString = `${companyProfile?.shortDescription} ${companyProfile?.industrySector}`;
  if (combinedString) {
    const industry = combinedString.toLowerCase();
    const isTech = techKeywords.some(keyword => industry.includes(keyword));
    return 5;
  }
  return 0;
}

function calculateMediaPresenceScore(newsList, companyName) {
  let score = 0;
  if (!companyName) return score;

  const companyNameLowerCase = companyName.toLowerCase();

  newsList.forEach(article => {
    const titleLowerCase = article.title.toLowerCase();
    const summaryLowerCase = article.summary.join(' ').toLowerCase();

    if (titleLowerCase.includes(companyNameLowerCase) || summaryLowerCase.includes(companyNameLowerCase)) {
      score = 10;
    }
  });
  return score;
}

function calculateFundingScore(capTable) {
  let foundersEquity = 0;

  if (capTable.length > 0) {
    foundersEquity = capTable.reduce((total, person) => {
      if (person.designation.toLowerCase() === "founder" || person.designation.toLowerCase() === "co-founder") {
        return total + parseFloat(person.percentage);
      }
      return total;
    }, 0);
  }

  return foundersEquity > 50 ? 10 : 0;
}

const Fundraising = () => {
  const {
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    loading,
  } = useCompleteUserDetails();

  const [greeting, setGreeting] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investmentReadinessScore, setInvestmentReadinessScore] = useState(null);  // Initialized to null

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning,');
    } else if (currentHour < 16) {
      setGreeting('Good afternoon,');
    } else {
      setGreeting('Good evening,');
    }
  }, []);

  useEffect(() => {
    const fetchInvestmentReadinessScore = async () => {
      if (!companyProfile) return;

      const companyName = companyProfile?.company_name;
      let newsList = [];

      try {
        const response = await axios.get('/api/fetch-news-no-summary', {
          params: { q: companyName },
        });
        newsList = response.data;
      } catch (error) {
        console.error('Error fetching news:', error);
      }

      const currentTraction = businessDetails?.current_traction || 0;
      const newCustomers = businessDetails?.new_Customers || 0;
      const CAC = businessDetails?.customer_AcquisitionCost || 0;
      const LTV = businessDetails?.customer_Lifetime_Value || 0;

      const normalizedTraction = Math.min((currentTraction / 1000000) * 100, 100);
      const normalizedNewCustomers = Math.min((newCustomers / 5000) * 100, 100);
      const normalizedCAC = Math.min((1000 / CAC) * 100, 100);
      const normalizedLTV = Math.min((LTV / 1000) * 100, 100);

      const tractionScore = Math.round(
        (normalizedTraction * 0.4) +
        (normalizedNewCustomers * 0.2) +
        (normalizedCAC * 0.2) +
        (normalizedLTV * 0.2)
      );

      const incorporationScore = companyProfile?.incorporation_date ? 10 : 0;
      const companyTechScore = companyIsTechScore(companyProfile);
      const fundingScore = fundingInformation?.previous_funding?.length > 0 ? 10 : 0;
      let educationScore = 0;

      const mediaPresenceScore = calculateMediaPresenceScore(newsList, companyName);
      const foundersEquityScore = calculateFundingScore(fundingInformation?.cap_table || []);

      try {
        const collegeName = await getCollegeType(founderInformation?.college_name);
        if (collegeName?.type === 'T1' || collegeName?.type === 'Foreign') {
          educationScore = 5;
        }
      } catch (error) {
        console.error('Error fetching college type:', error);
      }

      const totalScore = incorporationScore + companyTechScore + fundingScore + educationScore + tractionScore * 0.5 + mediaPresenceScore + foundersEquityScore;
      const finalScore = Math.min(totalScore, 100);

      setInvestmentReadinessScore(finalScore);  // Update the state
    };

    fetchInvestmentReadinessScore();
  }, [businessDetails, companyProfile, fundingInformation, founderInformation]);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  const cardContent = (imgSrc, link) => (
    <Link href={link} className='block'>
      <img src={imgSrc} alt='' className='rounded w-full h-40 object-contain' />
    </Link>
  );

  return (
    <div className='flex min-h-screen bg-gray-50 relative'>
      <main className='flex-1 p-8'>
        <div className='flex justify-between items-center mb-8'>
          <button
            onClick={() => history.back()}
            className='absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded'
          >
            Back
          </button>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1 space-y-1'>
            <div className='h-32 lg:h-35'>
              <ImageBlock2 />
            </div>
            <div
              className='bg-no-repeat bg-cover bg-center px-5 py-8 rounded-[6px] relative flex items-center'
              style={{
                backgroundImage: `url(/assets/images/all-img/widget-bg-5.png)`,
              }}
            >
              <div className='flex-1'>
                <div className='max-w-[180px]'>
                  <h4 className='text-xl font-medium text-white mb-0'>
                    <span className='block text-sm text-white'>
                      <h6>
                        <b>{companyProfile?.company_name || 'Company Name'}</b>
                      </h6>
                    </span>
                    <span className='block text-sm'>Evaluation Report</span>
                  </h4>
                </div>
              </div>
              <div className='flex-none'>
                <Button
                  icon='heroicons-outline:eye'
                  text='View Report'
                  className='btn-light bg-white btn-sm '
                  onClick={handleImageClick}
                />
              </div>
            </div>
          </div>
          <div className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6'>
            <div className='h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg'>
              <h3 className='text-lg font-semibold mb-2 text-center'>
                Profile Completion
              </h3>
              <DonutChart3
                profile={profile}
                companyProfile={companyProfile}
                businessDetails={businessDetails}
                founderInformation={founderInformation}
                fundingInformation={fundingInformation}
                ctoInfo={ctoInfo}
                companyDocuments={companyDocuments}
              />
            </div>
            <div className='h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg relative'>
              <h3 className='text-lg font-semibold mb-2 text-center text-black'>
                Investment Readiness Score
              </h3>
             
                <DonutChart2 
                businessDetails={businessDetails}
                InvestmentReadinessScore={investmentReadinessScore} // Pass the calculated score here
                />

            </div>
            <div className='h-60 flex flex-col items-center justify-center bg-white shadow-lg rounded-lg'>
              <h3 className='text-lg font-semibold mb-2 text-center'>
                Equity Available with Founders
              </h3>
              <DonutChart4 />
            </div>
          </div>
        </div>
        <br />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {cardContent(
            '/assets/images/tools/equity.png',
            '/tools/fundraising/equity'
          )}
          {cardContent(
            '/assets/images/tools/dept.png',
            '/tools/fundraising/debt'
          )}
          {cardContent('/assets/images/tools/m&a.png', '#')}
          {cardContent('/assets/images/tools/sale.png', '#')}
        </div>
        <div className='flex-1 p-8'>
          <div className='text-center'>
            <h1 className='flex text-2xl font-bold mb-6 justify-center'>
              Why Us?
            </h1>
            <div className='flex justify-center'>
              <img
                src='\assets\images\tools\whyus.png'
                alt='Why Us?'
                className='lg:w-1/2 sm:w-full h-auto'
              />
            </div>
          </div>
        </div>
      </main>
      <ComingSoonModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Fundraising;
