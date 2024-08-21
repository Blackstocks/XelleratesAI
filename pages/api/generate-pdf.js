import pdf from 'html-pdf-node';

export default async function handler(req, res) {
  const { htmlContent } = req.body;

  const file = { content: htmlContent };
  const options = { format: 'A4', margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" } };

  try {
    const pdfBuffer = await pdf.generatePdf(file, options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=InvestmentReadinessReport.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send('Error generating PDF');
  }
}


// import puppeteer from 'puppeteer';

// export default async function handler(req, res) {
//   const { htmlContent } = req.body;

//   try {
//     const browser = await puppeteer.launch({
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });
//     const page = await browser.newPage();

//     // Set the HTML content
//     await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//     // Wait for Tailwind and Chart.js to fully load and render
//     await page.waitForTimeout(3000); // Adjust the time based on your content needs

//     // Generate PDF from the page
//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true, // Ensure background images/colors are included
//     });

//     // Close the browser
//     await browser.close();

//     // Set headers for PDF download
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=InvestmentReadinessReport.pdf');
//     res.setHeader('Content-Length', pdfBuffer.length);

//     // Send the PDF buffer
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).send('Error generating PDF');
//   }
// }
