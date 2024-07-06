import { PDFDocument, rgb } from 'pdf-lib';
import nodemailer from 'nodemailer';

const generatePDF = async () => {
  const content = `
    Startup Evaluation Report
    Financials
    1.1 Startup Valuation
    The startup's current valuation is based on various factors including market potential, financial performance, and comparable companies. The most recent valuation conducted by [Valuation Firm] values the company at $[Amount] million. This valuation considers a detailed analysis of projected revenues, growth rate, and market trends.
    1.2 Cash Flows
    The startup's cash flow statement for the past three years shows the following trends:
    - Year 1: Positive cash flow of $[Amount] million
    - Year 2: Positive cash flow of $[Amount] million
    - Year 3: Negative cash flow of $[Amount] million (due to heavy investment in R&D and marketing)
    The projections for the next three years indicate a return to positive cash flow, with expected values of $[Amount] million, $[Amount] million, and $[Amount] million respectively.
    1.3 Management Information System (MIS) Data
    The MIS reports provide detailed insights into the financial health of the startup. Key metrics include:
    - Monthly revenue: $[Amount]
    - Monthly expenses: $[Amount]
    - Profit margins: [Percentage]%
    - Customer acquisition cost (CAC): $[Amount]
    - Lifetime value of a customer (LTV): $[Amount]
    These metrics show a healthy growth trajectory and efficient cost management.
    1.4 Previous Funding Rounds
    The startup has raised funds in multiple rounds, including:
    - Seed Round: $[Amount] from [Investor Names]
    - Series A: $[Amount] from [Investor Names]
    - Government Grants: $[Amount] from [Granting Institution]
    The funds have been primarily used for product development, market expansion, and team building.
    Legal
    2.1 Intellectual Property
    The startup holds [Number] patents and [Number] trademarks. The intellectual property portfolio is robust, covering key aspects of their technology and branding. All IP is registered and up-to-date, with no pending litigations or disputes.
    2.2 Compliance
    The startup complies with all relevant local and international regulations. Regular audits are conducted to ensure adherence to industry standards. There are no outstanding legal issues or compliance breaches reported.
    2.3 Contracts
    All major contracts with suppliers, customers, and partners have been reviewed. The terms are favorable and do not pose any significant risk to the startup. Key contracts include:
    - Supplier agreements: [Brief details]
    - Customer agreements: [Brief details]
    - Partnership agreements: [Brief details]
    Technology
    3.1 Product Development
    The startup has developed a [Product/Service], which is currently in [Development/Production] stage. The technology stack includes [Technologies Used]. Regular updates and improvements are made based on user feedback and market trends.
    3.2 Technical Team
    The technical team consists of [Number] engineers, designers, and product managers. Key team members include:
    - [Name], [Role], [Experience]
    - [Name], [Role], [Experience]
    The team has a strong track record of delivering high-quality products on time.
    3.3 Innovation and R&D
    The startup invests significantly in R&D, with a focus on innovative solutions and staying ahead of the competition. Recent R&D initiatives include [Brief details of R&D projects].
    Business
    4.1 Market Analysis
    The target market for the startup's product/service is [Market Size] with a projected growth rate of [Percentage]%. The competitive landscape includes [Major Competitors], with the startup having a competitive edge due to [Unique Selling Points].
    4.2 Business Model
    The startup operates on a [Business Model], generating revenue through [Revenue Streams]. The business model is scalable and adaptable to changing market conditions.
    4.3 Marketing and Sales
    The marketing strategy includes [Marketing Channels], targeting [Customer Segments]. The sales team consists of [Number] members, achieving a monthly sales growth of [Percentage]%. Key marketing metrics include:
    - Customer acquisition cost (CAC): $[Amount]
    - Customer lifetime value (LTV): $[Amount]
    - Conversion rate: [Percentage]%
    Founders
    5.1 Founder Profiles
    The founding team comprises:
    - [Name], [Role], [Background and Experience]
    - [Name], [Role], [Background and Experience]
    The founders bring a diverse range of skills and experience, with a strong commitment to the startup's vision.
    5.2 Leadership and Governance
    The leadership team includes experienced professionals in key roles, ensuring effective governance and strategic decision-making. Regular board meetings and advisory sessions are held to guide the startup's growth.
    5.3 Equity Structure
    The equity structure is as follows:
    - Founders: [Percentage]%
    - Investors: [Percentage]%
    - Employee Stock Options (ESOP): [Percentage]%
    This structure aligns the interests of all stakeholders and supports long-term growth.
    1.5 Financial Projections
    The financial projections for the next five years have been meticulously calculated based on current market trends, historical data, and expected growth rates. The projections are as follows:
    - Year 1: Revenue - $[Amount] million, Expenses - $[Amount] million, Net Profit - $[Amount] million
    - Year 2: Revenue - $[Amount] million, Expenses - $[Amount] million, Net Profit - $[Amount] million
    - Year 3: Revenue - $[Amount] million, Expenses - $[Amount] million, Net Profit - $[Amount] million
    - Year 4: Revenue - $[Amount] million, Expenses - $[Amount] million, Net Profit - $[Amount] million
    - Year 5: Revenue - $[Amount] million, Expenses - $[Amount] million, Net Profit - $[Amount] million
    These projections indicate a steady growth rate and a strong financial position moving forward.
    2.4 Legal Risks
    An assessment of potential legal risks was conducted, identifying areas such as regulatory changes, intellectual property disputes, and contract enforcement. Mitigation strategies include securing comprehensive insurance policies, regular legal audits, and maintaining a robust compliance framework.
    3.4 Technology Roadmap
    The technology roadmap outlines the planned advancements and innovations for the next three years. Key milestones include:
    - Launch of Version 2.0 with enhanced features and improved user interface
    - Integration of AI and machine learning capabilities to enhance product performance
    - Expansion of the technology team to support rapid development and scaling
    - Partnerships with leading technology firms to leverage cutting-edge solutions
    4.4 Customer Feedback and Product Iteration
    Customer feedback is actively sought and used to drive product iteration and improvement. Recent feedback highlights include:
    - Positive reviews on user experience and interface
    - Suggestions for additional features and functionalities
    - High customer satisfaction rates and repeat business
    The product development team prioritizes feedback to ensure continuous improvement and customer satisfaction.
    4.5 Competitive Analysis
    A comprehensive competitive analysis was conducted, identifying key competitors and their market positions. The startup's competitive advantages include:
    - Superior technology and product features
    - Strong customer relationships and brand loyalty
    - Efficient operational processes and cost structures
    This analysis helps to inform strategic decisions and maintain a competitive edge.
    5.4 Advisory Board
    The advisory board comprises industry experts and seasoned entrepreneurs who provide strategic guidance and support. Key advisors include:
    - [Name], [Background and Expertise]
    - [Name], [Background and Expertise]
    Their insights and networks are invaluable in navigating challenges and seizing opportunities.
    5.5 Founder Vision and Mission
    The founders are driven by a clear vision and mission, which underpin all strategic initiatives. Their vision is to [Vision Statement], and their mission is to [Mission Statement]. This clarity of purpose inspires the team and aligns all efforts towards achieving common goals.
    Risks and Mitigations
    6.1 Market Risks
    Market risks include potential changes in customer preferences, economic downturns, and competitive pressures. Mitigation strategies involve:
    - Diversifying the product portfolio
    - Expanding into new markets
    - Continuously monitoring market trends and adapting strategies accordingly
    6.2 Operational Risks
    Operational risks encompass supply chain disruptions, operational inefficiencies, and quality control issues. To mitigate these risks, the startup has:
    - Established strong relationships with multiple suppliers
    - Implemented rigorous operational processes and quality checks
    - Invested in technology to enhance operational efficiency and reliability
    6.3 Financial Risks
    Financial risks include cash flow issues, funding challenges, and cost overruns. Mitigation measures include:
    - Maintaining a healthy cash reserve
    - Exploring multiple funding sources
    - Regular financial monitoring and cost control measures
    Future Growth Plans
    7.1 Expansion Strategy
    The startup plans to expand its operations to new geographical regions, including [Regions]. The expansion strategy involves:
    - Market research and feasibility studies
    - Establishing local partnerships
    - Tailoring products and services to meet local needs
    7.2 Product Diversification
    To reduce dependency on a single product, the startup aims to diversify its product portfolio by:
    - Developing new products in adjacent markets
    - Enhancing existing products with new features
    - Exploring potential acquisitions to expand product offerings
    7.3 Strategic Partnerships
    Forming strategic partnerships with key industry players is a cornerstone of the growth strategy. Potential partners include:
    - Technology firms for collaborative innovation
    - Distribution partners to enhance market reach
    - Research institutions for cutting-edge developments
  `;

  const pdfDoc = await PDFDocument.create();
  const pageWidth = 600;
  const pageHeight = 800;
  const margin = 50;
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;

  const pdfPages = [];
  const lines = content.split('\n');
  let currentHeight = pageHeight - margin;

  const createNewPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    pdfPages.push(page);
    currentHeight = pageHeight - margin;
  };

  createNewPage();

  lines.forEach((line) => {
    const lineWidth = pageWidth - 2 * margin;
    const words = line.split(' ');
    let currentLine = '';

    words.forEach((word) => {
      if (currentLine.length + word.length + 1 > lineWidth / (fontSize * 0.6)) {
        if (currentHeight < margin + lineHeight) {
          createNewPage();
        }
        pdfPages[pdfPages.length - 1].drawText(currentLine, {
          x: margin,
          y: currentHeight,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        currentHeight -= lineHeight;
        currentLine = word;
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
    });

    if (currentLine) {
      if (currentHeight < margin + lineHeight) {
        createNewPage();
      }
      pdfPages[pdfPages.length - 1].drawText(currentLine, {
        x: margin,
        y: currentHeight,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      currentHeight -= lineHeight;
    }
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

const sendEmail = async (email, pdfBytes) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Startup Evaluation Report',
    text: 'Please find the attached startup evaluation report.',
    attachments: [
      {
        filename: 'Startup_Evaluation_Report.pdf',
        content: Buffer.from(pdfBytes),
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: 'Email is required' });
  }

  try {
    const pdfBytes = await generatePDF();
    await sendEmail(email, pdfBytes);
    res.status(200).send({ message: 'Report sent successfully' });
  } catch (error) {
    console.error('Error generating or sending PDF document:', error);
    res.status(500).json({
      error: `Error generating or sending PDF document: ${error.message}`,
    });
  }
}
