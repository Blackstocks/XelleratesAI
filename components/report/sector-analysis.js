import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const TEMPLATE = `You are a startup sector analyser professor at a top university. Your task is to analyse and give the detailed sector analysis of a startup, the business description and the sector of the startup is given. 
You should:
1. Understand the Business Description of the startup.
2. Now carefully give the detailed sector analysis in the below format.
 Broad_sector > narrowed_sector > more narrowed sector" 

**INSTRUCTIONS**
- Don't be overconfident and don't hallucinate.
- You should give output in only 75-100 words.
- Try giving short answers.
- You should only output the sector.

Use the following pieces of context to answer the user's question.
==============================
Business Description: {businessDescription}
Broad Sector: {sector}
==============================

One Example of your task is below: (Use this only as reference)
Business Description: Application-based platform offering on demand grocery delivery service. The platform allows users to order food, groceries, drinks, beauty and wellness products, home and household essentials. The application is available for Android and iOS platforms in the Google Play Store and Apple Store.
Broad Sector: Food and Agriculture Tech

Your Output:  Food and Agriculture Tech > Online Grocery > B2C Ecommerce > MultiCategory > Retailer > Own Delivery Fleet > Ultra Fast Delivery

Now take a deep breath and proceed with the task.
`;

const generateResponse = async (businessDescription, sector) => {
    const genAI = new GoogleGenerativeAI("AIzaSyC5SHITdbn39r46lODI_6YFRIo3Z6zo_5Y");
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const prompt = TEMPLATE
        .replace('{businessDescription}', businessDescription)
        .replace('{sector}', sector);

    // Ensure correct method to generate content
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
};

export default generateResponse;


// const generateResponse = async (businessDescription, sector) => {
//     const genAI = new GoogleGenerativeAI("AIzaSyD0pgiWafpWS2GiosNo4QSY0ok9a7sv72o");
//     const model = genAI.getGenerativeModel({
//         model: "gemini-1.5-flash",
//     });

//     const chatSession = model.startChat({});
//     const prompt = TEMPLATE
//         .replace('{businessDescription}', businessDescription)
//         .replace('{sector}', sector);

//     // Ensure correct method to generate content
//     //const result = await model.generateContent(prompt);
//     const result = await chatSession.sendMessage(prompt);

//     return result;
// };

// export default generateResponse;