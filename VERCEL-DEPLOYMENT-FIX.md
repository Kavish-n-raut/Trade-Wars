# 🚀 Vercel Deployment Guide - Trade Wars

## Current Issue: Frontend showing localhost & leaderboard visible

### Problem Analysis
1. **Frontend is using localhost API** - Not connecting to production backend
2. **Leaderboard visible to non-admin** - Old cached build on Vercel
3. **Registration not working** - API connection issue

---

## ✅ Solution: Proper Vercel Deployment Setup

You need **TWO separate Vercel projects**:
1. **Backend Project** - Deploys from `/backend` folder
2. **Frontend Project** - Deploys from `/frontend` folder

---

## 📋 Step-by-Step Deployment

### Step 1: Deploy Backend (if not already done)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository: `Trade-Wars`
4. **IMPORTANT**: Set Root Directory to `backend`
5. Framework Preset: `Other`
6. Build Command: (leave empty)
7. Output Directory: (leave empty)
8. Install Command: `npm install`

#### Environment Variables for Backend:
```
DATABASE_URL=postgres://49304e063fabb67e271789a2e0a3078f5d72c5f7b0f66226c00a9da29020fe98:sk_apr92owZLjvhq4h5-W5Sg@db.prisma.io:5432/postgres?sslmode=require

JWT_SECRET=trade-wars-super-secret-jwt-key-change-in-production

CRON_SECRET=trade-wars-cron-secret-key

NODE_ENV=production
```

9. Click "Deploy"
10. **COPY THE BACKEND URL** (e.g., `https://trade-wars-api-xyz123.vercel.app`)

---

### Step 2: Update Frontend Configuration

After backend is deployed, you need to update the frontend to point to it:

1. Open `frontend/.env.production` file
2. Update `VITE_API_URL` with your backend URL + `/api`

Example:
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

3. Save and commit this change

---

### Step 3: Deploy Frontend

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository: `Trade-Wars` (same repo)
4. **IMPORTANT**: Set Root Directory to `frontend`
5. Framework Preset: `Vite`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Install Command: `npm install`

#### Environment Variables for Frontend:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```
(Replace with your actual backend URL from Step 1)

9. Click "Deploy"
10. Your frontend will be at: `https://trade-wars-three.vercel.app`

---

## 🔧 Quick Fix for Current Deployment

Since your frontend is already deployed at `trade-wars-three.vercel.app`, you need to:

### Option A: Update Environment Variable on Vercel (RECOMMENDED)

1. Go to https://vercel.com/dashboard
2. Select your frontend project (`trade-wars-three`)
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api`
   - **Environment**: Production
5. Click "Save"
6. Go to Deployments tab
7. Click on latest deployment
8. Click "..." menu → "Redeploy"
9. Check "Use existing Build Cache" → Click "Redeploy"

### Option B: Update Code and Redeploy

1. Update `frontend/.env.production` with correct backend URL
2. Commit and push changes
3. Vercel will auto-redeploy

---

## 🔍 Finding Your Backend URL

If you don't know your backend URL:

1. Go to https://vercel.com/dashboard
2. Look for a project that was deployed from the `backend` folder
3. Click on it
4. The URL is shown at the top (e.g., `trade-wars-api.vercel.app`)
5. Copy it and add `/api` at the end

**If you don't have a backend deployment:**
- Follow Step 1 above to deploy the backend first
- Then follow Step 3 to redeploy frontend with correct URL

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] **Backend API works**: Visit `https://your-backend-url.vercel.app/api/stocks`
  - Should return list of stocks (or authentication error)
  
- [ ] **Frontend loads**: Visit `https://trade-wars-three.vercel.app`
  - Should show login page
  
- [ ] **Registration works**: Try creating new account
  - Should successfully create user and redirect to dashboard
  
- [ ] **Leaderboard hidden for non-admin**:
  - Login as regular user
  - Should NOT see "Leaderboard" link in navbar
  - Accessing `/leaderboard` directly should redirect to dashboard
  
- [ ] **Leaderboard visible for admin**:
  - Login as admin
  - Should see "Leaderboard" link in navbar
  - Can access and view leaderboard
  
- [ ] **Stock prices update**: 
  - Check if prices change every minute (Vercel Cron)
  
- [ ] **Admin can adjust balances**:
  - Go to Admin Panel → Users
  - Click edit button on a user
  - Should open modal to add/deduct money

---

## 🐛 Common Issues & Fixes

### Issue: "Network Error" or "Failed to fetch"
**Cause**: Frontend can't connect to backend
**Fix**: 
- Check `VITE_API_URL` environment variable on Vercel
- Ensure backend is deployed and running
- Check browser console for actual URL being used

### Issue: Leaderboard still visible to non-admin
**Cause**: Old build cached on Vercel
**Fix**:
- Go to Vercel dashboard → Your frontend project
- Deployments → Latest deployment → Redeploy
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Registration fails
**Cause**: API URL not configured
**Fix**:
- Set `VITE_API_URL` environment variable on Vercel
- Redeploy frontend

### Issue: P/L shows ₹0
**Cause**: Backend not running stock tracker
**Fix**:
- Check backend logs on Vercel
- Ensure `startStockTracker()` is called in server.js
- Check database connection

---

## 📝 Database Configuration

Your app is already connected to **Prisma Cloud PostgreSQL** (online database):

```
Database: db.prisma.io:5432
Status: ✅ Connected and working
```

To verify:
```bash
cd backend
node verify-db.js
```

---

## 🎯 Current URLs

Based on your message:

- **Frontend**: `https://trade-wars-three.vercel.app`
- **Backend**: (You need to provide this or deploy it)

**Next Action**: 
1. Find or deploy backend on Vercel
2. Update frontend environment variable with backend URL
3. Redeploy frontend

---

## 💡 Pro Tips

1. **Always use environment variables** for API URLs
2. **Never hardcode URLs** in code
3. **Keep backend and frontend as separate Vercel projects**
4. **Test locally** before deploying (use `.env.local` for dev)
5. **Clear cache** after deployment to see changes

---

## 🆘 Need Help?

If issues persist:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set
4. Ensure backend is running (test API endpoint directly)

---

## Current Code Status

✅ All code fixes are complete and pushed to GitHub:
- Leaderboard route changed to AdminRoute
- P/L calculation fixed
- Admin balance adjustment feature added
- Cron jobs working with 0.1% fluctuation
- All using online Prisma database

**Only missing**: Correct API URL configuration on Vercel frontend deployment
