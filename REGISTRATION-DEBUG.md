# 🐛 Registration Troubleshooting Guide

## Issue: Users Not Appearing in Database

If you're trying to register new users but they're not showing up in your database, follow these debugging steps:

---

## 🔍 Step 1: Check Browser Console

1. Open your site: https://trade-wars-three.vercel.app/register
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to register a new user
5. Look for these messages:

### ✅ Good Signs:
```
🔧 API Configuration: {
  VITE_API_URL: "https://trade-wars-backend.vercel.app/api",
  API_URL: "https://trade-wars-backend.vercel.app/api",
  mode: "production"
}
```

```
📤 Register request to: https://trade-wars-backend.vercel.app/api/auth/register
✅ Registration successful: {username: "testuser", ...}
```

### ❌ Bad Signs:
```
🔧 API Configuration: {
  VITE_API_URL: undefined,
  API_URL: "http://localhost:3000/api",  ← WRONG!
  mode: "production"
}
```

```
❌ Registration error: Network Error
❌ Registration error: 500 Internal Server Error
❌ Registration error: Username already exists
```

---

## 🔍 Step 2: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Try registering again
3. Look for a request to `/auth/register`
4. Click on it to see details

### Check Request URL:
- ✅ Should be: `https://trade-wars-backend.vercel.app/api/auth/register`
- ❌ NOT: `http://localhost:3000/api/auth/register`

### Check Response:
- **Status 201** = Success ✅
- **Status 400** = Validation error (username/email exists)
- **Status 500** = Backend error

---

## 🔍 Step 3: Check Backend Logs

1. Go to: https://vercel.com/dashboard
2. Select **backend project** (trade-wars-backend)
3. Go to **Logs** tab
4. Try registering a new user
5. Watch for real-time logs

### ✅ Success looks like:
```
✅ User registered: newusername
```

### ❌ Errors look like:
```
❌ Register error: PrismaClientKnownRequestError
❌ Database connection failed
❌ Unique constraint failed
```

---

## 🔧 Common Issues & Fixes

### Issue 1: API URL is localhost
**Symptom:** Console shows `http://localhost:3000/api`

**Fix:**
1. Go to Vercel Dashboard → Frontend Project
2. Settings → Environment Variables
3. Add: `VITE_API_URL` = `https://trade-wars-backend.vercel.app/api`
4. Redeploy frontend (Deployments → Redeploy without cache)

---

### Issue 2: "Username already exists"
**Symptom:** Error message says username is taken

**Fix:**
- Username is already in database
- Try a different username
- Or delete the existing user from database

---

### Issue 3: Database Connection Error
**Symptom:** Backend logs show "Can't reach database server"

**Fix:**
1. Go to Vercel Dashboard → Backend Project
2. Settings → Environment Variables
3. Check `DATABASE_URL` is set correctly
4. Should look like: `postgresql://user:pass@host.prisma.io:5432/db`
5. Redeploy backend if changed

---

### Issue 4: "Network Error" / CORS
**Symptom:** Console shows network error, no request visible

**Fix:**
Check backend server.js has CORS configured:
```javascript
app.use(cors({
  origin: ['https://trade-wars-three.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

---

### Issue 5: Registration Succeeds But User Not in DB
**Symptom:** Success message shows, but database empty

**Possible causes:**
1. **Wrong database connection** - Backend connected to different database
2. **Transaction rollback** - Error after user creation
3. **Caching** - Refresh database view in Prisma Studio

**Fix:**
1. Check `DATABASE_URL` in backend Vercel settings
2. Check backend logs for errors after "User registered"
3. Refresh your database viewer
4. Try direct database query:
   ```sql
   SELECT * FROM "User" ORDER BY "createdAt" DESC;
   ```

---

## 📊 Test Registration Properly

### Step-by-Step Test:
1. Open browser in **Incognito Mode**
2. Go to: https://trade-wars-three.vercel.app/register
3. Open Console (F12)
4. Fill registration form with **unique** username/email
5. Click Register
6. Watch console for logs
7. Check backend Vercel logs
8. Refresh database

### Test with curl (Bypass Frontend):
```bash
curl -X POST https://trade-wars-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser999","email":"test999@test.com","password":"test123"}'
```

If this works but frontend doesn't, it's a frontend issue.
If this fails, it's a backend issue.

---

## 🎯 Quick Checklist

Before reporting "registration not working":

- [ ] Check console logs (F12 → Console)
- [ ] Verify API URL is correct (should be backend.vercel.app, not localhost)
- [ ] Check Network tab for request/response
- [ ] View backend logs in Vercel
- [ ] Try unique username/email
- [ ] Test in incognito mode
- [ ] Refresh database view
- [ ] Wait 10 seconds and refresh database again
- [ ] Check if email already exists in database

---

## 🚀 After Fixing

Once you identify and fix the issue:

1. **Redeploy affected project** (frontend or backend)
2. **Clear browser cache** (Ctrl + Shift + Delete)
3. **Test in incognito mode**
4. **Check database** for new user
5. **Try logging in** with new credentials

---

## 📞 Still Not Working?

If you've gone through all steps and it still doesn't work:

1. Take screenshot of:
   - Browser console (F12)
   - Network tab showing the register request
   - Backend Vercel logs
   - Database view showing users

2. Check these files match:
   - Frontend API URL: Should point to backend
   - Backend CORS: Should allow frontend domain
   - Database URL: Should point to correct database

3. Try these test commands:
   ```powershell
   # Test backend is reachable
   curl https://trade-wars-backend.vercel.app/api/stocks
   
   # Test registration endpoint
   curl -X POST https://trade-wars-backend.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"debug123","email":"debug@test.com","password":"test123"}'
   ```

---

## ✅ Expected Flow

When everything works correctly:

1. User fills registration form
2. Frontend console: `📤 Register request to: https://trade-wars-backend.vercel.app/api/auth/register`
3. Backend receives request
4. Backend logs: `✅ User registered: username`
5. Backend returns token and user data
6. Frontend console: `✅ Registration successful`
7. User redirected to dashboard
8. **User appears in database within 2-3 seconds**

---

Good luck debugging! 🔧
