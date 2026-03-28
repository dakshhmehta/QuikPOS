#!/bin/bash

# QuikPOS GitHub Pages Deployment Script

echo "🚀 Deploying QuikPOS to GitHub Pages..."

# Repository details
REPO_URL="https://github.com/dakshhmehta/QuikPOS.git"
DIST_DIR="/app/frontend/dist"

# Create a temporary directory for gh-pages
TMP_DIR=$(mktemp -d)
echo "📁 Created temp directory: $TMP_DIR"

# Copy dist files to temp directory
echo "📦 Copying build files..."
cp -r $DIST_DIR/* $TMP_DIR/
cp $DIST_DIR/.nojekyll $TMP_DIR/

# Navigate to temp directory
cd $TMP_DIR

# Initialize git
echo "🔧 Initializing git repository..."
git init
git config user.name "QuikPOS Deployer"
git config user.email "deploy@quikpos.app"

# Add all files
echo "➕ Adding files..."
git add -A

# Commit
echo "💾 Creating commit..."
git commit -m "Deploy QuikPOS PWA to GitHub Pages"

# Add remote and push to gh-pages branch
echo "🌐 Pushing to gh-pages branch..."
git remote add origin $REPO_URL

echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "To complete the deployment, run these commands from your local machine:"
echo ""
echo "cd $TMP_DIR"
echo "git push -f origin main:gh-pages"
echo ""
echo "Or push from /app directory:"
echo "cd /app"
echo "git subtree push --prefix frontend/dist origin gh-pages"
echo ""
echo "✅ Files are ready in: $TMP_DIR"
echo "📊 Total files: $(ls -1 $TMP_DIR | wc -l)"
echo ""
echo "After pushing, configure GitHub Pages:"
echo "1. Go to: https://github.com/dakshhmehta/QuikPOS/settings/pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: gh-pages / (root)"
echo "4. Click Save"
echo ""
echo "Your app will be live at: https://dakshhmehta.github.io/QuikPOS"
