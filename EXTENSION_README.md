# ⚡ BeamPay Chrome Extension

A Chrome extension for sending USDC payments using EIP-7702 delegation and traditional blockchain transactions. Built from the existing TypeScript CLI codebase with full environment variable support.

## 🚀 Features

- **✅ Multi-Network Support**: 11 blockchain networks supported
- **✅ EIP-7702 Delegation**: Automatic delegation for Ethereum, World Chain, and Zircuit
- **✅ Environment Variables**: Uses your existing `.env` configuration
- **✅ Beautiful UI**: Modern popup interface with real-time network information
- **✅ Form Persistence**: Automatically saves form inputs
- **✅ Dry Run Mode**: Test transactions before sending
- **✅ TypeScript**: Built with full type safety from existing codebase

## 🌍 Supported Networks

| Network | Chain ID | EIP-7702 | USDC Address |
|---------|----------|----------|--------------|
| **Ethereum** | 1 | ✅ | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 |
| **Zircuit** | 48900 | ✅ | 0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF |
| **Flow** | 747 | ✅ | 0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52 |

## 🛠️ Installation

### Step 1: Prerequisites

Make sure you have the CLI project working with your `.env` file:

```bash
# Your .env file should contain:
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

### Step 2: Build the Extension

```bash
# Install extension dependencies (if not already done)
npm install

# Build the Chrome extension
npm run build-extension
```

This will create the extension files in the `dist/` directory:
- `manifest.json` - Extension configuration
- `popup.html` - UI interface  
- `popup.js` - Frontend logic (bundled)
- `background.js` - Blockchain logic (bundled)

### Step 3: Load Extension in Chrome

1. **Open Chrome Extensions Page**:
   - Go to `chrome://extensions/`
   - Or click Menu → More Tools → Extensions

2. **Enable Developer Mode**:
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `dist/` folder from your project
   - The BeamPay extension should appear in your extensions list

4. **Verify Installation**:
   - The BeamPay icon (⚡) should appear in your Chrome toolbar
   - Click it to open the popup interface

## 🎯 Usage

### Basic Payment Flow

1. **Open BeamPay**:
   - Click the ⚡ BeamPay icon in your Chrome toolbar

2. **Select Network**:
   - Choose from 3 supported networks (Ethereum, Zircuit & Flow)
   - Network info shows: Chain ID, USDC address, EIP-7702 support

3. **Enter Payment Details**:
   - **Amount**: USDC amount to send (0.000001 - 1,000,000)
   - **Recipient**: Destination wallet address (0x...)
   - **Payment ID**: Unique identifier for tracking

4. **Test or Send**:
   - **Dry Run**: Validate inputs and preview transaction
   - **Send Payment**: Execute the actual transaction

### EIP-7702 Delegation

For networks that support EIP-7702 (Ethereum, Zircuit & Flow):

- ✅ **Automatic Detection**: Extension checks for existing delegations
- ✅ **Smart Creation**: Creates new delegation if needed
- ✅ **Efficient Execution**: Uses delegated account for multi-call transactions
- ✅ **Cost Effective**: Combines commit → transfer → reveal in one transaction

### Form Persistence

The extension automatically saves your inputs:
- Network selection
- Last used recipient address  
- Previous payment ID
- Amount preference

## 🔧 Development

### Extension Architecture

```
BeamPay Extension
├── 🎨 popup.html/popup.js    # User interface
├── 🔧 background.js          # Blockchain logic  
├── 📦 Shared TypeScript      # Reuses CLI codebase
└── 🌐 Environment Variables  # Uses .env configuration
```

### Build Commands

```bash
# Development build with watch mode
npm run dev-extension

# Production build (minified)  
npm run build-extension

# Clean build artifacts
npm run clean
```

### Debugging

1. **Popup Debugging**:
   - Right-click on BeamPay icon → "Inspect popup"
   - View console logs and debug UI

2. **Background Script Debugging**:
   - Go to `chrome://extensions/`
   - Click "background page" under BeamPay
   - View blockchain transaction logs

3. **Transaction Logs**:
   ```javascript
   // Background script logs include:
   console.log('Sending 1 USDC to 0x... on ethereum');
   console.log('Payment ID: demo-payment');
   console.log('Method: EIP-7702 delegation');
   ```

## 🔐 Security

### Environment Variables
- ✅ **Private Key**: Read from your existing `.env` file
- ✅ **Network Config**: Automatic configuration per network
- ✅ **No Hardcoding**: No sensitive data in extension code

### Transaction Safety
- ✅ **Dry Run Mode**: Test before sending real transactions
- ✅ **Input Validation**: Address, amount, and payment ID validation
- ✅ **Network Verification**: Automatic network and contract validation
- ✅ **Error Handling**: Comprehensive error messages and recovery

### ⚠️ Security Notes
- This uses your CLI private key - ensure your `.env` file is secure
- Only install this extension locally for development/testing
- For production, integrate with MetaMask or hardware wallets

## 🚨 Troubleshooting

### Extension Not Loading
```bash
# Check if dependencies are installed
npm install

# Rebuild the extension
npm run build-extension

# Verify dist/ folder contains all files
ls -la dist/
```

### Private Key Errors
- Verify `.env` file exists with `PRIVATE_KEY=0x...`
- Check that webpack loaded environment variables successfully
- Look for "Private key configured: true" in background script logs

### Transaction Failures
- Use **Dry Run** first to test parameters
- Check network connectivity and RPC status
- Verify sufficient balance (not checked in extension)
- Review background script console for detailed errors

### Network Issues
- Some networks may have temporary RPC issues
- Try switching to a different network to test
- Check if the network is currently supported

## 🛣️ Roadmap

### Planned Features
- [ ] **MetaMask Integration**: Remove private key requirement
- [ ] **Transaction History**: Track past payments
- [ ] **Balance Display**: Show USDC balance per network
- [ ] **Gas Estimation**: Preview transaction costs
- [ ] **Multi-Recipient**: Send to multiple addresses
- [ ] **Recurring Payments**: Scheduled transactions

### Network Expansion
- [ ] **More EIP-7702 Networks**: As they become available
- [ ] **L2 Optimization**: Network-specific optimizations
- [ ] **Cross-Chain**: Bridge transactions between networks

## 📞 Support

### Getting Help
1. Check this README for common issues
2. Review the main project README.md
3. Check Chrome extension console for errors
4. Verify your `.env` configuration

### Development
- Built with TypeScript + Webpack
- Uses existing CLI codebase for blockchain logic
- Extends viem library for EIP-7702 support
- Chrome Extension Manifest V3

---

**⚡ BeamPay - Making USDC payments fast, secure, and efficient across multiple blockchains!** 