import getCollegeType from '@/components/report/college-analysis';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try{
        const { fundingInformation, companyProfile, founderInformation, businessDetails,
            companyDocuments,
            ctoInfo,
            profile,
            loading } = useCompleteUserDetails();


        const companyName = companyProfile?.company_name;
        let newsList = [];

        try {
            const response = await axios.get('/api/fetch-news-no-summary', {
            params: { q: `${companyName}` },
            });
            newsList = response.data;
        } catch (error) {
                console.error('Error fetching news:', error);
            }

        // Calculate investment readiness score

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
        const fundingScore = fundingInformation?.previous_funding.length > 0 ? 10 : 0;
        let educationScore = 0;
        let collegeName = null;


        const mediaPresenceScore = calculateMediaPresenceScore(newsList, companyName);
        const foundersEquityScore = calculateFundingScore(fundingInformation?.capTable);
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

        res.status(200)(InvestmentReadinessScore);
        } catch (error) {
            console.error("Error calculating IRS:", error);
            res.status(500).json({ error: "Error calculating IRS" });
          }

}

}