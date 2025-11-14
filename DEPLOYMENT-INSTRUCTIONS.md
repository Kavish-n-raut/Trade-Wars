# 🚀 CRITICAL DEPLOYMENT INSTRUCTIONS

## ✅ COMPLETED UPDATES (November 11, 2025)

### 1. **Reduced to 15 Major Sectors with Top Stocks** ✅
- Consolidated from 20+ sectors to exactly **15 well-known sectors**
- Curated **105 top stocks** across these sectors:
  1. Banking (7 stocks)
  2. IT (8 stocks)
  3. FMCG (8 stocks)
  4. Pharmaceuticals (8 stocks)
  5. Automobile (8 stocks)
  6. Energy (7 stocks)
  7. Telecom (1 stock)
  8. Cement (5 stocks)
  9. Metals (3 stocks)
  10. Insurance (6 stocks)
  11. Financial Services (5 stocks)
  12. Infrastructure (3 stocks)
  13. Retail (2 stocks)
  14. Healthcare (1 stock)
  15. Consumer Goods (7 stocks)

### 2. **Email Service for Registration** ✅
- Added `nodemailer` package
- Created `backend/services/emailService.js`
- Integrated welcome email in registration endpoint
- Email sends username and password to new users
- Beautiful HTML email template with credentials

### 3. **Logo Integration** ✅
- Copied E-Cell logo to `frontend/public/logo.jpg`
- Updated `Navbar.jsx` to display logo instead of emoji
- Logo appears in top-left corner with proper styling

---

## 🔴 CRITICAL: Registration Fix Instructions

### The Problem
Registration is NOT working because the frontend on Vercel doesn't know where the backend is!

### The Solution - Set Environment Variables on Vercel

#### **Frontend Deployment (trade-wars-three.vercel.app)**

1. Go to: https://vercel.com/dashboard
2. Select your **frontend project** (trade-wars-three)
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   ```
   Name: VITE_API_URL
   Value: https://trade-wars-backend.vercel.app/api
   Environment: Production
   ```
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **3 dots** on the latest deployment
8. Click **Redeploy** → **Use existing Build Cache: NO**

#### **Backend Deployment (trade-wars-backend.vercel.app)**

1. Go to your **backend project** on Vercel
2. Go to **Settings** → **Environment Variables**
3. Verify these are set (add if missing):
   ```
   DATABASE_URL = your-postgres-url
   JWT_SECRET = your-jwt-secret
   CRON_SECRET = your-cron-secret
   FRONTEND_URL = https://trade-wars-three.vercel.app
   ```

4. **Optional but Recommended** - Add email configuration:
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = your-gmail-app-password
   ```
   
   **How to get Gmail App Password:**
   - Enable 2-Factor Authentication on your Google Account
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)" → Name it "E-Summit Stock Exchange"
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` (NOT your regular Gmail password!)

---

## 📦 Deploy Updated Code

### Step 1: Seed Database with New Stocks
```powershell
cd d:\trade-wars\Trade-Wars-main\backend
node prisma/seed.js
```

### Step 2: Commit and Push to GitHub
```powershell
cd d:\trade-wars\Trade-Wars-main
git add .
git commit -m "✅ Reduce to 15 sectors, add email service, integrate logo"
git push origin main
```

### Step 3: Verify Vercel Auto-Deployment
- Vercel will automatically deploy when you push to main
- Check: https://vercel.com/dashboard
- Both frontend and backend should show new deployments

### Step 4: Test Registration
1. Go to: https://trade-wars-three.vercel.app/register
2. Create a new test user
3. Check if registration succeeds
4. Check email for welcome message (if configured)
5. Try logging in with the new account

---

## 🧪 Testing Checklist

After deployment, verify:

- [ ] Registration works (creates new user)
- [ ] Welcome email received (if email configured)
- [ ] Logo appears in navbar
- [ ] Dashboard shows 105 stocks
- [ ] Stocks are organized into 15 sectors
- [ ] Can buy/sell stocks
- [ ] Portfolio updates correctly
- [ ] Admin panel accessible
- [ ] Leaderboard shows users
- [ ] News feed loads
- [ ] Price updates every minute

---

## 🐛 Troubleshooting

### Registration Still Not Working?
1. Open browser console (F12)
2. Try to register
3. Check Network tab for API calls
4. If you see `http://localhost:3000` → Environment variable not set
5. If you see `https://trade-wars-backend.vercel.app` → Backend issue

### Email Not Sending?
- Emails are **optional** - app works without them
- Check backend logs: https://vercel.com/dashboard → Backend project → Logs
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Make sure you're using Gmail **App Password**, not regular password

### Logo Not Showing?
- Clear browser cache (Ctrl + Shift + Delete)
- Check: https://trade-wars-three.vercel.app/logo.jpg
- If 404, logo wasn't deployed → Redeploy frontend

### Database Issues?
```powershell
cd d:\trade-wars\Trade-Wars-main\backend
node prisma/seed.js
```

---

## 📊 Database Schema
The seed script will:
- Delete all existing stocks
- Create 105 new stocks across 15 sectors
- Keep existing users (admin, testuser)
- Reset user balances to 500k

---

## 🎉 What's New

### 15 Major Sectors
- Banking, IT, FMCG, Pharma, Automobile, Energy, Telecom
- Cement, Metals, Insurance, Financial Services
- Infrastructure, Retail, Healthcare, Consumer Goods

### Email Features
- Welcome email on registration
- Includes username and password
- Beautiful HTML template
- Optional (app works without it)

### UI Improvements
- E-Cell logo in navbar
- Professional branding
- Better visual identity

---

## 🔐 Security Notes

### Email Passwords in Database
⚠️ **WARNING**: User passwords are being sent via email for convenience during the competition/event.

**For production use:**
- DO NOT send passwords via email
- Force password change on first login
- Implement password reset flow
- Use 2FA for sensitive accounts

### Gmail App Passwords
- Never commit App Passwords to Git
- Use environment variables only
- Revoke unused App Passwords regularly
- Each app should have its own password

---

## 📞 Support

If issues persist:
1. Check Vercel logs (both frontend & backend)
2. Verify environment variables are set
3. Test API endpoint directly: https://trade-wars-backend.vercel.app/api/stocks
4. Check database connection
5. Review browser console for errors

---

## ✨ Summary

**What Changed:**
1. ✅ Stocks reduced to 15 sectors (105 top stocks)
2. ✅ Email service added (sends welcome emails)
3. ✅ Logo integrated in navbar
4. ✅ Better organized sector structure

**What You Must Do:**
1. 🔴 Set `VITE_API_URL` environment variable on Vercel frontend
2. 🔴 Redeploy frontend after setting variable
3. 🟡 Optionally add email credentials (EMAIL_USER, EMAIL_PASSWORD)
4. ✅ Push code to GitHub (auto-deploys)
5. ✅ Seed database with new stocks

**Expected Result:**
- Registration works perfectly
- Users receive welcome emails
- 105 stocks across 15 sectors
- Professional logo in navbar
- Fully functional trading platform

---

Good luck with your E-Summit! 🚀📈
