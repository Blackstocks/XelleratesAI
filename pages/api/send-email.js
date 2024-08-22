import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Use 587 for TLS (STARTTLS)
    secure: false, // Set to false for STARTTLS
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail email
      pass: process.env.GMAIL_PASS, // Your app-specific password
    },
    tls: {
      rejectUnauthorized: false, // Helps prevent SSL issues (optional)
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res
      .status(500)
      .json({ error: 'Failed to send email', details: error.message });
  }
}
