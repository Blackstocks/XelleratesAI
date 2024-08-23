import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const collegeTier = async (collegeName) => {
    const GTEMPLATE = `
      You are a top college finder. Your task is to determine if the college is a Tier-1 college from India or a foreign university.
      The Tier-1 colleges in India are: IITs, IIITs, BITS, NSUT, DTU, NITs only.

      You should output in json in below format only.
      **Format**
      {
        'type': 'T1' | 'Foreign' | 'NA'
      }

      **NOTE**:
        1. If it is a foreign College you should return Foreign.
        2. If it is Tier-1 college you should return T1.
        3. Else return NA.

      Now, take a deep breath and proceed with the task. The tier of college you need to indetify is ${collegeName}.
    `;
  
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
  
      const prompt = GTEMPLATE
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
      const { collegeName } = req.body;
  
      try {
        const data = await collegeTier(collegeName);
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to generate competitor analysis.' });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed.' });
    }
  }
  