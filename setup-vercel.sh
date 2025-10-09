#!/bin/bash

# MonkeyMac Vercel Environment Setup
# Run this after setting up MongoDB Atlas

echo "🐒 MonkeyMac - Setting up Vercel Environment Variables"
echo "=================================================="

# Check if user has MongoDB Atlas connection string
echo ""
read -p "Enter your MongoDB Atlas connection string: " MONGODB_URI
read -p "Enter your JWT secret (or press enter for default): " JWT_SECRET

# Use default JWT secret if not provided
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="monkeymac-jwt-secret-$(date +%s)"
fi

echo ""
echo "Setting up Vercel environment variables..."

# Set environment variables using Vercel CLI
vercel env add MONGODB_URI production <<< "$MONGODB_URI"
vercel env add JWT_SECRET production <<< "$JWT_SECRET"
vercel env add NODE_ENV production <<< "production"

echo ""
echo "✅ Environment variables set!"
echo "🚀 Deploying to production..."

# Deploy to production
vercel --prod

echo ""
echo "🎉 MonkeyMac is now live with MongoDB Atlas!"
echo "🌍 Your app works globally with cloud database"
echo ""
echo "Test it at: https://monkeymath.vercel.app"
