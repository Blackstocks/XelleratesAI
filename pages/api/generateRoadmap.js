import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Function to read Excel file
const readExcelFile = async (arrayBuffer) => {
  const XLSX = require('xlsx');
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data;
};

// Function to read PDF file
const readPdfFile = async (arrayBuffer) => {
  const data = await pdfParse(arrayBuffer);
  return data.text;
};

// Function to read Word file (.docx)
const readWordFile = async (arrayBuffer) => {
  try {
    const { value: text } = await mammoth.extractRawText({ buffer: arrayBuffer });
    return text;
  } catch (error) {
    throw new Error('Error processing .docx file: ' + error.message);
  }
};

// Function to determine file type and read accordingly
const readFileContent = async (fileUrl) => {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const fileType = fileUrl.split('.').pop().toLowerCase();
  const arrayBuffer = response.data;

  let fileContent;

  switch (fileType) {
    case 'xlsx':
    case 'xls':
      fileContent = await readExcelFile(arrayBuffer);
      break;
    case 'pdf':
      fileContent = await readPdfFile(arrayBuffer);
      break;
    case 'docx':
      fileContent = await readWordFile(arrayBuffer);
      break;
    default:
      throw new Error('Unsupported file type');
  }

  return fileContent;
};

const generateResponse = async (fileContent) => {
  const promptTemplate = `
    You are a startup technology roadmap analyzer professor at a top university. Your task is to analyze and give the detailed technology roadmap of a startup.
    You should:
    1. Understand the given Technology Roadmap of the startup.
    2. Now carefully give the detailed Technology Roadmap analysis in the below json format with following fields.
        Time, Initiative, Impact

    **INSTRUCTIONS**
    - Don't be overconfident and don't hallucinate.
    - Try giving short answers.
    - You should only return the json file

    Use the following pieces of context to answer the user's question.
    ==============================
    Technology Roadmap: {technologyRoadmap}
    ==============================

    One Example of your task is below: (Use this only as reference)
    Technology Roadmap: "2024: Platform Optimization & User Experience Enhancement
        Q1:

        Mobile App Redesign: Launch a refreshed UI/UX to improve user engagement and retention.
        Personalized Recommendations: Integrate machine learning models to offer personalized restaurant and dish recommendations based on user behavior and preferences.
        Q2:

        Advanced Search Capabilities: Deploy natural language processing (NLP) to improve search accuracy, enabling users to search for specific cuisines, dietary preferences, and real-time deals.
        Seamless Payment Integration: Expand partnerships with fintech providers to enable instant payment options and introduce "Pay Later" features.
        Q3:

        AI-Powered Customer Support: Implement AI-driven chatbots for handling common customer queries and enhancing customer service response times.
        Faster Delivery Algorithms: Optimize delivery routes using AI to reduce average delivery time by 15%.
        Q4:

        Cloud Kitchen Integration: Launch an API for cloud kitchens to integrate directly with Zomato's platform for order management and inventory tracking.
        Food Waste Management: Develop a system for real-time monitoring of food waste in partnership with sustainability NGOs.
        2025: Expansion & New Services
        Q1:

        Global Expansion Tools: Roll out scalable, multi-language support across the platform to support expansions into new regions.
        Zomato Pro+ Launch: Introduce a premium subscription service offering exclusive deals, zero delivery fees, and priority customer support.
        Q2:

        AR Food Experiences: Implement augmented reality features to allow users to see a virtual representation of dishes before ordering.
        Dynamic Pricing Algorithms: Develop dynamic pricing strategies based on demand, time of day, and restaurant capacity.
        Q3:

        Zomato Grocery: Expand Zomato’s reach into grocery delivery with real-time inventory management, optimized for perishable goods.
        Hyper-Local Marketing: Integrate location-based marketing tools to offer hyper-local deals and promotions.
        Q4:

        Sustainability Initiatives: Launch a carbon footprint tracker for users to understand the environmental impact of their food choices.
        Blockchain for Food Safety: Begin piloting blockchain technology to ensure transparency and traceability in the food supply chain.
        2026: AI & Automation
        Q1:

        Predictive Ordering: Develop AI-driven predictive models that suggest reordering of favorite meals or groceries based on user history and seasonal trends.
        Automated Delivery Drones: Start pilot programs for drone deliveries in collaboration with government bodies for regulatory approvals.
        Q2:

        Advanced AI Analytics: Integrate advanced AI tools for predictive analytics, enabling restaurants to optimize menus based on real-time data.
        Food Delivery Robots: Deploy food delivery robots in high-density urban areas, reducing reliance on human delivery personnel.
        Q3:

        User Health Integrations: Partner with health tech startups to offer health tracking and meal recommendations that align with users' fitness goals.
        Voice Command Ordering: Implement voice command features for seamless ordering through smart home devices.
        Q4:

        Smart Kitchen Technologies: Introduce smart kitchen solutions for cloud kitchens to improve efficiency and reduce operating costs.
        Global Sustainability Goals: Set and start working towards specific sustainability targets, such as reducing carbon emissions by 20% by 2028."


Your Output:  {
[
    {
        "Time": "2024 Q1",
        "Initiative": "App Redesign",
        "Impact": "Boost engagement"
    },
    {
        "Time": "2024 Q1",
        "Initiative": "Personalized Recs",
        "Impact": "Enhance satisfaction"
    },
    {
        "Time": "2024 Q2",
        "Initiative": "Advanced Search",
        "Impact": "Improve search"
    },
    {
        "Time": "2024 Q2",
        "Initiative": "Payment Integration",
        "Impact": "Increase convenience"
    },
    {
        "Time": "2024 Q3",
        "Initiative": "AI Support",
        "Impact": "Speed up service"
    },
    {
        "Time": "2024 Q3",
        "Initiative": "Faster Delivery",
        "Impact": "Cut delivery time"
    },
    {
        "Time": "2024 Q4",
        "Initiative": "Cloud Kitchen API",
        "Impact": "Streamline orders"
    },
    {
        "Time": "2024 Q4",
        "Initiative": "Waste Management",
        "Impact": "Reduce waste"
    },
    {
        "Time": "2025 Q1",
        "Initiative": "Expansion Tools",
        "Impact": "Support global reach"
    },
    {
        "Time": "2025 Q1",
        "Initiative": "Zomato Pro+",
        "Impact": "Boost loyalty"
    },
    {
        "Time": "2025 Q2",
        "Initiative": "AR Experiences",
        "Impact": "Enhance interaction"
    },
    {
        "Time": "2025 Q2",
        "Initiative": "Dynamic Pricing",
        "Impact": "Optimize pricing"
    },
    {
        "Time": "2025 Q3",
        "Initiative": "Zomato Grocery",
        "Impact": "Expand offerings"
    },
    {
        "Time": "2025 Q3",
        "Initiative": "Local Marketing",
        "Impact": "Boost local deals"
    },
    {
        "Time": "2025 Q4",
        "Initiative": "Sustainability",
        "Impact": "Track carbon"
    },
    {
        "Time": "2025 Q4",
        "Initiative": "Blockchain Safety",
        "Impact": "Ensure transparency"
    },
    {
        "Time": "2026 Q1",
        "Initiative": "Predictive Ordering",
        "Impact": "Suggest reorders"
    },
    {
        "Time": "2026 Q1",
        "Initiative": "Delivery Drones",
        "Impact": "Innovate delivery"
    },
    {
        "Time": "2026 Q2",
        "Initiative": "AI Analytics",
        "Impact": "Optimize menus"
    },
    {
        "Time": "2026 Q2",
        "Initiative": "Delivery Robots",
        "Impact": "Reduce human work"
    },
    {
        "Time": "2026 Q3",
        "Initiative": "Health Integration",
        "Impact": "Align with fitness"
    },
    {
        "Time": "2026 Q3",
        "Initiative": "Voice Ordering",
        "Impact": "Simplify ordering"
    },
    {
        "Time": "2026 Q4",
        "Initiative": "Smart Kitchens",
        "Impact": "Improve efficiency"
    },
    {
        "Time": "2026 Q4",
        "Initiative": "Global Goals",
        "Impact": "Cut carbon 20%"
    }
]
}


    Now take a deep breath and proceed with the task.
    The Technology Roadmap is:
    Data: ${JSON.stringify(fileContent)}
  `;

  const genAI = new GoogleGenerativeAI("AIzaSyC5SHITdbn39r46lODI_6YFRIo3Z6zo_5Y");
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 1.0,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(promptTemplate);
  // Parse the response as JSON
  try {
    const jsonResponse = JSON.parse(result.response.text());
    return jsonResponse;
  } catch (error) {
    throw new Error('Failed to parse JSON response: ' + error.message);
  }
};

export default async function handler(req, res) {
  try {
    const { fileUrl } = req.body;
    const fileContent = await readFileContent(fileUrl);
    const roadmap = await generateResponse(fileContent);
    res.status(200).json(roadmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
