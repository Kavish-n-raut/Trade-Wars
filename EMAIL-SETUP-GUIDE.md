# 📧 Email Setup Guide for Registration

## Overview
The app now sends welcome emails to new users with their username and password.

---

## 🚀 Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow instructions to enable 2FA

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. If prompted, sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Type: `E-Summit Stock Exchange`
6. Click **Generate**
7. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 3: Add to Vercel Environment Variables

#### For Backend Project:
1. Go to: https://vercel.com/dashboard
2. Select your **backend project** (trade-wars-backend)
3. Go to **Settings** → **Environment Variables**
4. Add two variables:

   **Variable 1:**
   ```
   Name: EMAIL_USER
   Value: your-email@gmail.com
   Environment: Production, Preview, Development
   ```

   **Variable 2:**
   ```
   Name: EMAIL_PASSWORD
   Value: [paste the 16-character app password]
   Environment: Production, Preview, Development
   ```

5. Click **Save** for each

### Step 4: Redeploy Backend
1. Go to **Deployments** tab
2. Click **3 dots** on latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache: NO**
5. Click **Redeploy**

### Step 5: Test
1. Register a new user at: https://trade-wars-three.vercel.app/register
2. Check the email inbox
3. You should receive a welcome email with credentials

---

## 📝 Email Template Features

The welcome email includes:
- ✅ Professional E-Summit branding
- ✅ Username and password clearly displayed
- ✅ Security reminder to change password
- ✅ Getting started guide
- ✅ Direct login link
- ✅ Beautiful HTML formatting

---

## ⚠️ Important Notes

### Security
- **NEVER** commit email passwords to Git
- Use App Passwords, not your regular Gmail password
- Each application should have its own App Password
- Revoke unused App Passwords regularly

### Privacy
- User emails are stored in database
- Passwords are hashed (never stored in plain text)
- Welcome email is the ONLY time password is sent in plain text

### Optional Feature
- Email is **OPTIONAL** - app works without it
- If email is not configured, users just won't receive welcome emails
- Registration still works normally

---

## 🔧 Alternative Email Providers

### Using Outlook/Hotmail
```javascript
service: 'hotmail'
```

### Using Yahoo
```javascript
service: 'yahoo'
```

### Using Custom SMTP
```javascript
// In emailService.js, replace:
service: 'gmail',

// With:
host: 'smtp.yourprovider.com',
port: 587,
secure: false,
```

---

## 🐛 Troubleshooting

### "Email service not configured"
- Check if `EMAIL_USER` and `EMAIL_PASSWORD` are set in Vercel
- Redeploy backend after adding variables

### "Invalid login: 535-5.7.8 Username and Password not accepted"
- You're using regular password instead of App Password
- Generate App Password as described above
- Make sure 2FA is enabled

### Emails going to Spam
- Add your domain to Gmail's approved senders
- Users should mark first email as "Not Spam"
- Consider using a professional email service (SendGrid, Mailgun)

### Email not received
- Check spam folder
- Verify email address is correct
- Check backend logs on Vercel
- Email might be delayed (wait 1-2 minutes)

---

## 📊 Backend Logs

To debug email issues:
1. Go to: https://vercel.com/dashboard
2. Select **backend project**
3. Go to **Logs** tab
4. Filter by "email" or look for errors
5. You'll see: "✅ Welcome email sent" or error messages

---

## 🎯 Testing Locally

To test email locally:

1. Create `.env` file in backend folder:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

2. Run backend:
```powershell
cd backend
npm run dev
```

3. Register a user via API or frontend

---

## 🔐 Production Best Practices

For real production use:
- ✅ Use professional email service (SendGrid, AWS SES)
- ✅ Don't send passwords via email
- ✅ Implement email verification
- ✅ Add unsubscribe links
- ✅ Monitor email delivery rates
- ✅ Use email templates service
- ✅ Implement rate limiting

---

## 📧 Email Preview

```
From: E-Summit Stock Exchange <your-email@gmail.com>
To: newuser@example.com
Subject: Welcome to E-Summit Stock Exchange! 🎉

[E-Summit Logo]

Welcome to E-Summit Stock Exchange!

Hello, newuser! 👋

Your account has been successfully created. Get ready to start trading!

Your Login Credentials:
━━━━━━━━━━━━━━━━━━━━
Username: newuser
Password: password123
Email: newuser@example.com
━━━━━━━━━━━━━━━━━━━━

⚠️ Important Security Note: Please change your password after your first login.

What's Next?
• 💰 You start with ₹5,00,000 virtual cash
• 📈 Browse 105 stocks across 15 sectors
• 💹 Buy and sell stocks in real-time
• 📊 Track your portfolio performance
• 🏆 Compete on the leaderboard

[Start Trading Now Button]

Happy Trading! 🚀
```

---

## ✅ Summary

1. Enable 2FA on Gmail
2. Generate App Password
3. Add to Vercel (EMAIL_USER, EMAIL_PASSWORD)
4. Redeploy backend
5. Test registration
6. Check email

**That's it!** Users will now receive welcome emails when they register. 🎉
