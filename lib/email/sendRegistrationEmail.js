const transporter = require('./nodemailerConfig');

const sendRegistrationEmail = async (to, name) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Registration Successful',
    text: `Hello ${name},\n\nYour registration was successful!\n\nThank you for joining us.\n\nBest regards,\nYour Company`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendRegistrationEmail;
