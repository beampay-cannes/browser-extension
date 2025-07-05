#!/bin/bash

echo "🚀 BeamPay Extension Installation"
echo "================================"
echo ""

# Build the extension
echo "Step 1: Building extension..."
npm run build-extension

echo ""
echo "Step 2: Extension files created in dist/ directory:"
ls -la dist/

echo ""
echo "Step 3: Installing in Chrome..."
echo ""
echo "MANUAL STEPS:"
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'dist/' folder from this project"
echo "5. BeamPay should appear in your extensions list"
echo ""

# Open Chrome extensions page
echo "Opening Chrome extensions page..."
if command -v open &> /dev/null; then
    open -a "Google Chrome" "chrome://extensions/"
elif command -v xdg-open &> /dev/null; then
    xdg-open "chrome://extensions/"
else
    echo "Please manually open: chrome://extensions/"
fi

echo ""
echo "Step 4: Test installation..."
echo "After installing, open: beampay-dapp-example.html"
echo "You should see: ✅ BeamPay extension detected and ready!"
echo ""

# Open the test page
echo "Opening test page..."
if command -v open &> /dev/null; then
    open beampay-dapp-example.html
elif command -v xdg-open &> /dev/null; then
    xdg-open beampay-dapp-example.html
else
    echo "Please manually open: beampay-dapp-example.html"
fi

echo ""
echo "🔧 Troubleshooting:"
echo "- Make sure Developer mode is ON in Chrome extensions"
echo "- If extension doesn't load, check the console for errors"
echo "- Reload the extension after any changes"
echo "- Refresh web pages after installing the extension"
echo ""
echo "✅ Installation complete! Check Chrome extensions page." 