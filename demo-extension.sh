#!/bin/bash

echo "⚡ BeamPay Chrome Extension Demo Setup"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your PRIVATE_KEY:"
    echo ""
    echo "PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    echo ""
    exit 1
fi

echo "✅ .env file found"

# Check if PRIVATE_KEY is set
if grep -q "PRIVATE_KEY=" .env; then
    echo "✅ PRIVATE_KEY configured in .env"
else
    echo "❌ PRIVATE_KEY not found in .env file"
    echo "Please add your private key to .env:"
    echo "PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the extension
echo "🔨 Building BeamPay Chrome extension..."
npm run build-extension

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 BeamPay extension built successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode' (toggle in top right)"
    echo "3. Click 'Load unpacked'"
    echo "4. Select the 'dist/' folder from this directory"
    echo "5. Look for the ⚡ BeamPay icon in your Chrome toolbar"
    echo ""
    echo "🧪 Test the extension:"
    echo "• Click the BeamPay icon"
    echo "• Select 'Ethereum' network"
    echo "• Enter a test recipient address"
    echo "• Try 'Dry Run' first to test functionality"
    echo ""
    echo "📁 Extension files created in dist/:"
    ls -la dist/
    echo ""
    echo "🔍 Debug tips:"
    echo "• Right-click BeamPay icon → 'Inspect popup' for frontend debugging"
    echo "• Go to chrome://extensions/ → Click 'background page' under BeamPay for backend logs"
    echo ""
else
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi 