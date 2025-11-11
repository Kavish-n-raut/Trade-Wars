# ⚠️ URGENT FIXES NEEDED - Your Vercel Deployment

## Current Problems:
1. ❌ Registration not working
2. ❌ Leaderboard still visible to non-admin users
3. ❌ Cron jobs not updating prices
4. ❌ Profit/Loss showing ₹0
5. ❌ Admin balance adjustment feature not visible

---

## 🔍 ROOT CAUSE:

Your Vercel deployment has **critical configuration issues**:

### Issue #1: Frontend Can't Connect to Backend
- Frontend is using localhost API URL
- Needs to connect to production backend
- Registration fails because no backend connection

### Issue #2: Vercel Build Configuration
- May be building from wrong directory
- Old cached build still deployed
- Environment variables not set

---

## 🚨 IMMEDIATE FIXES (Do These Now):

### Fix #1: Configure Frontend API URL on Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Find your frontend project**: `trade-wars-three` or similar
3. **Go to**: Settings → Environment Variables
4. **Add this variable**:
   ```
   Name: VITE_API_URL
   Value: [SEE BELOW - YOU NEED TO TELL ME YOUR BACKEND URL]
   Environment: Production
   ```

**IMPORTANT**: I need you to tell me:
- **What is your backend Vercel URL?** (e.g., `https://trade-wars-api.vercel.app`)
- **OR do you need to deploy the backend first?**

---

### Fix #2: Redeploy Frontend with Correct Settings

After setting the environment variable:

1. **In Vercel dashboard** → Your frontend project
2. **Go to**: Settings → General
3. **Verify Root Directory**: Should be `frontend` (NOT empty)
4. **Verify Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Go to**: Deployments tab
6. **Click**: Latest deployment → ... menu → **Redeploy**
7. **UNCHECK**: "Use existing Build Cache" ← IMPORTANT!
8. **Click**: Redeploy

---

### Fix #3: Deploy Backend (If Not Already Done)

**Check if you have a backend deployment:**
- Go to https://vercel.com/dashboard
- Look for a project with Root Directory = `backend`

**If NO backend deployment exists**, create one:

1. **Vercel Dashboard** → Add New Project
2. **Import**: Trade-Wars repository
3. **Root Directory**: `backend` ← CRITICAL!
4. **Framework**: Other
5. **Build Command**: (leave empty)
6. **Output Directory**: (leave empty)
7. **Install Command**: `npm install`

8. **Environment Variables** (add all of these):
```
DATABASE_URL=postgres://49304e063fabb67e271789a2e0a3078f5d72c5f7b0f66226c00a9da29020fe98:sk_apr92owZLjvhq4h5-W5Sg@db.prisma.io:5432/postgres?sslmode=require

JWT_SECRET=trade-wars-super-secret-jwt-key-change-in-production

CRON_SECRET=trade-wars-cron-secret-key

NODE_ENV=production

PORT=3000
```

9. **Deploy** and **copy the URL** (e.g., `https://trade-wars-api-abc123.vercel.app`)

---

## 🔧 Fix Specific Issues:

### A. Leaderboard Still Visible

**Why**: Old build cached or wrong route protection

**Fix**:
1. Verify `frontend/src/App.jsx` has:
   ```jsx
   <Route path="/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />
   ```
2. Redeploy with cache cleared (see Fix #2 above)
3. **Hard refresh browser**: Ctrl+Shift+F5 or Cmd+Shift+R

---

### B. Cron Jobs Not Working

**Cron jobs only work on Vercel in production**, not localhost.

**To verify cron is configured**:
1. Go to backend project on Vercel
2. Settings → Cron Jobs
3. Should see: `*/1 * * * *` (every minute) pointing to `/api/cron/update-stocks`

**If not configured**:
1. Check `backend/vercel.json` has:
   ```json
   "crons": [{
     "path": "/api/cron/update-stocks",
     "schedule": "* * * * *"
   }]
   ```
2. Redeploy backend

**To test cron manually**:
- Visit: `https://your-backend-url.vercel.app/api/cron/update-stocks`
- Should return: `{"success": true, "message": "Stocks and portfolios updated"}`

---

### C. Profit/Loss Showing ₹0

**Why**: Either:
1. No transactions made yet (correct behavior)
2. Backend not calculating correctly
3. Frontend not fetching user data

**To verify**:
1. Open Prisma Studio: `cd backend && npx prisma studio`
2. Check User table → Look at `profitLoss` field
3. If it's 0, that's correct if no trading happened
4. If users have transactions but P/L is 0, backend issue

**Test locally**:
```bash
cd backend
node test-cron.js  # This updates prices and calculates P/L
```

---

### D. Admin Balance Adjustment Not Visible

**The feature EXISTS** in the code. If not visible:

**Check**:
1. Are you logged in as admin? (Check `isAdmin` in Prisma Studio)
2. Go to: Admin Panel → Users tab
3. Should see **Edit** button (pencil icon) next to each user

**If not there**:
1. Clear browser cache completely
2. Hard refresh (Ctrl+Shift+F5)
3. Verify `AdminUsersPanel.jsx` is deployed (should be in latest code)

**Local test**:
- Open http://localhost:5173/admin in your local setup
- Login as admin
- Go to Users tab
- Should see edit button

---

## 📋 VERIFICATION CHECKLIST

After doing all fixes, verify:

- [ ] **Backend deployed**: Visit `https://your-backend-url.vercel.app/api/stocks`
  - Should return JSON with stock data

- [ ] **Frontend connects**: Open browser console at `https://trade-wars-three.vercel.app`
  - Check Network tab → Should see requests to backend URL (not localhost)

- [ ] **Registration works**: Try creating account
  - Should successfully register and login

- [ ] **Leaderboard hidden**: Login as non-admin
  - Should NOT see "Leaderboard" in navbar
  - Visiting `/leaderboard` should redirect to dashboard

- [ ] **Prices update**: Check a stock price
  - Wait 1 minute
  - Refresh page
  - Price should have changed slightly (~0.1%)

- [ ] **P/L displays**: After buying stocks
  - Should show P/L value
  - Should update as prices change

- [ ] **Admin features**: Login as admin
  - Should see "Admin Panel" in navbar
  - Can access Admin Panel → Users
  - Can see edit button on users
  - Can click edit to open balance adjustment modal

---

## 🆘 TELL ME:

1. **What is your backend Vercel URL?** (or "I don't have one")
2. **What errors do you see in browser console?** (F12 → Console tab)
3. **Can you share a screenshot of the Vercel project settings?**

Once I know your backend URL, I can provide the EXACT value to put in `VITE_API_URL`.

---

## 🎯 Quick Summary:

**The #1 issue**: Frontend can't connect to backend because `VITE_API_URL` is not set on Vercel.

**The fix**: 
1. Deploy backend to Vercel (if not done)
2. Set `VITE_API_URL` on frontend Vercel project
3. Redeploy frontend WITHOUT cache
4. Hard refresh browser

**Everything else will work once the API connection is fixed!**
