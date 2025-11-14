# 🚀 Database Update Instructions

## Run this to update your database to 100 stocks!

### Option 1: Via Vercel CLI (Recommended)
```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to backend folder
cd backend

# Run seed script on production database
vercel env pull .env.production
node prisma/seed.js
```

### Option 2: Via Local Terminal (If DATABASE_URL is accessible)
```bash
cd backend
node prisma/seed.js
```

### Option 3: Manual via Prisma Studio
1. Open Prisma Studio locally:
   ```bash
   cd backend
   npx prisma studio
   ```
2. Delete all stocks manually
3. Re-seed with the script

### Option 4: Add Seed Endpoint (Quick & Easy)
I can create an admin-only endpoint `/api/admin/seed` that you can call once to seed the database.

---

## What This Does:

✅ Clears old 29 stocks
✅ Creates exactly **100 stocks** across **15 sectors**:
- Banking (8 stocks)
- IT (8 stocks)
- FMCG (8 stocks)
- Pharma (8 stocks)
- Automobile (7 stocks)
- Energy (7 stocks)
- Telecom (2 stocks)
- Cement (5 stocks)
- Metals (5 stocks)
- Insurance (6 stocks)
- Financial Services (6 stocks)
- Infrastructure (5 stocks)
- Retail (3 stocks)
- Healthcare (3 stocks)
- Consumer Goods (9 stocks)

✅ Keeps your existing users (admin, testuser, and any new users)
✅ Resets stock IDs to start from 1
✅ Each stock gets realistic prices, volume, and market data

---

## Expected Output:

```
🌱 Starting database seed...
✅ Cleared existing data
✅ Created admin user
✅ Created test user
📊 Creating 100 stocks...
✅ Created 100 stocks

📈 Stock Distribution:
  Consumer Goods: 9 stocks
  Banking: 8 stocks
  IT: 8 stocks
  FMCG: 8 stocks
  Pharma: 8 stocks
  Automobile: 7 stocks
  Energy: 7 stocks
  Insurance: 6 stocks
  Financial Services: 6 stocks
  Cement: 5 stocks
  Metals: 5 stocks
  Infrastructure: 5 stocks
  Retail: 3 stocks
  Healthcare: 3 stocks
  Telecom: 2 stocks

✅ Total: 100 stocks across 15 sectors
```

---

## After Seeding:

1. Refresh your app
2. Dashboard will show all 100 stocks
3. Trending stocks will work correctly
4. Users can start trading!

🎉 Your platform is ready!
