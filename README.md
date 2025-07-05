# Delegator CLI

A TypeScript CLI tool for simulating USDC token transfers across different blockchain networks.

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
```

**Important:** 
- Replace `YOUR_PROJECT_ID` with your actual RPC provider project ID
- Replace the example private key with your actual private key
- The `.env` file is already added to `.gitignore` to prevent accidental commits

## Usage

### Basic Usage

Simulate USDC transfer to a recipient:
```bash
npm run start <amount> <recipient_address>
```

### Examples

```bash
# Simulate 100 USDC transfer to an address on Ethereum
npm run start 100 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c

# Simulate 50.5 USDC transfer to an address on Polygon
npm run start 50.5 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c --network polygon

# Simulate 25 USDC transfer to an address on Base
npm run start 25 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c --network base

# Simulate 10 USDC transfer to an address on Arbitrum
npm run start 10 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c --network arbitrum

# Perform a dry run (validation only, no simulation)
npm run start 25 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c --dry-run
```

### Development

Run in development mode:
```bash
npm run dev <amount> <recipient_address>
```

### Options

- `--network, -n`: Specify the network (ethereum, arbitrum, avalanche, base, celo, linea, optimism, polygon, unichain, worldchain) - defaults to ethereum
- `--dry-run, -d`: Perform a dry run without sending the transaction

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