"use client"
import React, { useState, useEffect } from "react";
import axios from 'axios';
import * as cheerio from 'cheerio';
import generateResponse from '@/components/report/sector-analysis';
import generateFinancialResponse from '@/components/report/financial-projections';
import generateTechnologyRoadmap from '@/components/report/technology-roadmap'
import generateCompetitorAnalysis from '@/components/report/competitor-analysis';
import getCollegeType from '@/components/report/college-analysis';
import findIncorporationDate from '@/components/report/incorporation-date';
// import unirest from 'unirest';

// Function to fetch financial data
export const fetchFinancials = async (companyProfile) => {
  try {
    const company_id = companyProfile?.id;
    if (!company_id) {
      throw new Error('Company ID is not available');
    }

    const response = await fetch('/api/apiDataExtraction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching financial data:', error.message);
    return null;
  }
};

function selectRevenueSheet(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    let selectedSheetName;

    if (sheetNames.length === 1) {
        selectedSheetName = sheetNames[0];
    } else {
        selectedSheetName = sheetNames.find(sheetName => 
            sheetName.toLowerCase().includes('revenue')
        );
    }

    if (!selectedSheetName) {
        console.log("No sheet with 'revenue' found. Selecting the first sheet.");
        selectedSheetName = sheetNames[0];
    }
    const selectedSheet = workbook.Sheets[selectedSheetName];
    const sheetData = xlsx.utils.sheet_to_json(selectedSheet, { header: 1 });

    return {
        sheetName: selectedSheetName,
        data: sheetData
    };
}  

// Function to get competitors data
async function getCompetitors(companyName, shortDescription, targetAudience, uspMoat) {
  let cData = {};
  try{
    cData = generateCompetitorAnalysis(companyName, shortDescription, targetAudience, uspMoat);
    return cData;
  } catch (error) {
    console.error("Error generating structured competitor data:", error);
    throw error;
  }
}

function determineCompanyIsTech(companyProfile) {
    const techKeywords = ["software", "technology", "IT", "SaaS", "AI", "ML", "blockchain", "cloud", "cybersecurity", "fintech", "edtech", "healthtech", "tech"];
    const combinedString = `${companyProfile?.shortDescription} ${companyProfile?.industrySector}`
    if (combinedString) {
      const industry = combinedString.toLowerCase();
      const isTech = techKeywords.some(keyword => industry.includes(keyword));
      return isTech ? "Tech" : "Non-Tech";
    }
    return "Non-Tech";
  }

function calculateMediaPresenceScore(newsList, companyName) {
    let score = 0;
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
    const foundersEquity = capTable.reduce((total, person) => {
      if (person.designation.toLowerCase() === "founder" || person.designation.toLowerCase() === "co-founder") {
        return total + parseFloat(person.percentage);
      }
      return total;
    }, 0);
  
    return foundersEquity > 50 ? 10 : 0;
  }

