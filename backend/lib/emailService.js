import nodemailer from 'nodemailer';

/**
 * Email service for sending password reset codes and notifications
 * Uses nodemailer with SMTP configuration from environment variables
 * 
 * Required env vars:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (usually 587 for TLS, 465 for SSL)
 * - SMTP_USER: Email address for authentication
 * - SMTP_PASS: Email password or app-specific password
 * - SMTP_FROM: "Sender Name <sender@email.com>" sender email display format
 */

let transporter = null;

const initializeTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️  Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars to enable email notifications.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
};

/**
 * Send password reset code to user email
 * @param {string} toEmail - Recipient email
 * @param {string} resetCode - Reset code (6 digits)
 * @returns {Promise<boolean>} - Success status
 */
export const sendPasswordResetEmail = async (toEmail, resetCode) => {
  try {
    const transport = initializeTransporter();
    if (!transport) {
      console.warn('⚠️  Email not configured. Reset code (DEV MODE):', resetCode);
      return true; // Return true for DEV mode
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: 'ESG Inventory System - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1B8A4B; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">ESG Inventory System</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p>Hello,</p>
            <p>You requested a password reset for your ESG Inventory System account.</p>
            <p style="font-size: 16px; color: #333;">Your password reset code is:</p>
            <div style="background-color: #1B8A4B; color: white; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 3px;">
              ${resetCode}
            </div>
            <p style="color: #666;">This code will expire in 15 minutes.</p>
            <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              ESG Data Inventory System © 2026<br>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
Your password reset code is: ${resetCode}
This code will expire in 15 minutes.
If you didn't request this password reset, please ignore this email.
      `
    };

    const info = await transport.sendMail(mailOptions);
    console.log('✅ Password reset email sent to', toEmail, '(Message ID:', info.messageId, ')');
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    return false;
  }
};

/**
 * Send general notification email
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content
 * @returns {Promise<boolean>} - Success status
 */
export const sendNotificationEmail = async (toEmail, subject, htmlContent) => {
  try {
    const transport = initializeTransporter();
    if (!transport) {
      console.warn('⚠️  Email not configured. Notification not sent:', subject);
      return true; // Return true for DEV mode
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject,
      html: htmlContent
    };

    const info = await transport.sendMail(mailOptions);
    console.log('✅ Notification email sent to', toEmail);
    return true;
  } catch (error) {
    console.error('❌ Failed to send notification email:', error.message);
    return false;
  }
};
