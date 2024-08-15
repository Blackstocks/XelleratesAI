import pdf from 'html-pdf-node';

export default async function handler(req, res) {
  const { htmlContent } = req.body;

  const file = { content: htmlContent };
  const options = { format: 'A4' };

  try {
    const pdfBuffer = await pdf.generatePdf(file, options);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send('Error generating PDF');
  }
}

