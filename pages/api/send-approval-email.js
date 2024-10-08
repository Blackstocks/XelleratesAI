import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, name } = req.body;

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
    subject: 'Welcome to Xellerates AI: Approval Successful',
    text: `Dear ${name},

Your registration with Xellerates AI has been approved. You can now log in and start using our platform.

If you have any questions or need further assistance, please do not hesitate to contact us at reachus@xellerates.com.

Thank you for choosing Xellerates AI!

Best regards,
The Xellerates AI Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
