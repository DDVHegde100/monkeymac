# MongoDB Atlas Free Setup - Step by Step

## 🚀 Quick Setup (5 minutes to get free cloud database)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (ddvhegde100@gmail.com)
3. Choose "Build a Database"

### Step 2: Create FREE Cluster
1. Select **"M0 Sandbox"** (FREE FOREVER - 512 MB)
2. Choose **AWS** as provider
3. Choose region closest to you (e.g., **US East (N. Virginia)**)
4. Cluster Name: `MonkeyMac-Cluster`
5. Click **"Create"**

### Step 3: Create Database User
1. Username: `monkeymac-admin`
2. Password: **Generate secure password** (SAVE THIS!)
3. Database User Privileges: **"Atlas admin"**
4. Click **"Add User"**

### Step 4: Network Access (Allow from Anywhere)
1. Click **"Add IP Address"**
2. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **"Confirm"**

### Step 5: Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** driver
4. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://monkeymac-admin:<password>@monkeymac-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Environment Variables

**Local Development (.env.local):**
Replace your `.env.local` file with:
```env
MONGODB_URI=mongodb+srv://monkeymac-admin:YOUR_PASSWORD_HERE@monkeymac-cluster.xxxxx.mongodb.net/monkeymax?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-this-in-production-to-something-more-secure
NODE_ENV=development
```

**Production (Vercel Dashboard):**
1. Go to: https://vercel.com/dashboard
2. Click your `monkeymac` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `MONGODB_URI` = your connection string (same as above)
   - `JWT_SECRET` = same secret as above
   - `NODE_ENV` = production

### Step 7: Test It Works
1. Save your `.env.local` file
2. Restart your dev server: `npm run dev`
3. Go to http://localhost:3000
4. Click "Sign Up" and create an account
5. If successful, you'll see your name on the homepage!

---

## 🎯 What This Gives You:
- ✅ **FREE** MongoDB database (512MB - plenty for thousands of users)
- ✅ **Works everywhere**: Local development + Production
- ✅ **Automatic scaling**: Handles traffic spikes
- ✅ **24/7 uptime**: Professional cloud hosting
- ✅ **Secure**: Enterprise-grade security

## 🔒 Security:
- Your database is password protected
- SSL/TLS encryption
- Network access controls
- User authentication required

Ready to set this up? It takes 5 minutes and your app will work globally! 🌍
