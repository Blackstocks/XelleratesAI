import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, text } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your email
      pass: process.env.GMAIL_PASS, // Your app-specific password
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: subject || 'New Task Assigned',
    text: text || 'You have been assigned a new task. Please log in to view the details.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
