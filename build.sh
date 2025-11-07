#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building Angular application..."
./node_modules/.bin/ng build --configuration=production

echo "Build completed successfully!"
echo "Output directory: dist/flex-review-management/browser"
ls -la dist/flex-review-management/browser/