# 🚀 BeamPay Extension Installation Guide

## Step 1: Build the Extension

```bash
npm run build-extension
```

This creates the extension files in the `dist/` directory.

## Step 2: Install in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. The BeamPay extension should now appear in your extensions list

## Step 3: Verify Installation

1. Look for the BeamPay icon in your Chrome toolbar
2. Click on it to open the popup
3. You should see the BeamPay interface

## Step 4: Test with dApp Example

1. Open `beampay-dapp-example.html` in Chrome
2. You should see "✅ BeamPay extension detected and ready!"
3. Try sending a test payment

## Troubleshooting

### "BeamPay extension not found"

If you see this error:

1. **Check Extension is Installed**: Go to `chrome://extensions/` and verify BeamPay is listed and enabled
2. **Check Developer Mode**: Make sure "Developer mode" is ON in Chrome extensions
3. **Reload Extension**: In `chrome://extensions/`, click the reload button on BeamPay
4. **Refresh Page**: Reload the webpage trying to use BeamPay
5. **Check Console**: Open Developer Tools (F12) and check for errors

### Extension Not Loading

1. **Check Build**: Run `npm run build-extension` again
2. **Check Manifest**: Verify `dist/manifest.json` exists
3. **Check Content Script**: Verify `dist/content.js` exists
4. **Reload Extension**: Remove and re-add the extension

### Content Script Not Injecting

1. **Check Permissions**: Extension should have "activeTab" permission
2. **Check Content Script**: Verify it's listed in manifest.json
3. **Check Console**: Look for BeamPay content script logs

## Quick Install Command

```bash
# Build and open extensions page
npm run build-extension && open -a "Google Chrome" "chrome://extensions/"
```

## Environment Setup

Make sure you have a `.env` file with:
```
PRIVATE_KEY=0x...your_private_key_here
```

## Testing

After installation, test with:
```javascript
// In browser console
console.log('BeamPay available:', !!window.beampay);
console.log('BeamPay ready:', window.beampay?.isAvailable());
``` 