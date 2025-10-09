# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### 1. Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Click "Try Free" 
3. Sign up with your email

### 2. Create a Free Cluster
1. Choose "Build a Database"
2. Select "FREE" (M0 Sandbox)
3. Choose your preferred cloud provider and region
4. Name your cluster (e.g., "MonkeyMac")
5. Click "Create"

### 3. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `monkeymac-user`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Atlas admin"
7. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 5. Get Your Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

### 6. Update Your .env.local File
Replace the MONGODB_URI in your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://monkeymac-user:<password>@your-cluster.mongodb.net/monkeymax?retryWrites=true&w=majority
```

**Important:** Replace `<password>` with your actual database user password!

### 7. Test the Connection
1. Save your `.env.local` file
2. Try registering a new user on your app
3. Check the MongoDB Atlas "Collections" tab to see your data

## Database Structure
Your app will automatically create these collections:
- `users` - User accounts with authentication and profile data
- `testResults` - Math test scores and statistics (coming soon)

## Security Notes
- ✅ Your connection string contains credentials - never commit .env.local to git
- ✅ The .gitignore file already excludes .env.local
- ✅ For production, use environment variables in Vercel dashboard

## Troubleshooting
- **Connection timeout?** Check Network Access allows your IP
- **Authentication failed?** Verify username/password in connection string
- **Database not created?** It will be created automatically on first write

Your MongoDB Atlas database is ready for MonkeyMac! 🐒
