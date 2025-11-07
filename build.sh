#!/bin/bash
echo "Starting Vercel build..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
npm install

# Build using npx
npx ng build --configuration=production

echo "Build completed!"