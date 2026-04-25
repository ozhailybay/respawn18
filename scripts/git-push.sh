#!/bin/bash

# Git push script for Respawn platform
# This script commits changes and pushes them to GitHub

echo "📝 Preparing to push changes to GitHub..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "git init"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "git remote add origin https://github.com/Danchouvzv/Respawn.git"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📋 Found uncommitted changes. Adding them..."
    
    # Show status
    git status --short
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    COMMIT_MESSAGE="Updated landing page design and added Register component - $TIMESTAMP"
    
    echo "💬 Commit message: $COMMIT_MESSAGE"
    git commit -m "$COMMIT_MESSAGE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Changes committed successfully"
    else
        echo "❌ Failed to commit changes"
        exit 1
    fi
else
    echo "ℹ️  No uncommitted changes found"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin $CURRENT_BRANCH

# Check push status
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository: https://github.com/Danchouvzv/Respawn"
    echo "📱 Branch: $CURRENT_BRANCH"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

echo "🎉 Git push completed successfully!" 