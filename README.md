# Delegator CLI

A TypeScript CLI tool for EIP-7702 delegation checking and calldata formation across different blockchain networks.

## Features

✅ **CLI Arguments**: Amount, recipient wallet address, and payment ID (string)  
✅ **Environment Variables**: RPC URL, private key, delegator address, and eventor address from `.env` file  
✅ **Multi-Network Support**: 11+ blockchain networks supported  
✅ **EIP-7702 Delegation Check**: Detects if address has contract code (delegated account)  
✅ **Delegation Validation**: Checks if delegation target matches DELEGATOR_ADDRESS from env  
✅ **Calldata Formation**: Creates array of (address, uint256, bytes) tuples with eventor commit and USDC transfer  
✅ **Address Derivation**: Shows address derived from private key  
✅ **Input Validation**: Validates wallet addresses, amounts, and payment ID strings  
✅ **Error Handling**: Comprehensive error messages for common issues

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Environment Setup

Create a `.env` file in the root directory with the following variables. You can copy the `env.template` file as a starting point:

```bash
cp env.template .env
```

Then edit `.env` with your actual values:

```bash
# RPC URL for the blockchain network
# You can get these from providers like Infura, Alchemy, or QuickNode
# Examples:
# Ethereum mainnet: https://mainnet.infura.io/v3/YOUR_PROJECT_ID
# Arbitrum: https://arbitrum-mainnet.infura.io/v3/YOUR_PROJECT_ID
# Avalanche: https://avalanche-mainnet.infura.io/v3/YOUR_PROJECT_ID
# Base: https://base-mainnet.infura.io/v3/YOUR_PROJECT_ID
# Optimism: https://optimism-mainnet.infura.io/v3/YOUR_PROJECT_ID
# Polygon: https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Private key of the wallet to send USDC from
# Make sure this wallet has USDC and ETH/MATIC/etc for gas fees
# NEVER commit your real private key to version control!
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

DELEGATOR_ADDRESS=0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c

# Address of the Eventor smart contract
EVENTOR_ADDRESS=0x1234567890123456789012345678901234567890
```

**Important:** 
- Replace `YOUR_PROJECT_ID` with your actual RPC provider project ID
- Replace the example private key with your actual private key
- The `.env` file is already added to `.gitignore` to prevent accidental commits

## Usage

### Basic Usage

Simulate USDC transfer to a recipient:
```bash
npm run start <amount> <recipient_address> <payment_id>
```

### Examples

```bash
# Check delegation and create calldata for 100 USDC transfer on Ethereum
npm run start 100 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c "payment_12345"

# Check delegation and create calldata for 50.5 USDC transfer on Polygon
npm run start 50.5 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c "invoice_abc123" --network polygon

# Check delegation and create calldata for 25 USDC transfer on Base
npm run start 25 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c "order_xyz789" --network base

# Check delegation and create calldata for 10 USDC transfer on Arbitrum
npm run start 10 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c "transaction_456" --network arbitrum
```

### Development

Run in development mode:
```bash
npm run dev <amount> <recipient_address>
```

### Options

- `--network, -n`: Specify the network (ethereum, arbitrum, avalanche, base, celo, linea, optimism, polygon, unichain, worldchain) - defaults to ethereum
- `--dry-run, -d`: Perform a dry run without sending the transaction

### EIP-7702 Delegation Detection

The CLI automatically checks if the address derived from your private key has contract code, which indicates EIP-7702 delegation:

- **🔗 EIP-7702 Delegation detected**: The address has EIP-7702 delegation code
  - Shows the target address it's delegated to
  - Displays the full delegation code
- **📄 Regular Contract**: Address has contract code but not EIP-7702 format
  - Shows the first 50 characters of the contract code
- **👤 Regular EOA**: No contract code detected (standard externally owned account)

This helps identify if you're using a delegated account that follows the EIP-7702 standard and shows exactly where it's delegated to.

### Supported Networks

- **ethereum** (or **mainnet**): Ethereum mainnet
- **arbitrum**: Arbitrum network
- **avalanche**: Avalanche C-Chain
- **base**: Base network
- **celo**: Celo network
- **codex**: Codex network
- **linea**: Linea network
- **optimism**: OP Mainnet
- **polygon**: Polygon PoS
- **unichain**: Unichain network
- **worldchain**: World Chain network

## Security Notes

- Never commit your private key to version control
- Use a dedicated wallet for this tool with only the necessary funds
- Always test with small amounts first
- Consider using testnet networks for development

## Prerequisites

- Node.js (v16 or higher)
- A wallet with USDC and native tokens for gas fees
- An RPC provider (Infura, Alchemy, etc.)

## Error Handling

The CLI provides detailed error messages for common issues:
- Invalid wallet addresses
- Insufficient balance
- Invalid amounts
- Network connection issues
- Missing environment variables 