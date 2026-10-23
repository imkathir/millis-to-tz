#!/usr/bin/env bash
# Deploy Millis to TZ to GitHub and GitHub Pages
# Usage: ./deploy-gh-pages.sh [YOUR_REPO_NAME]

REPO_NAME="${1:-millis-to-tz}"
GITHUB_USER="imkathir"

echo "=================================================="
echo " Deploying Millis to TZ to GitHub Pages"
echo " Target: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo " Live URL: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
echo "=================================================="

# 1. Build the production static bundle
echo "Building static production files..."
npm run build

# 2. Update remote URL if needed
git remote set-url origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# 3. Push to main branch
echo "Pushing code to main branch..."
git push -u origin main

echo ""
echo "Done! The GitHub Actions workflow (.github/workflows/deploy.yml) will automatically publish to GitHub Pages."
echo "Check progress at: https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
