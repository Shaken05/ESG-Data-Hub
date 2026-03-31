# Email Configuration Guide

The ESG Inventory system supports email notifications for password reset functionality. This guide explains how to set up email sending.

## Overview

The system uses **nodemailer** to send emails via SMTP. This is optional - without SMTP configuration, password reset codes are logged to console in development mode.

## Setup Options

### Option 1: Gmail (Recommended for Testing)

1. **Create a Gmail Account** (or use existing)
2. **Enable 2-Factor Authentication** in Google Account settings
3. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
4. **Configure .env**:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  (16-char app password, no spaces)
SMTP_FROM=ESG Inventory <noreply@yourdomain.com>
```

### Option 2: Office 365 / Outlook

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=ESG Inventory <your-email@company.com>
```

### Option 3: SendGrid (Production Recommended)

1. Create SendGrid account at https://sendgrid.com
2. Create API key in Settings → API Keys
3. Create sender identity (From Email)
4. Configure .env:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey  (literally "apikey")
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=ESG Inventory <noreply@yourdomain.com>
```

### Option 4: Mailgun

1. Create Mailgun account at https://www.mailgun.com
2. Get SMTP credentials from Dashboard
3. Configure .env:
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-smtp-password
SMTP_FROM=ESG Inventory <noreply@yourdomain.mailgun.org>
```

## Development Mode (No Email Configuration)

If `.env` variables are not set, the system runs in **DEV mode**:
- Reset codes are logged to console
- API response includes the code (only in development)
- Useful for testing without email infrastructure

Example console output:
```
⚠️ Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars to enable email notifications.
Reset code (DEV MODE): 123456
```

## Testing Email Sending

### Local Testing with Gmail:
1. Update `.env` with Gmail credentials
2. Access login page → "Forgot password?"
3. Enter any valid email address
4. Check if email is received
5. Use the code from the email to reset password

### Testing in Development:
1. Request password reset
2. Check backend console for code
3. Use that code in the frontend reset form

## Security Notes

⚠️ **Important:**
- **Never commit `.env` file** with SMTP credentials to Git
- Use **app-specific passwords**, not your main password
- Consider rotating credentials regularly
- For Gmail: Use app-specific password, not account password
- For production: Use a dedicated email service (SendGrid, Mailgun) instead of personal email

## Troubleshooting

### "Email not configured" warning in production
- Ensure all 4 SMTP variables are set in your hosting environment
- Check that variables are not empty strings
- Verify SMTP credentials are correct

### "Failed to send email" error
- Check SMTP host/port is accessible
- Verify credentials are correct
- For Gmail: Ensure you're using app-specific password, not account password
- For Office 365: Ensure 2FA is disabled for the account (or use app password)
- Check if your ISP/network blocks SMTP port (some ISPs block port 25/587/465)

### Email never arrives
- Check spam/junk folder
- Verify "From" email address is correct
- Check email logs in your email service dashboard
- Some email providers may require verification of sender domain

## Render.com Deployment

1. Go to Dashboard → Environment
2. Add these variables:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
3. Deploy

## Netlify (Frontend Only)

Frontend doesn't send emails - emails are sent from backend only.

## References

- Nodemailer Documentation: https://nodemailer.com/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- SendGrid SMTP: https://sendgrid.com/docs/for-developers/sending-email/integrating-with-the-smtp-api/
