# 🚀 Trade Wars - Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (see options below)
- Git

### Database Options

#### Option 1: Vercel Postgres (Recommended for Production)
1. Go to [Vercel](https://vercel.com)
2. Create a new project
3. Add a Postgres database
4. Copy the `DATABASE_URL` and `POSTGRES_URL`
5. Update your `.env` file

#### Option 2: Neon (Free PostgreSQL)
1. Go to [Neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update your `.env` file with: `DATABASE_URL="postgresql://..."`

#### Option 3: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database: `createdb tradewar`
3. Update `.env`: `DATABASE_URL="postgresql://postgres:password@localhost:5432/tradewar"`

### Setup Steps

1. **Clone and Navigate**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your database connection string
   - Update other environment variables as needed

4. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

### Testing Cron Jobs

Test that stock prices are updating correctly:

```bash
node test-cron.js
```

This will:
- Update all stock prices
- Recalculate all portfolio values
- Show success/error messages

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## Production Deployment (Vercel)

### Backend Deployment

1. **Push to GitHub** (Already done! ✅)

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory to `backend`
   - Add environment variables:
     - `DATABASE_URL` - Your Vercel Postgres connection string
     - `JWT_SECRET` - A secure random string
     - `CRON_SECRET` - Another secure random string
     - `FRONTEND_URL` - Your frontend URL
   - Deploy!

3. **Enable Cron Jobs**
   - Vercel automatically detects `vercel.json` cron configuration
   - Cron will run every minute to update stock prices
   - Check "Cron Jobs" tab in your Vercel project

### Frontend Deployment

1. **Deploy to Vercel**
   - Import your GitHub repository again
   - Set the root directory to `frontend`
   - Add environment variable:
     - `VITE_API_URL` - Your backend API URL from step 2
   - Deploy!

## Features Deployed

✅ **Admin-Only Leaderboard**
- Only admin users can view the leaderboard
- Secured with requireAdmin middleware

✅ **Complete Profit/Loss Tracking**
- Realized P/L from completed sales
- Unrealized P/L from current holdings
- Total P/L = Realized + Unrealized

✅ **Trending Stocks**
- Shows top 5 most bought stocks (24h)
- Shows top 5 most sold stocks (24h)
- Updates every 5 minutes on dashboard

✅ **Dynamic Stock Pricing**
- Prices adjust based on buy/sell pressure
- Updates every 30 seconds (local) or every minute (Vercel cron)
- Max 5% price change per hour

✅ **Automatic Updates**
- Stock prices update automatically
- Portfolio values recalculate automatically
- News fetches every 10 minutes (when API keys provided)

## API Endpoints

### Health Check
```
GET /api/health
```

### Cron Jobs
```
GET /api/cron/update-stocks - Update all stocks (Vercel Cron)
POST /api/cron/trigger-update - Manual trigger
```

### Testing Locally

1. **Test API**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test Cron**
   ```bash
   node test-cron.js
   ```

3. **Monitor Logs**
   - Stock updates log every 30 seconds
   - Portfolio updates log after stock updates
   - Check console for "✅" success messages

## Troubleshooting

### Database Connection Failed
- Check your `DATABASE_URL` in `.env`
- Ensure database is running
- Try `npx prisma db push` to sync schema

### Cron Jobs Not Running
- For Vercel: Check "Cron Jobs" tab in project
- For Local: The stock tracker starts automatically with `npm run dev`
- Test manually with `node test-cron.js`

### Migrations Failed
- Run `npx prisma migrate deploy` instead of `migrate dev`
- Check `prisma/migrations/` folder for migration files
- Ensure all new fields are in schema.prisma

## Environment Variables Reference

### Backend (.env)
```bash
DATABASE_URL=postgresql://...          # Required: Database connection
JWT_SECRET=your-secret-key             # Required: JWT signing key
CRON_SECRET=your-cron-secret          # Required: Cron job security
PORT=3000                              # Optional: Server port
NODE_ENV=development                   # Optional: Environment
FRONTEND_URL=http://localhost:5173     # Required: CORS origin
NEWS_API_KEY=                          # Optional: For real news
ALPHA_VANTAGE_API_KEY=                # Optional: For real stock data
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api # Required: Backend API URL
```

## Support

If you encounter any issues:
1. Check the console logs
2. Verify all environment variables are set
3. Ensure database is accessible
4. Test cron jobs manually with `node test-cron.js`

Happy Trading! 📈💰
