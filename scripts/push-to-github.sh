#!/bin/bash
set -e

# Usage: ./scripts/push-to-github.sh <GITHUB_USERNAME> <GITHUB_TOKEN> [REPO_NAME]
USERNAME="$1"
TOKEN="$2"
REPO_NAME="${3:-kamatela}"

if [ -z "$USERNAME" ] || [ -z "$TOKEN" ]; then
  echo "Error: Missing arguments."
  echo "Usage: ./scripts/push-to-github.sh <GITHUB_USERNAME> <GITHUB_TOKEN> [REPO_NAME]"
  exit 1
fi

echo "==> Checking or creating GitHub repository: $USERNAME/$REPO_NAME"
# Attempt to create repository via GitHub REST API
CREATE_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"description\":\"KAMATELA - Offline-first PWA SuperApp with flight video quality tiers and AI audio synth\"}")

if [ "$CREATE_RESP" = "201" ]; then
  echo "==> Repository $REPO_NAME created successfully on GitHub!"
elif [ "$CREATE_RESP" = "422" ]; then
  echo "==> Repository $REPO_NAME already exists on GitHub, proceeding to push..."
else
  echo "==> API status code: $CREATE_RESP. Proceeding to push..."
fi

# Configure remote and push
git remote remove origin 2>/dev/null || true
git remote add origin "https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"
git branch -M main

echo "==> Pushing to https://github.com/${USERNAME}/${REPO_NAME}.git..."
git push -u origin main --force

# Clean up remote with credentials from git config for security
git remote set-url origin "https://github.com/${USERNAME}/${REPO_NAME}.git"

echo "==> Push completed successfully!"
echo "==> Repository is live at: https://github.com/${USERNAME}/${REPO_NAME}"
