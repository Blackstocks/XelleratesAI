import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const TEMPLATE = `You are a startup sector analyser professor at a top university. Your task is to analyse and give the detailed sector analysis of a startup, the business description and the sector of the startup is given.You should:
1. Understand the Business Description of the startup.
2. Now carefully give the detailed sector analysis in the below format.
 Broad_sector > narrowed_sector > more narrowed sector" 

**INSTRUCTIONS**
- Dont be overconfident and donthallucinate.
- You should give output in only 75-100 words.
- Try giving short answers.
- You should only output the sector.

Use the following pieces of context to answer the user's question.
==============================
Business Description: {businessDescription}
Broad Sector: {sector}
==============================

One Example of your task is below: (Use this only as referecne)
Business Description: Application-based platform offering on demand grocery delivery service. The platform allows users to order food, groceries, drinks, beauty and wellness products, home and household essentials. The application is available for Android and iOS platforms in the Google Play Store and Apple Store.
Broad Sector: Food and Agriculture Tech

Your Output:  Food and Agriculture Tech > Online Grocery > B2C Ecommerce > MultiCategory > Retailer > Own Delivery Fleet > Ultra Fast Delivery
`

const generateResponse = async (businessDescription, sector) => {

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        candidateCount: 1,
        maxOutputTokens: 200,
        temperature: 1.0,
        responseMimeType: "application/text",
        "top_p": 0.95,
        "top_k": 64,
    },
    });

    const promtp = TEMPLATE
        .replace('{businessDescription}', businessDescription)
        .replace('{sector}', sector);


    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    const answer = result.response.text;

    return answer;
};

export default generateResponse;