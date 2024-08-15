const xlsx = require('xlsx');
const path = require('path');

const TEMPLATE = `
You are an expert data extractor professor at a top university. Your task is to carefully analyse the Excel file and report the finacial projects year on year.

You should:
1. Carefully analyse the financial projections sheet. We have use xlsx.readFile() Java Script function to read the excel file so you should analyse it correctly and carefully.
2. Identify the total or individual item revenues of each year (if present). 

Now, Go through the data line by line and carefully analyse everything and put it in a json file in below format:
{
    [
        { "year": "FYXX",
            "total_revenue": "Y"
        },
        { "year": "FYXX",
            "total_revenue": "Y"
        }
    ]
}


Where:
- "year" is the year of the corresponding total revenue. You should report this in FYXX format. (Ex.- FY24, FY25, etc.)
- "total_revenue" is the value of total revenue (in numbers) of that particular year. If there are revenues of individual item given then you should report the toal revenue by summing the revenues of all. If total revenue is given then you should only report the toal revenue.

**INSTRUCTIONS**:
- Do not halucinate. Only use the information provided.
- Report the numbers as they are in the Excel file/Date.
- You should only output the json file.
- Note that the orientation of data may or may not be the clear. You need to thoroughly analyse the structure of the Data first (meaning how is the data presented).
- It is possible that the numbers of the revenue would be normalised. Example: There is written somewhere in the data - Figures in	 1,00,000. And the revenue number might be 25, 27, 0.46 etc. So you should report the numbers as number*100000.

** Here is one example for your reference: **
{
    [
        { "year": "FY24",
            "total_revenue": "10000000"
        },
        { "year": "FY25",
            "total_revenue": "25000000"
        }
    ]
}

The data is below:
{data}

Take a deep breath and solve the problem step by step.
`




// const filePath = path.resolve(__dirname, 'your-excel-file.xlsx');
// const result = selectRevenueSheet(filePath);

// console.log(`Selected Sheet: ${result.sheetName}`);
// console.log('Sheet Data:', result.data);

const generateFinancialResponse = async (financialProjectionData) => {
    // Make sure to include these imports:
    // import { GoogleGenerativeAI } from "@google/generative-ai";
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        candidateCount: 1,
        stopSequences: ["x"],
        maxOutputTokens: 20,
        temperature: 1.0,
        responseMimeType: "applcation/json",
    },
    });

    const prompt = TEMPLATE
        .replace('{data}', financialProjectionData)

    const result = await model.generateContent(
    "Tell me a story about a magic backpack.",
    );
    console.log(result.response.text());
}

export default generateFinancialResponse;