"use client"
import React, { useState, useEffect } from "react";
import axios from 'axios';
import * as cheerio from 'cheerio';
import generateResponse from '@/components/report/sector-analysis';
import generateFinancialResponse from '@/components/report/financial-projections';
import generateTechnologyRoadmap from '@/components/report/technology-roadmap'
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

// Function to extract the first organic search result URL
const getOrganicData = async (searchQuery) => {
    try {
      const response = await fetch(`/api/getOrganicData?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        return data.firstLink;
      } else {
        console.error("Error fetching data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

// Function to get competitors data
async function getCompetitors(companyName) {
  try {
    const link = await getOrganicData(companyName + " Traxcn");

    const competitorsUrl = link + '/competitors'; // Adjust the URL based on the actual structure
    const competitorsResponse = await axios.get(competitorsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const $competitors = cheerio.load(competitorsResponse.data);

    const competitors = [];
    $competitors('.txn--seo-tab--companies').each((index, element) => {
      if (index >= 4) return false; // Extract only the first 4 competitors

      const name = $competitors(element).find('h2 a').text().trim();
      const foundedYear = $competitors(element).find('dt:contains("Founded Year") + dd').text().trim();
      const stage = $competitors(element).find('dt:contains("Stage") + dd').text().trim();
      const funding = $competitors(element).find('dt:contains("Funding") + dd').text().trim();

      competitors.push({ name, foundedYear, stage, funding });
    });

    return competitors;

  } catch (error) {
    console.error('Error fetching competitors:', error.message);
  }
}

// Example usage:
const exampleCompetitors = [
  {
    name: '1. Greenlight',
    foundedYear: '2014',
    stage: 'Series D',
    funding: '$556M'
  },
  {
    name: '2. Junio',
    foundedYear: '2020',
    stage: 'Seed',
    funding: '$8.17M'
  },
  {
    name: '3. YPay Card',
    foundedYear: '2020',
    stage: 'Seed',
    funding: '$667K'
  },
  {
    name: '4. Yodaa',
    foundedYear: '2020',
    stage: 'Seed',
    funding: '$125K'
  }
];

// Main report generation function
const generateReport = async (
  companyProfile,
  fundingInformation,
  founderInformation,
  businessDetails,
  companyDocuments,
  ctoInfo,
  shortDescription, 
  industrySector, 
  companyName, 
  currentStage, 
  previousFunding
) => {
  
  //const competitors = await getCompetitors("FamPay"); 
  const competitors = exampleCompetitors;
  const totalFunding = previousFunding.reduce((total, funding) => total + parseFloat(funding.amountRaised || 0), 0);
  const coFounders = founderInformation?.co_founders || [];
  const newsQuery = `${companyName} news inc42 1 year`;
  let newsList = [];
  
  const currentTraction = businessDetails?.current_traction;
  const newCustomers = businessDetails?.new_Customers;
  const CAC = businessDetails?.customer_AcquisitionCost;
  const LTV = businessDetails?.customer_Lifetime_Value;

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

  const financialData = await fetchFinancials(companyProfile);
  const yearlyRevenue = financialData?.revenue.Yearly
  const latestRevenue = yearlyRevenue[yearlyRevenue.length - 1];
  const yearlyProfit = financialData?.profit.Yearly;
  const latestProfit = yearlyProfit[yearlyProfit.length - 1];
  const capTable = fundingInformation?.cap_table;
  const financialProjectionsData = companyDocuments?.financial_projections;
  const technologyRoadmapLink = ctoInfo?.technology_roadmap;

    try {
        const response = await axios.get('/api/fetch-news-no-summary', {
        params: { q: newsQuery },
        });
        newsList = response.data;


    } catch (error) {
        console.error('Error fetching news:', error);
    }

    const sector = await generateResponse(shortDescription, industrySector);
    // const financialProjections = await generateFinancialResponse(financialProjectionsData);
    const technologyRoadmap = await generateTechnologyRoadmap(technologyRoadmapLink);

    let roadmapArray = [];

    if (Array.isArray(technologyRoadmap)) {
    roadmapArray = technologyRoadmap;
    } else if (typeof technologyRoadmap === 'string') {
    try {
        roadmapArray = JSON.parse(technologyRoadmap);
    } catch (error) {
        console.error('Error parsing technologyRoadmap:', error.message);
    }
    }

    console.log('Technology Roadmap: ', technologyRoadmap); 


    //console.log("Sector: ", sector);


    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} Investment Readiness Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100 text-gray-800">
    <div id="pdfContent" class="max-w-6xl mx-auto bg-white shadow-lg p-10 rounded-lg">
        <!-- Header Section -->
        <div class="bg-blue-900 text-white p-8 rounded-lg">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-6">
                    <img src="https://via.placeholder.com/100" alt="${companyName} Logo" class="h-24 w-24 object-cover rounded-full shadow-lg">
                    <div>
                        <h1 class="text-4xl font-extrabold">${companyName}</h1>
                        <p class="text-xl font-medium mt-2">Stage: ${currentStage}</p>
                    </div>
                </div>
                <div class="text-center bg-blue-800 p-6 rounded-lg shadow-md">
                    <p class="text-5xl font-extrabold">${tractionScore}</p>
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
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Competitors</h3>
                    <table class="table-auto w-full text-left border-collapse">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border px-6 py-2">Name</th>
                                <th class="border px-6 py-2">Founded Year</th>
                                <th class="border px-6 py-2">Stage</th>
                                <th class="border px-6 py-2">Funding</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${competitors.map(comp => `
                                <tr class="border-t border-gray-200">
                                    <td class="border px-6 py-2">${comp.name}</td>
                                    <td class="border px-6 py-2">${comp.foundedYear}</td>
                                    <td class="border px-6 py-2">${comp.stage}</td>
                                    <td class="border px-6 py-2">${comp.funding}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
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
                    ${previousFunding.map(funding => `
                        <tr>
                        <td class="border px-4 py-2">${funding.investorName}</td>
                        <td class="border px-4 py-2">${funding.firmName}</td>
                        <td class="border px-4 py-2">${funding.investorType}</td>                        
                        <td class="border px-4 py-2">${funding.amountRaised}</td> 
                        </tr>
                    `).join('')}
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
                          <tbody>
                            ${
                              newsList.length > 0
                                ? newsList.map(news => `
                                  <tr class="${newsList.indexOf(news) % 2 === 0 ? 'bg-gray-50' : ''}">
                                      <td class="border-t border-gray-300 px-4 py-2">${news.date}</td>
                                      <td class="border-t border-gray-300 px-4 py-2">${news.title}</td>
                                  </tr>`).join('')
                                : `<tr><td colspan="2" class="px-4 py-2" > Currently, there is no media presence of ${companyName} </td></tr>`
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
                                <th class="border px-6 py-2">Founded Year:</th>
                                <td class="border px-6 py-2">2020</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">Total Funding:</th>
                                <td class="border px-6 py-2">${totalFunding}</td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Location:</td>
                                <td class="border px-6 py-2">${companyProfile?.state_city || "NA"}, ${companyProfile?.country.label || "NA"}</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">Editor's Rating:</td>
                                <td class="border px-6 py-2">Coming Soon</td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Valuation:</td>
                                <td class="border px-6 py-2">Coming Soon</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">Mobile Downloads:</td>
                                <td class="border px-6 py-2">30M</td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Employee Count:</td>
                                <td class="border px-6 py-2">1,747 (as on May 31, 2024)</td>
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
                                <th class="border px-6 py-2">Revenue:</th>
                                <td class="border px-6 py-2">${latestRevenue.value} (as on ${latestRevenue.month})</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-gray-50">
                                <th class="border px-6 py-2">EBITDA:</th>
                                <td class="border px-6 py-2">Coming Soon</td>
                            </tr>
                            <tr>
                                <th class="border px-6 py-2">Net Profit:</th>
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
                            <tr>
                                <td class="border px-6 py-2">${founderInformation?.founder_name}</td>
                                <td class="border px-6 py-2">Founder</td>
                                <td class="border px-6 py-2">
                                <a href="${founderInformation?.founder_linkedin}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                        Link
                                    </a>
                                </td>
                            </tr>
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
                                : '<tr></tr>'
                            }
                        </tbody>
                    </table>
                </div>

                <!-- Valuation Trends -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Valuation Trends (USD)</h3>
                    <p class="text-lg">Coming Soon</p>
                </div>

                <!-- Revenue Trends -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-4">Revenue Trends (USD)</h3>
                    <canvas id="revenueChart"></canvas>
                </div>
                <script>
                    const ctx = document.getElementById('revenueChart').getContext('2d');
                    const revenueChart = new Chart(ctx, {
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
                </script>

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
                            ${capTable.map(person => `
                                <tr class="border-t border-gray-200">
                                    <td class="border px-6 py-4">${person.firstName}</td>
                                    <td class="border px-6 py-4">${person.designation}</td>
                                    <td class="border px-6 py-4">${person.percentage}%</td>
                                </tr>
                            `).join('')}
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
                                : '<tr><td colspan="2" class="px-4 py-2">No Technology Roadmap available.</td></tr>'
                            }
                          </tbody>
                      </table>
                </div>

        <!-- Footer Section -->
        <div class="mt-16 text-sm text-gray-600 text-center border-t pt-8">
            <p>Date of Report Generation: ${new Date().toLocaleDateString()}</p>
            <p>Copyright © 2024 by Xellerates AI. All rights reserved.</p>
        </div>
        
        <!--
        <div class="mt-8 text-center">
              <button id="downloadBtn" class="bg-blue-500 text-white p-2 rounded">
                  Download Report as PDF
              </button>
          </div>
        -->
    </div>


    <script>
        document.getElementById('downloadBtn').addEventListener('click', async function() {
            const reportHtml = document.getElementById('pdfContent').outerHTML;
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ htmlContent: reportHtml }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'InvestmentReadinessReport.pdf');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } else {
                console.error('Failed to generate PDF');
            }
        });
      </script>
</body>
</html>`;
    
};

export default generateReport;