const generateReport = async (
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
) => {

    console.log("Company name: ", companyName);
  
    const financialProjectionsLink = companyDocuments?.financial_projections;
    const technologyRoadmapLink = ctoInfo?.technology_roadmap;
    console.log("Tech Roadmap: ", technologyRoadmapLink);
    const financialData = await fetchFinancials(companyProfile);

    const missingDocuments = [];
  
    // if (!financialProjectionsLink) {
    //   missingDocuments.push('Financial Projections');
    // }
    // if (!technologyRoadmapLink) {
    //   missingDocuments.push('Technology Roadmap');
    // }

    if (!companyDocuments?.certificate_of_incorporation || !companyDocuments.certificate_of_incorporation.endsWith('.pdf')) {
        missingDocuments.push('Certificate of Incorporation');
      }

      if (!companyDocuments?.mis || !companyDocuments.mis.endsWith('.xlsx')) {
        missingDocuments.push('MIS Report');
      }
    // if (missingDocuments.length > 0) {
    //     const missingMessage = missingDocuments.map(doc => `• ${doc}`).join('\n');
    //     return { status: 'error', message: missingMessage };
    // }

    if (missingDocuments.length > 0) {
        const missingMessage = missingDocuments.map((doc, index) => (
            <React.Fragment key={index}>
                • {doc}
                <br />
            </React.Fragment>
        ));
        return { status: 'docs', message: missingMessage };
    }

    const pFunding = founderInformation?.previous_funding || [];
  
  const totalFunding = previousFunding.reduce((total, funding) => total + parseFloat(funding.amountRaised || 0), 0);
  const coFounders = founderInformation?.co_founders || [];
  const newsQuery = `${companyName}`;
  const companyWebsite = companyProfile?.company_website || 'NA';
  const companyLinkedin = companyProfile?.linkedin_profile || 'NA';
  const yearlyRevenue = financialData?.revenue.Yearly
  const latestRevenue = yearlyRevenue[yearlyRevenue.length - 1];
  const yearlyProfit = financialData?.profit.Yearly;
  const latestProfit = yearlyProfit[yearlyProfit.length - 1];
  const capTable = fundingInformation?.cap_table || [];
  const targetAudience = companyProfile?.target_audience || 'NA';
  const uspMoat = companyProfile?.usp_moat || 'NA';

  const incorporationDate = await findIncorporationDate(companyDocuments?.certificate_of_incorporation);
  console.log("IC Date: ", incorporationDate);


  let newsList = [];

  try {
    const response = await axios.get('/api/fetch-news-no-summary', {
    params: { q: newsQuery },
    });
    newsList = response.data;
  } catch (error) {
        console.error('Error fetching news:', error);
    }

    const newsListLatest = newsList.length > 0 ? [...newsList].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
    const newsListOldest = newsList.length > 0 ? [...newsList].sort((a, b) => new Date(a.date) - new Date(b.date)) : [];

  // Investment Readiness Score

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
  )

  const incorporationScore = companyProfile?.incorporation_date ? 10 : 0;
  const companyTechScore = determineCompanyIsTech(companyProfile) === 'Tech' ? 5 : 0;
  const fundingScore = previousFunding.length > 0 ? 10 : 0;
  let educationScore = 0;
  let collegeName = null;


  const mediaPresenceScore = calculateMediaPresenceScore(newsList, companyName);
  const foundersEquityScore = calculateFundingScore(capTable);
  try {
        collegeName = await getCollegeType(founderInformation?.college_name);
    } catch {
        collegeName = industrySector;
    }

    if (collegeName?.type === 'T1' || 'Foreign'){
        educationScore = 5;
        console.log('College: ', collegeName?.type);
    }

  const totalScore = incorporationScore + companyTechScore + fundingScore + educationScore + tractionScore * 0.5 + mediaPresenceScore + foundersEquityScore;
  const InvestmentReadinessScore = Math.min(totalScore, 100);

  console.log("IRS: ", InvestmentReadinessScore);

  //console.log("funding data: ", previousFunding);
  //console.log("CAP table: ", capTable);



    let sector;

    try {
        sector = await generateResponse(shortDescription, industrySector, targetAudience, uspMoat);
    } catch {
        sector = industrySector;
    }

        let financialProjections = {};
    try {
    if (financialProjectionsLink) {
        financialProjections = await generateFinancialResponse(financialProjectionsLink);
    }
    } catch (error) {
    console.error('Error generating financial projections:', error.message);
    financialProjections = {}; // Initialize to an empty object in case of error
    }

    let technologyRoadmap = {};
    try {
    if (technologyRoadmapLink) {
        technologyRoadmap = await generateTechnologyRoadmap(technologyRoadmapLink);
    }
    } catch (error) {
    console.error('Error generating technology roadmap:', error.message);
    technologyRoadmap = {}; // Initialize to an empty object in case of error
    }

    // console.log("FP Link:", financialProjectionsLink);

    let competitors = [];
    try {
         competitors = await getCompetitors(companyName, shortDescription, targetAudience, uspMoat);
    } catch (error) {
        console.error('Error getting competitors:', error.message);
        competitors = []; // Initialize to an empty array in case of error
    }

    let roadmapArray = [];
    try {
    if (Array.isArray(technologyRoadmap)) {
        roadmapArray = technologyRoadmap;
    } else if (typeof technologyRoadmap === 'string') {
        roadmapArray = JSON.parse(technologyRoadmap);
    }
    } catch (error) {
    console.error('Error parsing technologyRoadmap:', error.message);
    roadmapArray = []; // Initialize to an empty array in case of error
    }


    //console.log('Technology Roadmap: ', technologyRoadmap); 


    //console.log("Sector: ", sector);
    const reportHtml = `
    
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} Investment Readiness Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Set a fixed height for the chart container */
        #chartContainer {
            height: 300px;
            max-width: 100%;
            position: relative;
        }

        /* Ensure the canvas fills the container without stretching */
        #financialProjectionsChart {
            width: 100%;
            height: 100%;
        }

        .hidden-download {
            display: none;
        }

        @media print {
            .no-print {
                display: none;
            }
        }
        
        .blurred-chart {
            filter: blur(1.5px);
        }

        #chartContainer .absolute {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none; /* Ensure the overlay text does not interfere with interactions */
        }


    </style>
</head>
<body class="bg-gray-100 text-gray-800">
    <div id="pdfContent" class="max-w-6xl mx-auto bg-white shadow-lg p-10 rounded-lg">
        <!-- Header Section -->
        <div class="bg-blue-900 text-white p-8 rounded-lg">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-6">
                    <img src="${profile?.company_logo}" alt="${companyName} Logo" class="h-24 object-cover shadow-lg">
                    <div>
                        <h1 class="text-4xl font-extrabold">${companyName}</h1>
                        <p class="text-xl font-medium mt-2">Stage: ${currentStage}</p>
                    </div>
                </div>
                <div class="text-center bg-blue-800 p-6 rounded-lg shadow-md">
                    <p class="text-5xl font-extrabold">${InvestmentReadinessScore}</p>
                    <p class="text-lg font-medium mt-1">Investment <br> Readiness Score</p>
                </div>
            </div>
        </div>

        <!-- Main Content Section -->
        <div class="mt-10 grid grid-cols-12 gap-10">
            <!-- Left Side (60%) -->
            <div class="col-span-7">
                <!-- Business Description -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Business Description</h3>
                    <p class="text-lg leading-relaxed">${shortDescription}</p>
                </div>
                
                <!-- Industry Sector -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Sector</h3>
                    <p class="text-lg leading-relaxed">${sector}</p>
                </div>

                <!-- Competitors -->
                <div class="mb-8 w-full">
    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Competitors</h3>
    <table class="table-auto w-full text-left border-collapse">
        <thead class="bg-gray-100">
            <tr>
                <th class="border px-6 py-2">Name</th>
                <th class="border px-6 py-2">Annual Revenue</th>
                <th class="border px-6 py-2">Total Funding</th>
                <th class="border px-6 py-2">Valuation</th>
                <th class="border px-6 py-2">Stage</th>
            </tr>
        </thead>
        <tbody>
            ${Object.keys(competitors).length > 0
                ? Object.keys(competitors).map(company => `
                <tr class="border-t border-gray-200">
                    <td class="border px-6 py-2">${company}</td>
                    <td class="border px-6 py-2">${competitors[company].annual_revenue}</td>
                    <td class="border px-6 py-2">${competitors[company].total_funding}</td>
                    <td class="border px-6 py-2">${competitors[company].valuation}</td>
                    <td class="border px-6 py-2">${competitors[company].stage}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="7" class="border px-4 py-2">No data available</td></tr>`
            }
        </tbody>
    </table>
</div>

                
                <!-- Top 5 Sector stocks -->

                
                <!-- Funding Details -->
                <div class="mb-6">
                <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Funding Details</h3>
                <table class="table-auto w-full text-left">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="border px-6 py-2">Investor Name</th>
                            <th class="border px-6 py-2">Firm Name</th>
                            <th class="border px-6 py-2">Investor Type</th>
                            <th class="border px-6 py-2">Amount</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                    ${previousFunding.length > 0
                        ? previousFunding.map(funding => `
                        <tr>
                        <td class="border px-4 py-2">${funding.investorName}</td>
                        <td class="border px-4 py-2">${funding.firmName}</td>
                        <td class="border px-4 py-2">${funding.investorType}</td>                        
                        <td class="border px-4 py-2">${funding.amountRaised}</td> 
                        </tr>
                    `).join('')
                        : `<tr><td colspan="4" class="border px-6 py-2 text-center">No information available</td></tr>`
                        }
                    </tbody>
                </table>
                </div>

                <!-- News -->
                <div class="mb-6">

                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">News</h3>

                    <table class="table-auto w-full text-left">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border px-6 py-2">Date</th>
                                <th class="border px-6 py-2">Headline</th>
                            </tr>
                        </thead>
                        <tbody id="newsContent">
                            ${newsListLatest.length > 0 ? 
                                newsListLatest.map(news => `
                                <tr class="${newsListLatest.indexOf(news) % 2 === 0 ? 'bg-gray-50' : ''}">
                                    <td class="border-t border-gray-300 px-4 py-2">${news.date}</td>
                                    <td class="border-t border-gray-300 px-4 py-2">${news.title}</td>
                                </tr>
                            `).join('')
                            :
                            `<tr><td colspan="2" class="border px-4 py-2 text-center">There is no media presence of ${companyName}</td></tr>`
                        }
                        </tbody>
                    </table>
                </div>

                

            </div>

            <!-- Right Side (40%) -->
            <div class="col-span-5">
                <!-- Key Information -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Key Information</h3>
                    <table class="table-auto w-full text-left border-collapse">
                        <tbody>
                            <tr>
                                <th class="border px-6 py-2">Founded Year</th>
                                <td class="border px-6 py-2">${incorporationDate}</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">Total Funding</th>
                                <td class="border px-6 py-2">${totalFunding}</td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Location</td>
                                <td class="border px-6 py-2">${companyProfile?.state_city || "NA"}</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">Editor's Rating</td>
                                <td class="border px-6 py-2">Coming Soon</td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Valuation</td>
                                <td class="border px-6 py-2">Coming Soon</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">Company Website</td>
                                <td class="border px-6 py-2">
                                    <a href="${companyWebsite}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                            Link
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Company Linkedin</td>
                                <td class="border px-6 py-2">
                                    <a href="${companyLinkedin}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                            Link
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">App Link</td>
                                <td class="border px-6 py-2">
                                    Android: <a href="${ctoInfo?.mobile_app_link_android}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                            Link
                                    </a>
                                    <br>
                                    IOS: <a href="${ctoInfo?.mobile_app_link_ios}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                            Link
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Financials -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Financials</h3>
                    <table class="table-auto w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="border px-6 py-2">Revenue</th>
                                <td class="border px-6 py-2">${latestRevenue.value} (as on ${latestRevenue.month})</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">EBITDA</th>
                                <td class="border px-6 py-2">Coming Soon</td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Net Profit</th>
                                <td class="border px-6 py-2">${latestProfit.value} (as on ${latestProfit.month})</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Leadership Team -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Leadership Team</h3>
                    <table class="table-auto w-full text-left border-collapse">

                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border px-6 py-2">Name</th>
                                <th class="border px-6 py-2">Designation</th>
                                <th class="border px-6 py-2">Linkedin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${founderInformation?.founder_name ? 
                                `<tr>
                                    <td class="border px-6 py-2">${founderInformation?.founder_name}</td>
                                    <td class="border px-6 py-2">Founder</td>
                                    <td class="border px-6 py-2">
                                    <a href="${founderInformation?.founder_linkedin}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                            Link
                                        </a>
                                    </td>
                                </tr>`
                                : ``
                            }
                            ${coFounders.length > 0
                                ? coFounders.map(cf => `
                                <tr>
                                    <td class="border px-6 py-2">${cf.co_founder_name}</td>
                                    <td class="border px-6 py-2">Co-Founder</td>
                                    <td class="border px-6 py-2">
                                    <a href="${cf.co_founder_linkedin}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                        Link
                                    </a>
                                    </td>
                                </tr>`).join('')
                                : `<tr>
                                <td colspan="3" class="border px-6 py-2 text-center">No information available</td>
                                </tr>`
                            }
                            <tr>
                            ${ctoInfo?.cto_name ? 
                                `<td class="border px-6 py-2">${ctoInfo?.cto_name}</td>
                                <td class="border px-6 py-2">CTO</td>
                                <td class="border px-6 py-2">
                                <a href="${ctoInfo?.cto_linkedin}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                        Link
                                    </a>
                                </td>`
                                : ``
                            }
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Valuation Trends -->
                <!--
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Valuation Trends (USD)</h3>
                    <p class="text-lg">Coming Soon</p>
                </div>
                -->

                <!-- Revenue Trends -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Revenue Trends (USD)</h3>
                    <canvas id="revenueChart"></canvas>
                </div>

                <!-- Financial Projections -->
                ${financialProjections && Object.keys(financialProjections).length > 0 
                    ? `<div class="mb-8">
                          <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Financial Projections</h3>
                          <div id="chartContainer">
                              <canvas id="financialProjectionsChart"></canvas>
                          </div>
                       </div>`
                    : `<div class="mb-8 relative">
                          <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Financial Projections</h3>
                          <div id="chartContainer" class="relative">
                              <canvas id="financialProjectionsChartDummy" class="blurred-chart"></canvas>
                              <div class="absolute inset-0 flex items-center justify-center text-center">
                                  <h3 class="text-lg font-semibold text-gray-700 bg-white bg-opacity-75 px-4 py-2 rounded">
                                      Upload financial projections to see the chart
                                  </h3>
                              </div>
                          </div>
                       </div>`
                    }
                  

                <!-- Cap Table -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Cap Table</h3>
                    <table class="table-auto w-full text-left border-collapse">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border px-6 py-2">Name</th>
                                <th class="border px-6 py-2">Designation</th>
                                <th class="border px-6 py-2">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                                ${capTable.length > 0
                                    ? capTable.map(person => `
                                <tr class="border-t border-gray-200">
                                    <td class="border px-6 py-2">${person.firstName}</td>
                                    <td class="border px-6 py-2">${person.designation}</td>
                                    <td class="border px-6 py-2">${person.percentage}%</td>
                                </tr>
                            `).join('')
                            : `<tr class="border-t border-gray-200">
                                    <td colspan="3" class="border px-6 py-2 text-center">No information available</td>
                                </tr>
                                `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- Technology Roadmap -->
                <div class="mb-6">
                      <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Technology Roadmap</h3>
                      <table class="table-auto w-full text-left">
                          <thead class="bg-gray-100">
                              <tr>
                                  <th class="border px-6 py-2">Time</th>
                                  <th class="border px-6 py-2">Initiative</th>
                                  <th class="border px-6 py-2">Impact</th>
                              </tr>
                          </thead>
                          <tbody>
                            ${
                                roadmapArray.length > 0
                                ? roadmapArray.map(tech => `
                                  <tr class="${roadmapArray.indexOf(tech) % 2 === 0 ? 'bg-gray-50' : ''}">
                                      <td class="border-t border-gray-300 px-4 py-2">${tech.Time}</td>
                                      <td class="border-t border-gray-300 px-4 py-2">${tech.Initiative}</td>
                                      <td class="border-t border-gray-300 px-4 py-2">${tech.Impact}</td>
                                  </tr>`).join('')
                                : '<tr class="border-t border-gray-200"><td colspan="3" class="px-4 py-2 text-center">No Technology Roadmap available</td></tr>'
                            }
                          </tbody>
                      </table>
                </div>

        <!-- Footer Section -->
        <div class="mt-16 text-sm text-gray-600 text-center border-t pt-8">
            <p>Date of Report Generation: ${new Date().toLocaleDateString()}</p>
            <p>Copyright © 2024 by Xellerates AI. All rights reserved.</p>
        </div>
    </div>

    <!-- Download Button -->
    <!--
    <div class="text-center mt-8 no-print">
        <button id="downloadBtn" class="bg-blue-500 text-white p-2 rounded">
            Download Report as PDF
        </button>
    </div>
    -->

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>
    <script>
        const financialProjections = ${JSON.stringify(financialProjections)};
        console.log("Financial Projections Data:", financialProjections);


        function calculateYearlyTotals(revenueProjections) {
            return revenueProjections.map(projection => {
                const yearlySums = {};
                const yearlyData = {};

                projection.yearly_data.forEach(yearData => {
                    const year = Object.keys(yearData)[0];
                    const monthlyData = yearData[year];

                    let yearlyTotal = 0;
                    monthlyData.forEach(monthObj => {
                        const month = Object.keys(monthObj)[0];
                        const value = parseFloat(monthObj[month]);
                        yearlyTotal += value;

                        if (!yearlyData[year]) {
                            yearlyData[year] = [];
                        }
                        yearlyData[year].push({ month, value });
                    });

                    yearlySums[year] = yearlyTotal;
                });

                return {
                    revenue_stream: projection.revenue_stream,
                    yearly_totals: yearlySums,
                    monthly_data: yearlyData
                };
            });
        }

        const colorPalette = [
            'rgba(255, 99, 132, 0.6)',  // Red
            'rgba(54, 162, 235, 0.6)',  // Blue
            'rgba(75, 192, 192, 0.6)',  // Green
            'rgba(255, 206, 86, 0.6)',  // Yellow
            'rgba(153, 102, 255, 0.6)', // Purple
            'rgba(255, 159, 64, 0.6)',  // Orange
            'rgba(199, 199, 199, 0.6)', // Grey
            'rgba(255, 99, 71, 0.6)',   // Tomato
            'rgba(60, 179, 113, 0.6)',  // MediumSeaGreen
            'rgba(106, 90, 205, 0.6)',  // SlateBlue
        ];


        document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const ctx1 = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ${JSON.stringify(yearlyRevenue.map(item => item.month))},
            datasets: [{
                label: 'Revenue',
                data: ${JSON.stringify(yearlyRevenue.map(item => item.value))},
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                }
            }
        }
    });

    // Initialize the dummy chart if the real financial projections are not available
    if (!financialProjections || Object.keys(financialProjections).length === 0) {
        const ctxD = document.getElementById('financialProjectionsChartDummy').getContext('2d');
        const dummyData = {
                    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                    datasets: [
                        {
                            label: 'Revenue by A',
                            data: [10, 25, 15, 35, 45], // Example data points with increases and decreases
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 3,
                            fill: true,
                            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
                        },
                        {
                            label: 'Revenue by B',
                            data: [8, 18, 10, 28, 35], // Example data points with different variations
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 3,
                            fill: true,
                            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
                        },
                        {
                            label: 'Revenue by C',
                            data: [2, 7, 5, 7, 10], // Net Profit line showing different pattern
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                            fill: true,
                            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
                        }
                    ]
                };

                // Create the chart using Chart.js
                new Chart(ctxD, {
                    type: 'line',
                    data: dummyData,
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Amount (in Millions)',
                                    color: '#4A4A4A',
                                    font: {
                                        family: 'Arial',
                                        size: 14,
                                        weight: 'bold',
                                    }
                                },
                                grid: {
                                    color: '#E0E0E0',
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Year',
                                    color: '#4A4A4A',
                                    font: {
                                        family: 'Arial',
                                        size: 14,
                                        weight: 'bold',
                                    }
                                },
                                grid: {
                                    color: '#E0E0E0',
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true, // Show the legend to differentiate the lines
                                position: 'top',
                                labels: {
                                    color: '#4A4A4A',
                                    font: {
                                        family: 'Arial',
                                        size: 12,
                                    }
                                }
                            },
                            tooltip: {
                                enabled: true, // Enable tooltips for better user interaction
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                titleFont: {
                                    family: 'Arial',
                                    size: 14,
                                    weight: 'bold',
                                },
                                bodyFont: {
                                    family: 'Arial',
                                    size: 12,
                                },
                                cornerRadius: 4,
                            },
                        },
                        responsive: true,
                        layout: {
                            padding: {
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20
                            }
                        },
                    }
                });

    }

    // Initialize the real financial projections chart if data is available
    if (financialProjections && Object.keys(financialProjections).length > 0) {
        const ctx = document.getElementById('financialProjectionsChart').getContext('2d');
        const yearlyTotals = calculateYearlyTotals(financialProjections.revenue_projections);
        const years = Object.keys(yearlyTotals[0].yearly_totals);
        const datasets = yearlyTotals.map((projection, index) => ({
            label: projection.revenue_stream,
            data: years.map(year => projection.yearly_totals[year]),
            backgroundColor: colorPalette[index % colorPalette.length],
            borderColor: colorPalette[index % colorPalette.length].replace('0.6', '1'),
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: colorPalette[index % colorPalette.length].replace('0.6', '1'),
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: colorPalette[index % colorPalette.length].replace('0.6', '1'),
        }));

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (in Millions)',
                            color: '#4A4A4A',
                            font: {
                                family: 'Arial',
                                size: 14,
                                weight: 'bold',
                            }
                        },
                        grid: {
                            color: '#E0E0E0',
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year',
                            color: '#4A4A4A',
                            font: {
                                family: 'Arial',
                                size: 14,
                                weight: 'bold',
                            }
                        },
                        grid: {
                            color: '#E0E0E0',
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#4A4A4A',
                            font: {
                                family: 'Arial',
                                size: 10, // Smaller font size for legend items
                                weight: 'bold',
                            },
                            boxWidth: 15,
                            padding: 10, // Adjusted padding to save space
                        },
                        maxHeight: 100, // Limit the height of the legend area
                    },
                    tooltip: {
                        backgroundColor: '#333',
                        titleFont: {
                            family: 'Arial',
                            size: 14,
                            weight: 'bold',
                        },
                        bodyFont: {
                            family: 'Arial',
                            size: 12,
                        },
                        footerFont: {
                            family: 'Arial',
                            size: 10,
                            style: 'italic',
                        },
                        borderColor: '#777',
                        borderWidth: 1,
                    },
                },
                responsive: true,
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
            }
        });
    }

    console.log("Charts successfully created");
});

                        

            console.log("Chart successfully created");

            // document.getElementById('downloadBtn').addEventListener('click', function () {
            //     const element = document.getElementById('pdfContent');
            //     const opt = {
            //         margin: 0.2,
            //         filename: 'InvestmentReadinessReport.pdf',
            //         image: { type: 'jpeg', quality: 0.98 },
            //         html2canvas: { scale: 2 },
            //         jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' }
            //     };
            //     html2pdf().from(element).set(opt).save();
            // });



      </script>
</body>
</html>
`

return { status: 'success', html: reportHtml };
    
};

export default generateReport;

