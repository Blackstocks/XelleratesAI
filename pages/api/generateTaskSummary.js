const { GoogleGenerativeAI } = require('@google/generative-ai');

const TEMPLATE = `
You are an expert Task summarizer.

Your task is to analyze and summarize the tasks of an Investor. 

** INSTRUCTIONS **
1. You should always give concise responses. 
2. Give the response as plain text, without any * characters.
3. If there is insufficient information (meaning there are no tasks) then your response should be "You don't have any tasks yet. You can add a new task by clicking the + button in the board or you can start by adding a new board."
4. If the startup name for any task is not available in the tasks then you should not make a startup name by yourself.
5. You should only response with the information available. You shouldn't hallucinate as this tasks is for the professional purpose.

Example Output: You have an ongoing financial analysis for Startup A due in 7 days, and a strategy session with Startup E in 4 days to discuss scaling. Market research for Startup C is in progress with 10 days left, while your quarterly review with Startup D needs attention in the next 2 days.

The following are the tasks:
{information}

Now take a deep braadth and give the output.
`;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log("Request Body:", req.body);
      const { tasks } = req.body;

      // Constructing the dynamic information to be injected into the prompt
      const taskInformation = tasks.map((column, columnIndex) => {
        return `\n${columnIndex + 1}. **Column: ${column.columnName}**\n` +
          column.tasks.map((task, taskIndex) => {
            return `   - **Task ${taskIndex + 1}:** ${task.title}\n` +
              `     - **Description:** ${task.description}\n` +
              `     - **Start Date:** ${task.startDate}\n` +
              `     - **Due Date:** ${task.dueDate}\n`;
          }).join('\n');
      }).join('\n');

      // Inject the constructed task information into the template
      const prompt = TEMPLATE.replace('{information}', taskInformation);
      
      console.log("PROMPT: ", prompt);
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are a professional Task Summarizer. Your name is Zephyr. You are the AI Assistant of XelleratesAI. Limit all responses to 100 words and always give concise responses.",
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log("\n\nRESPONSE: ", responseText);

      // Return the generated summary to the client
      res.status(200).json({ "summary": responseText });
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ error: "Failed to generate summary. Please try again later." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
