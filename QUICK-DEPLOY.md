# ⚡ Quick Deploy Guide

## 🚀 Deploy in One Command

```bash
./scripts/full-deploy.sh
```

This will:
1. Push to GitHub: https://github.com/Danchouvzv/Respawn
2. Deploy to Firebase: https://respawn-76195.web.app

## 📋 Prerequisites Check

```bash
# Check if Firebase CLI is installed
firebase --version

# Check if you're logged in
firebase login:list

# Check Git status
git status
```

## 🔧 Quick Setup (if needed)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Make scripts executable
chmod +x scripts/*.sh
```

## 🎉 That's it!

Your unique, minimalist landing page will be live in minutes! 