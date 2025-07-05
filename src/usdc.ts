import { createPublicClient, http, isAddress } from 'viem';
import { privateKeyToAddress } from 'viem/accounts';
import { mainnet, arbitrum, avalanche, base, celo, linea, optimism, polygon } from 'viem/chains';

// Chain configurations
const CHAIN_CONFIG = {
  ethereum: mainnet,
  mainnet: mainnet,
  arbitrum: arbitrum,
  avalanche: avalanche,
  base: base,
  celo: celo,
  linea: linea,
  optimism: optimism,
  polygon: polygon,
  // Note: unichain, worldchain, codex might not be available in viem/chains
  // We'll use mainnet as fallback for now
  unichain: mainnet,
  worldchain: mainnet,
  codex: mainnet,
};

// USDC contract addresses for different networks
const USDC_ADDRESSES = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum mainnet USDC
  mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum mainnet USDC (alias)
  arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
  avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche C-Chain USDC
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  codex: '0xd996633a415985DBd7D6D12f4A4343E31f5037cf', // Codex USDC
  celo: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', // Celo USDC
  linea: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // Linea USDC
  optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // OP Mainnet USDC
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Polygon PoS USDC
  unichain: '0x078D782b760474a361dDA0AF3839290b0EF57AD6', // Unichain USDC
  worldchain: '0x79A02482A880bCe3F13E09da970dC34dB4cD24D1', // World Chain USDC
};

export interface SendUSDCParams {
  amount: string;
  recipient: string;
  network: string;
  rpcUrl: string;
  privateKey: string;
  delegatorAddress: string;
}

export async function sendUSDC(params: SendUSDCParams): Promise<string> {
  const { amount, recipient, network, rpcUrl, privateKey, delegatorAddress } = params;

  // Validate network
  const usdcAddress = USDC_ADDRESSES[network as keyof typeof USDC_ADDRESSES];
  if (!usdcAddress) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(USDC_ADDRESSES).join(', ')}`);
  }

  console.log(`Sending from: ${delegatorAddress}`);
  console.log(`Network: ${network}`);
  console.log(`USDC Contract: ${usdcAddress}`);
  console.log(`Amount: ${amount} USDC`);
  console.log(`Recipient: ${recipient}`);
  console.log(`RPC URL: ${rpcUrl}`);

  // Simulate transaction processing
  console.log('Simulating USDC transfer...');

  // Return a mock transaction hash
  const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66).padStart(64, '0');

  return mockTxHash;
}

export function getUSDCAddress(network: string): string {
  const usdcAddress = USDC_ADDRESSES[network as keyof typeof USDC_ADDRESSES];
  if (!usdcAddress) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return usdcAddress;
}

/**
 * Derive address from private key
 */
export function deriveAddressFromPrivateKey(privateKey: string): string {
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  return privateKeyToAddress(formattedKey as `0x${string}`);
}

/**
 * Check if there's contract code at the address and get EIP-7702 delegation target
 */
export async function checkEIP7702Delegation(address: string, network: string, rpcUrl: string): Promise<{
  isDelegated: boolean;
  delegationTarget?: string;
  code?: string;
}> {
  try {
    const chain = CHAIN_CONFIG[network as keyof typeof CHAIN_CONFIG];
    if (!chain) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const client = createPublicClient({
      chain: chain,
      transport: http(rpcUrl),
    });

    const code = await client.getCode({
      address: address as `0x${string}`,
    });

    // If there's no code, it's a regular EOA
    if (!code || code === '0x') {
      return { isDelegated: false };
    }



    // Check if it's EIP-7702 delegation
    // EIP-7702 code format: 0xef01 + 20-byte target address (total 22 bytes)
    if (code.startsWith('0xef01')) {
      // Extract the 20-byte address after 0xef01
      // Skip the first 2 bytes (00) and take the next 20 bytes for the address
      const addressHex = code.slice(8); // Skip '0xef0100' (6 chars)
      const delegationTarget = '0x' + addressHex.slice(0, 40); // Take exactly 40 hex chars (20 bytes)
      return {
        isDelegated: true,
        delegationTarget,
        code
      };
    }

    // Has code but not EIP-7702 format (regular contract)
    return {
      isDelegated: false,
      code
    };
  } catch (error) {
    console.error('Error checking EIP-7702 delegation:', error);
    return { isDelegated: false };
  }
} 