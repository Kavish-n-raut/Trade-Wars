# 🚀 Deployment Checklist - Trade Wars

## Pre-Deployment (Local Testing)

### 1. Backend Testing
- [ ] Install dependencies: `cd backend && npm install`
- [ ] Copy environment: `cp .env.example .env`
- [ ] Configure `.env` with test database
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Seed database: `npx prisma db seed`
- [ ] Start server: `npm run dev`
- [ ] Test health endpoint: `http://localhost:3000/api/health`
- [ ] Verify all routes respond correctly

### 2. Frontend Testing
- [ ] Install dependencies: `cd frontend && npm install`
- [ ] Copy environment: `cp .env.example .env`
- [ ] Set `VITE_API_URL=http://localhost:3000/api`
- [ ] Start dev server: `npm run dev`
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test stock trading (buy/sell)
- [ ] Test portfolio display
- [ ] Test admin panel (as admin user)
- [ ] Test leaderboard
- [ ] Test news feed

### 3. Integration Testing
- [ ] Register new user → Gets ₹5,00,000
- [ ] Buy stocks → Balance decreases
- [ ] Sell stocks → Balance increases
- [ ] Portfolio P/L calculates correctly
- [ ] Admin can add new stock
- [ ] Admin can edit stock
- [ ] Admin can delete stock (without holdings)
- [ ] Stock prices update (manually trigger cron)
- [ ] News shows only financial content

---

## Vercel Deployment

### 1. Setup Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Deploy Backend

```bash
cd backend
vercel
# Follow prompts:
# - Link to existing project or create new
# - Set project name: trade-wars-backend
# - Confirm settings
```

**After First Deploy:**
- [ ] Note the backend URL (e.g., `trade-wars-backend.vercel.app`)
- [ ] Go to Vercel Dashboard → Project → Settings

### 3. Configure Backend Environment Variables

Go to **Settings → Environment Variables** and add:

```bash
# Database (use Vercel Postgres or external)
DATABASE_URL=postgresql://user:pass@host:5432/db
POSTGRES_URL=postgresql://user:pass@host:5432/db

# Security
JWT_SECRET=<generate-strong-random-string-here>
CRON_SECRET=<generate-another-random-string>

# Optional APIs
NEWS_API_KEY=<get-from-newsapi.org>
ALPHA_VANTAGE_API_KEY=<optional>

# Server Config
NODE_ENV=production
PORT=3000

# CORS (add your frontend URL)
FRONTEND_URL=https://your-frontend.vercel.app
```

**Generate Random Secrets:**
```bash
# Use this command to generate secure secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] All environment variables added
- [ ] Secrets are strong and unique
- [ ] FRONTEND_URL is set correctly

### 4. Setup Vercel Postgres (Optional)

If using Vercel Postgres:
- [ ] Go to Storage tab in Vercel dashboard
- [ ] Create new Postgres database
- [ ] Copy connection strings
- [ ] Add to environment variables
- [ ] Redeploy backend

### 5. Run Database Migrations

```bash
cd backend

# Set DATABASE_URL to production database
export DATABASE_URL="your-production-db-url"

# Run migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

- [ ] Migrations completed successfully
- [ ] Database seeded with admin user and stocks

### 6. Verify Backend Deployment

- [ ] Visit: `https://your-backend.vercel.app/api/health`
- [ ] Should return: `{"status": "ok", ...}`
- [ ] Test: `POST https://your-backend.vercel.app/api/auth/login`
  - Username: `admin`
  - Password: `admin123`
- [ ] Should return JWT token

### 7. Configure Cron Job

Go to **Vercel Dashboard → Your Project → Settings → Cron Jobs**

- [ ] Verify cron is listed: `/api/cron/update-stocks`
- [ ] Schedule: `*/5 * * * *` (every 5 minutes)
- [ ] Status: Active

**Test Cron Manually:**
```bash
curl -X GET https://your-backend.vercel.app/api/cron/trigger-update \
  -H "Authorization: Bearer <admin-jwt-token>"
```

- [ ] Cron job executes successfully
- [ ] Stock prices update
- [ ] Check logs for errors

### 8. Deploy Frontend

```bash
cd frontend
vercel
# Follow prompts:
# - Link to existing project or create new
# - Set project name: trade-wars-frontend
# - Confirm settings
```

### 9. Configure Frontend Environment Variables

Go to **Settings → Environment Variables** and add:

```bash
VITE_API_URL=https://your-backend.vercel.app/api
```

- [ ] Environment variable added
- [ ] Redeploy frontend if needed

### 10. Update Backend CORS

Go back to **Backend → Settings → Environment Variables**

Update `FRONTEND_URL`:
```bash
FRONTEND_URL=https://your-frontend.vercel.app
```

- [ ] CORS updated
- [ ] Backend redeployed

---

## Post-Deployment Verification

### 1. Test Live Frontend

Visit: `https://your-frontend.vercel.app`

**User Flow:**
- [ ] Register new user
- [ ] Login with credentials
- [ ] View stock list
- [ ] Buy a stock
- [ ] Check portfolio
- [ ] Sell a stock
- [ ] View transaction history
- [ ] Check leaderboard
- [ ] Read news feed

