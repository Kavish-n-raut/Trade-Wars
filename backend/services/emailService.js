import nodemailer from 'nodemailer';

/**
 * Email Service for sending notifications
 * Uses Gmail SMTP or other email service
 */

// Create reusable transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail', // You can change to other services like 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your app password
    },
  });
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (email, username, password) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email service not configured - skipping welcome email');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"E-Summit Stock Exchange" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to E-Summit Stock Exchange! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Welcome to E-Summit Stock Exchange!</h1>
            </div>
            <div class="content">
              <h2>Hello, ${username}! 👋</h2>
              <p>Your account has been successfully created. Get ready to start trading!</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Email:</strong> ${email}</p>
              </div>
              
              <p><strong>⚠️ Important Security Note:</strong> Please change your password after your first login for security purposes.</p>
              
              <h3>What's Next?</h3>
              <ul>
                <li>💰 You start with <strong>₹5,00,000</strong> virtual cash</li>
                <li>📈 Browse 100+ stocks across 15 sectors</li>
                <li>💹 Buy and sell stocks in real-time</li>
                <li>📊 Track your portfolio performance</li>
                <li>🏆 Compete on the leaderboard</li>
              </ul>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'https://trade-wars-three.vercel.app'}/login" class="button">Start Trading Now</a>
              </center>
              
              <div class="footer">
                <p>Happy Trading! 🚀</p>
                <p>If you didn't create this account, please ignore this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to E-Summit Stock Exchange!

Hello, ${username}!

Your account has been successfully created. Here are your login credentials:

Username: ${username}
Password: ${password}
Email: ${email}

⚠️ Important: Please change your password after your first login for security.

What's Next?
- You start with ₹5,00,000 virtual cash
- Browse 100+ stocks across 15 sectors
- Buy and sell stocks in real-time
- Track your portfolio performance
- Compete on the leaderboard

Start trading now at: ${process.env.FRONTEND_URL || 'https://trade-wars-three.vercel.app'}/login

Happy Trading! 🚀
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, username, resetLink) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email service not configured - skipping password reset email');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"E-Summit Stock Exchange" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello, ${username}!</h2>
              <p>We received a request to reset your password.</p>
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <div class="footer">
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
