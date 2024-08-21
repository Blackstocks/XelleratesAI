import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, name } = req.body;

  let transporter;

  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use 587 instead of 465
      secure: false, // TLS (STARTTLS)
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } catch (transporterError) {
    return res
      .status(500)
      .json({ error: 'Failed to create email transporter' });
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Welcome to Xellerates AI: Registration Successful',
    text: `Dear ${name},

    Thank you for successfully registering with Xellerates AI. We are thrilled to have you join our platform.
    
    Your registration has been received and is currently under review. You can expect an update on your account status within the next 24 hours.
    
    In the meantime, if you have any questions or need further assistance, please do not hesitate to contact us at reachus@xellerates.com.
    
    Thank you for choosing Xellerates AI!
    
    Best regards,
    The Xellerates AI Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Failed to send email', details: error.message });
  }
}
