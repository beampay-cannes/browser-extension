# Delegator CLI

A TypeScript CLI tool for sending USDC tokens across different blockchain networks.

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

Create a `.env` file in the root directory with the following variables:

```bash
# RPC URL for the blockchain network
# Examples:
# Ethereum mainnet: https://mainnet.infura.io/v3/YOUR_PROJECT_ID
# Polygon: https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
# Arbitrum: https://arbitrum-mainnet.infura.io/v3/YOUR_PROJECT_ID
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Private key of the wallet to send USDC from
# Make sure this wallet has USDC and ETH/MATIC/etc for gas fees
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Usage

### Basic Usage

Send USDC to a recipient:
```bash
npm run start <amount> <recipient_address>
```

### Examples

```bash
# Send 100 USDC to an address
npm run start 100 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c

# Send 50.5 USDC to an address on Polygon
npm run start 50.5 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c --network polygon

# Perform a dry run (no actual transaction)
npm run start 25 0x742d35Cc6634C0532925a3b8D489319dc1c5eA3c --dry-run
```

### Development

Run in development mode:
```bash
npm run dev <amount> <recipient_address>
```

### Options

- `--network, -n`: Specify the network (mainnet, polygon, arbitrum) - defaults to mainnet
- `--dry-run, -d`: Perform a dry run without sending the transaction

### Supported Networks

- **mainnet**: Ethereum mainnet
- **polygon**: Polygon network
- **arbitrum**: Arbitrum network

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