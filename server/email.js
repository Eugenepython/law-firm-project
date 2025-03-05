//email.js

import nodemailer from 'nodemailer';

// Setup transporter outside of the functions to avoid re-creating it each time
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendAdminNotificationEmail = async (user, type) => {
  const entity = type === 'user' ? 'Law Firm User' : 'Disbursement Provider';
  const verificationLink = `${process.env.BASE_URL}/verify?token=${user.verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New User Sign-Up',
    text: `A new ${entity.toLowerCase()} has signed up. Details:\n\nUsername: ${user.username}\nEmail: ${user.email}\n${entity}: ${user.lawFirm || user.disbFirm}\n\nVerification Link: ${verificationLink}\n\nPlease log in to the admin panel to verify the user.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
};

const sendUserConfirmationEmail = async (user, type) => {
  const entity = type === 'user' ? 'Law Firm User' : 'Disbursement Provider';
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Account Accepted',
    text: `Hello ${user.username},\n\nYour ${entity.toLowerCase()} account has been accepted. You can now log in.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('User confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending user confirmation email:', error);
  }
};

const sendUserRejectionEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Account Rejected',
    text: `Hello ${user.username},\n\nWe regret to inform you that your account has been rejected.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('User rejection email sent successfully');
  } catch (error) {
    console.error('Error sending user rejection email:', error);
  }
};



const sendInviteDetailsToAdmin = async (provider, verificationLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL, // You can change this to the provider's email or keep it for admin
    subject: 'New Disbursement Provider Invitation',
    text: `A new disbursement provider has been invited. Please manually send them the invitation.\n\nDetails:\n\nUsername: ${provider.username}\nEmail: ${provider.email}\nFirm: ${provider.disbFirm}\n\nVerification Link: ${verificationLink}\n\nThey have been added as a "pending" provider and will need to verify themselves to complete the registration.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invitation details email sent to admin successfully');
  } catch (error) {
    console.error('Error sending invitation details email:', error);
  }
};

const sendProviderPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `Hello,\n\nWe received a request to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Provider password reset email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending provider password reset email:', error);
  }
};


const sendLawFirmPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `Hello,\n\nWe received a request to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Law Firm password reset email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending Law Firm password reset email:', error);
  }
};



// Export all the functions as named exports
export {
  sendAdminNotificationEmail,
  sendUserConfirmationEmail,
  sendUserRejectionEmail,
  sendInviteDetailsToAdmin,
  sendProviderPasswordResetEmail,
  sendLawFirmPasswordResetEmail // Export updated function
};
