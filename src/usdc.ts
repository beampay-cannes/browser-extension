import { ethers } from 'ethers';

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

// USDC ABI (simplified - only the functions we need)
const USDC_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
];

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

  // Get USDC contract address for the network
  const usdcAddress = USDC_ADDRESSES[network as keyof typeof USDC_ADDRESSES];
  if (!usdcAddress) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(USDC_ADDRESSES).join(', ')}`);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Sending from: ${delegatorAddress}`);
  console.log(`Network: ${network}`);
  console.log(`USDC Contract: ${usdcAddress}`);

  // Create USDC contract instance
  const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, wallet);

  // Get USDC decimals (usually 6 for USDC)
  const decimals = await usdcContract.decimals();

  // Convert amount to wei (accounting for USDC decimals)
  const amountInWei = ethers.parseUnits(amount, decimals);

  // Check sender balance
  const senderBalance = await usdcContract.balanceOf(delegatorAddress);
  if (senderBalance < amountInWei) {
    throw new Error(`Insufficient USDC balance. Available: ${ethers.formatUnits(senderBalance, decimals)} USDC`);
  }

  console.log(`Sending ${amount} USDC to ${recipient}...`);

  // Estimate gas
  const gasEstimate = await usdcContract.transfer.estimateGas(recipient, amountInWei);

  // Send transaction
  const tx = await usdcContract.transfer(recipient, amountInWei, {
    gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
  });

  console.log('Transaction submitted, waiting for confirmation...');

  // Wait for transaction to be mined
  const receipt = await tx.wait();

  if (receipt.status === 0) {
    throw new Error('Transaction failed');
  }

  return tx.hash;
}

export async function getUSDCBalance(address: string, network: string, rpcUrl: string): Promise<string> {
  const usdcAddress = USDC_ADDRESSES[network as keyof typeof USDC_ADDRESSES];
  if (!usdcAddress) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, provider);

  const balance = await usdcContract.balanceOf(address);
  const decimals = await usdcContract.decimals();

  return ethers.formatUnits(balance, decimals);
} 