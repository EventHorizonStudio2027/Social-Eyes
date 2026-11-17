#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
printf '\nSocial Eyes — Phase 1 development launch\n\n'
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Node.js and npm are required. Install Node.js LTS from https://nodejs.org and reopen this file.'
  read -r -p 'Press Return to close... ' _
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo 'Node.js 20 or newer is required.'
  read -r -p 'Press Return to close... ' _
  exit 1
fi
if [ ! -f .env ]; then
  cp .env.example .env
  echo 'Created .env. To enable live sign-in, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  echo 'Find the publishable key in Supabase dashboard → Project Settings → API Keys.'
fi
if [ ! -d node_modules ]; then
  echo 'Installing app dependencies (internet required)...'
  npm install --no-audit --no-fund
fi
printf '\nLaunching Expo. Install Expo Go on your phone, then scan the QR code.\n'
printf 'For iPhone, use the Camera app. Keep your phone and Mac on the same Wi-Fi.\n'
printf 'If local network discovery fails, close this window and run: npx expo start --tunnel\n\n'
npx expo start --clear
