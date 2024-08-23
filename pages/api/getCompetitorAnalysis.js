import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const fetchCompetitorData = async (companyName, shortDescription, targetAudience, uspMoat) => {
  try {
    const PTEMPLATE = `
Request:
Please identify the top 7 competitors of ${companyName}. The competitors should be companies that are also involved in "${shortDescription.toLowerCase().replace(/we are|our|we/i, `${companyName} is`)}". The competitors must be relevant to ${companyName}’s focus on this specific niche, USP/MOAT of the ${companyName} is: ${uspMoat}. Target Audience: ${targetAudience}.

For each competitor, please provide the following data:
1. **Total Funding** (if available)
2. **Annual Revenue** (if available)
3. **Valuation** (if available)
4. **Stage** (Investment Round Name - e.g., Series A, B, Pre-seed, Public, etc. )

Sources to consider:
- Competitors section on the company page of ${companyName} on platforms like Traxcn.com, Crunchbase.com, Pitchbook.com, Craft.co, Semrush.com or any other sources you find on internet.

Important Note:
- Ensure that the competitors are directly relevant based on the business description, USP/MOAT and Target Audience that is provided above. Do not create any hypothetical competitors. 
- If you do not find any relavent competitors just return NA.
- Please focus on finding companies that are direct competitors based on their role in "${shortDescription.toLowerCase().replace(/we are|our|we/i, `${companyName} is`)}", rather than just any company in the broader industry space.
- In Stage you have to find the Investment Round Name (like Series A, B, Pre-seed, Public, etc.)
`;

    const options = {
      method: 'POST',
      url: 'https://api.perplexity.ai/chat/completions',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      data: {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Be precise and concise. Search the web thoroughly and then answer.',
          },
          {
            role: 'user',
            content: PTEMPLATE,
          },
        ],
      },
    };

    const response = await axios.request(options);
    const content = response.data.choices[0].message.content;
    console.log("CONTENT PERPL: ", content);
    return content;
  } catch (error) {
    console.error('Error fetching competitor data:', error);
    throw error;
  }
};

const structureCompetitionData = async (companyName, shortDescription, targetAudience, uspMoat) => {
  const GTEMPLATE = `
    You are given the data of competitor analysis of a startup. Your task is to simply make a json file of the data. You should not add anything(data) by yourself. The format of the json file is below:

    {
        [
            "company_name": {
                "annual_revenue": "The annual revenue of the company",
                "total_funding": "The total funding of the company",
                "valuation": "The valuation of the company",
                "stage": "The stage of the company",
                },
            "company_name": {
                "annual_revenue": "The annual revenue of the company",
                "total_funding": "The total funding of the company",
                "valuation": "The valuation of the company",
                "stage": "The stage of the company",
                },
            
            ...// and so on
        ]
    }

   INSTRUCTIONS:
    Output Format:
    1. You should output only the key values without any additional context.
    - For financial data, include the appropriate currency symbol. 
    - Example: If the text is "5333% increase (5333 employees)", your response should include "employees": "5333".
    2. Company Name:
    -Extract and use only the name of the startup/company.
    -If the name is followed by additional descriptive text, such as in "Instamart (Swiggy's grocery service)", only "Instamart" should be used.
    3. Stage:
    -Only include the specific funding or operational stage of the company, like "Series F" or "Public".
    -The output should not include additional text or context. For example:
        "Private (Series F)" should be output as "Series F".
        "Public (NASDAQ)" should be output as "Public".
    -The correct output should only be one of the following formats:
        "Series-X" (where X is a stage like A, B, C, etc.)
        "Public"
        "Pre-Seed", "Seed", "Alpha", "Beta", etc.
    4.Currency Conversion:
    - Convert all financial values to USD.
    - For example, ₹1.4 billion should be converted to $16.87M.
    - Use the following abbreviations:
        M for Million
        B for Billion
        K for Thousand
    5. Data Availability Order:
    - Arrange the companies in descending order based on the amount of available data.
    - Companies with the most data should appear first in the list, followed by those with less data.
    6. Ensure Accuracy:
    - Ensure that each field is extracted and formatted precisely as instructed.
    - Do not omit or incorrectly modify the stage information. For example, "Private (Series G)" should be corrected to "Series G".
    - If the information is not available then STRICTLY ONLY specify it as NA.


    The data of the competitors of the company is:
    {content}

    Now, take a deep breath and proceed with the task.
  `;

  try {
    const content = await fetchCompetitorData(companyName, shortDescription, targetAudience, uspMoat);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = GTEMPLATE.replace('{content}', content);

    const result = await model.generateContent(prompt);

    console.log("RESPONSE GEMINI: ", result.response.text());
    const jsonResponse = JSON.parse(result.response.text());

    return jsonResponse;
  } catch (error) {
    console.error("Error generating structured competition data:", error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { companyName, shortDescription, targetAudience, uspMoat } = req.body;

    try {
      const data = await structureCompetitionData(companyName, shortDescription, targetAudience, uspMoat);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to generate competitor analysis.' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed.' });
  }
}
