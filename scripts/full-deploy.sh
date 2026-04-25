#!/bin/bash

# Full deployment script for Respawn platform
# This script pushes changes to GitHub and deploys to Firebase

echo "🚀 Starting full deployment process..."
echo "This will:"
echo "1. Push changes to GitHub"
echo "2. Build the project"
echo "3. Deploy to Firebase"
echo ""

# Confirm deployment
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Step 1: Push to GitHub
echo "📝 Step 1: Pushing to GitHub..."
bash scripts/git-push.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub. Stopping deployment."
    exit 1
fi

echo "✅ GitHub push completed successfully!"
echo ""

# Step 2: Build and Deploy to Firebase
echo "🏗️  Step 2: Building and deploying to Firebase..."
bash scripts/deploy.sh

if [ $? -ne 0 ]; then
    echo "❌ Firebase deployment failed"
    exit 1
fi

echo ""
echo "🎉 Full deployment completed successfully!"
echo "📱 GitHub: https://github.com/Danchouvzv/Respawn"
echo "🌐 Live site: https://respawn-76195.web.app"
echo "✨ Your unique, minimalist landing page is now live!" 