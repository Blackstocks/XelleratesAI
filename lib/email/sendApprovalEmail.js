const transporter = require('./nodemailerConfig');

const sendApprovalEmail = (to, name) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: 'Account Approved',
    text: `Hello ${name},\n\nYour account has been approved and verified!\n\nYou can now access all features.\n\nBest regards,\nYour Company`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendApprovalEmail;
