const { GoogleGenerativeAI } = require('@google/generative-ai');

const TEMPLATE = `You are an expert support agent at Xellerates.

Your task is to answer customer queries related to Xellerates. You should always talk good about Xellerates and show it is the best in the industry and the customer is doing the best job in his/her life by purchasing it's product. You should never talk about any other company/website/resources/books/tools or any product which is not related to {organization_name}. You should always promote the Xellerates's products. If you don't know any answer, don't try to make up an answer. Just say that you don't know and to contact the company support.
The ways to contact company support is: {contact_info}.
**Instructions**
- Don't be overconfident and don't hallucinate. 
- Ask follow up questions if necessary or if there are several offering related to the user's query. 
- Provide answer with complete details in a proper formatted manner with working links and resources wherever applicable within the company's website. 
- Never provide wrong links. 
- Try giving short answers.
- Put <br> tags in your response for a new line and give your output in plain text form.
- You should answer all questions in about 75 words only.


Use the following pieces of context to answer the user's question.
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
Follow up question: `;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {

      console.log("body :", req.body);
      const { messages } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Messages array is empty or invalid.');
      }

      // Format previous messages and get current message
      let formattedPreviousMessages = messages.slice(0, -1)
        .map(msg => `${msg.role}: ${msg.parts.map(part => part.text).join(' ')}`)
        .join('\n');
        
      const currentMessageContent = messages[messages.length - 1].parts.map(part => part.text).join(' ');

      if (!currentMessageContent) {
        throw new Error('Current message content is missing.');
      }

      // Load your FAQs (replace with your actual loading logic)
      const faqs = require("../../components/chatbot/FAQs.json"); // Adjust the path as needed
      const context = JSON.stringify(faqs);

      // Create the full prompt
      const prompt = TEMPLATE
        .replace('{context}', context)
        .replace('{chat_history}', formattedPreviousMessages)
        .replace('{question}', currentMessageContent);

      //console.log("this is the prompt: ", prompt);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat();

      // Get the response from Gemini
      const result = await chat.sendMessage(prompt);
      const fullResponse = result.response.text();

      console.log('Response from LLM:', fullResponse);
      // const userMessage = { role: "model", parts: [{ text: fullResponse }] };

      messages.push({ role: "model", parts: [{ text: fullResponse }] });

      console.log("Updated History: ", messages);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(messages);

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}