**Admin Flow:**
- [ ] Login as admin (username: admin, password: admin123)
- [ ] Navigate to Admin Panel
- [ ] Add new stock
- [ ] Edit existing stock
- [ ] Try to delete stock (should work if no holdings)
- [ ] View user list
- [ ] View platform statistics

### 2. Check Cron Execution

Wait 5-10 minutes and check:
- [ ] Stock prices have changed
- [ ] Portfolio values updated
- [ ] Check Vercel logs for cron execution

### 3. Monitor Logs

Go to **Vercel Dashboard → Deployments → Latest → Function Logs**

- [ ] No critical errors
- [ ] Requests are being processed
- [ ] Cron jobs running successfully

### 4. Performance Check

- [ ] Frontend loads quickly
- [ ] API responses are fast
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All features working

---

## Production Configuration

### 1. Database Optimization

- [ ] Enable connection pooling
- [ ] Set appropriate connection limits
- [ ] Configure timeouts
- [ ] Enable query logging (temporarily for debugging)

### 2. Security

- [ ] JWT_SECRET is strong and unique
- [ ] CRON_SECRET is set and secure
- [ ] CORS allows only your frontend domain
- [ ] Database credentials are secure
- [ ] No sensitive data in logs

### 3. Monitoring

- [ ] Setup Vercel analytics (optional)
- [ ] Monitor function execution times
- [ ] Watch for error spikes
- [ ] Check database performance

### 4. Backup

- [ ] Export database schema
- [ ] Backup seed data
- [ ] Document configuration
- [ ] Save environment variables securely (password manager)

---

## Troubleshooting

### Issue: Backend deployment fails
**Check:**
- [ ] All dependencies in `package.json`
- [ ] Node version compatibility
- [ ] Prisma client generated: `npx prisma generate`

### Issue: Database connection fails
**Check:**
- [ ] DATABASE_URL is correct
- [ ] Database accepts connections from Vercel IPs
- [ ] Connection string format is correct
- [ ] SSL mode if required

### Issue: Frontend can't reach backend
**Check:**
- [ ] VITE_API_URL is set correctly
- [ ] Backend CORS allows frontend domain
- [ ] Backend is deployed and running
- [ ] No typos in URLs

### Issue: Cron not running
**Check:**
- [ ] Cron job is configured in Vercel dashboard
- [ ] Schedule syntax is correct
- [ ] CRON_SECRET is set
- [ ] Backend has the route `/api/cron/update-stocks`

### Issue: Authentication fails
**Check:**
- [ ] JWT_SECRET matches on backend
- [ ] Token is being sent in headers
- [ ] Token hasn't expired (7 days)
- [ ] User exists in database

---

## Rollback Plan

If something goes wrong:

### Option 1: Redeploy Previous Version
```bash
# In Vercel Dashboard
Go to Deployments → Previous Deployment → Redeploy
```

### Option 2: Roll Back Database
```bash
# If you have a backup
npx prisma migrate reset
# Restore from backup SQL file
```

### Option 3: Emergency Fixes
```bash
# Quick fix and redeploy
git commit -am "Emergency fix"
git push
# Vercel will auto-deploy
```

---

## Final Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database migrated and seeded
- [ ] Cron jobs running every 5 minutes
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Admin account accessible
- [ ] Test user can register
- [ ] Trading works (buy/sell)
- [ ] Portfolio updates correctly
- [ ] Leaderboard displays
- [ ] News feed shows financial news only
- [ ] Admin panel fully functional
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance is good
- [ ] Logs show no critical errors

---

## Go-Live Announcement

Once everything is verified:

### 1. Communicate to Team
- [ ] Share frontend URL
- [ ] Share admin credentials (securely)
- [ ] Document any known issues
- [ ] Provide support contact

### 2. For Participants
- [ ] Announce the platform is live
- [ ] Share registration URL
- [ ] Explain how to play
- [ ] Mention starting balance (₹5,00,000)
- [ ] Highlight leaderboard prizes

### 3. Monitor Launch
- [ ] Watch for traffic spike
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Be ready for quick fixes

---

## Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor cron execution
- [ ] Verify stock prices updating

### Weekly
- [ ] Review leaderboard standings
- [ ] Check news quality
- [ ] Monitor database size
- [ ] Review user feedback

### As Needed
- [ ] Add new stocks (admin panel)
- [ ] Adjust stock prices manually
- [ ] Create news articles
- [ ] Ban problematic users (if any)

---

## Emergency Contacts

**Technical Lead:** [Your Name]
**Database Admin:** [DBA Name]
**Vercel Support:** vercel.com/support
**API Keys Support:** newsapi.org/support

---

## Success Metrics

After launch, track:
- Total registered users
- Total transactions
- Active traders
- Top portfolio value
- Average trades per user
- News engagement
- System uptime

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Version:** 2.0.0  
**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete ✅

---

## Notes

Use this space for deployment-specific notes, issues encountered, and resolutions:

```
[Date] - [Note]
Example: Nov 6, 2025 - Initial deployment successful. Cron running smoothly.
```
