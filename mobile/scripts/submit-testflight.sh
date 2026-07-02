#!/usr/bin/env bash
# Run this in YOUR terminal (interactive — Apple login required on first run).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Building iOS production IPA on EAS and submitting to TestFlight..."
echo "  Project: https://expo.dev/accounts/dhruvh/projects/monkeymac"
echo ""
echo "You will be prompted to sign in with your Apple Developer account"
echo "if credentials are not set up yet."
echo ""

eas build --platform ios --profile production --auto-submit

echo ""
echo "Done. Check TestFlight in App Store Connect in ~10–30 minutes."
echo "https://appstoreconnect.apple.com"
