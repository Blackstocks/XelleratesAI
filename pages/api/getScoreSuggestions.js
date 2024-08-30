import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";


const scoreSuggestions = async (shortDescription, targetAudience, uspMoat, technologyRoadmap, tractionDetails) => {
    const TEMPLATE = `
    You are a top startup investment analyser. Your task is to analyse the given startup and its informatin and then give 3 suggestions to improve the investment readiness score.

    You have to analyse the startup details thoroughly and then give suggestions focused on improving traction so that the startup becomes more investment ready. Your suggestions should strictly be two points on improving traction and and one point on technology roadmap.

    Below are the details about the startup:
    ** Business Description**  ${shortDescription}
    ** USP/MOAT** ${uspMoat}
    ** Target Audience ** ${targetAudience}
    ** Traction Details ** ${tractionDetails}
    ** Technology Roadmap ** ${technologyRoadmap}

    You have to give output strictly in below JSON format:
    {   suggestions: ["point1",
    "point2",
    "point3",
    ....// and so on
    ]
    }

    **IMPORTANT NOTE**
    - You should give only 3 points.
    - Each point should be one line only.
    - Each point should be concise and short.
    - Do not haluciante and do not provide false suggestions. You should only give suggestions from the provided data.
    - Your suggestions should strictly be two points on improving traction and and one point on technology roadmap.

    Now take a deep breadth, and proceed with the task.
    `
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0,
          },
        });
    
        const result = await model.generateContent(TEMPLATE);
    
        console.log("RESPONSE GEMINI for Suggestions: ", result.response.text());
        const jsonResponse = JSON.parse(result.response.text());
    
        return jsonResponse;
      } catch (error) {
        console.error("Error generating structured competition data:", error);
        throw error;
      }

}

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { shortDescription, targetAudience, uspMoat, technologyRoadmap, tractionDetails } = req.body;
  
      try {
        const data = await scoreSuggestions(shortDescription, targetAudience, uspMoat, technologyRoadmap, tractionDetails);
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to generate suggestions.' });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed.' });
    }
  }