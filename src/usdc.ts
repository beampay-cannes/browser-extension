import { createPublicClient, http, isAddress, encodeFunctionData, parseUnits, getAddress, encodeAbiParameters, createWalletClient, keccak256, toHex } from 'viem';
import { privateKeyToAddress, privateKeyToAccount } from 'viem/accounts';
import { mainnet, arbitrum, avalanche, base, celo, linea, optimism, polygon } from 'viem/chains';
import { defineChain } from 'viem';

// Define custom chains not available in viem/chains
const zircuit = defineChain({
  id: 48900,
  name: 'Zircuit Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.zircuit.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zircuit Explorer',
      url: 'https://explorer.zircuit.com',
    },
  },
});

const worldchain = defineChain({
  id: 480,
  name: 'World Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-mainnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'World Chain Explorer',
      url: 'https://worldchain-mainnet.explorer.alchemy.com',
    },
  },
});

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
  // Note: unichain, codex might not be available in viem/chains
  // We'll use mainnet as fallback for now
  unichain: mainnet,
  worldchain: worldchain,
  codex: mainnet,
  zircuit: zircuit,
};

// ABI for the commit function
const COMMIT_ABI = [{
  name: 'commit',
  type: 'function',
  inputs: [
    { name: '_to', type: 'address' },
    { name: '_declaredAmount', type: 'uint256' },
    { name: '_paymentId', type: 'string' }
  ]
}] as const;

// ABI for the reveal function
const REVEAL_ABI = [{
  name: 'reveal',
  type: 'function',
  inputs: [
    { name: '_to', type: 'address' },
    { name: '_declaredAmount', type: 'uint256' },
    { name: '_paymentId', type: 'string' }
  ]
}] as const;

// ABI for the execute function
const EXECUTE_ABI = [{
  name: 'execute',
  type: 'function',
  inputs: [
    { name: '', type: 'bytes32' },
    { name: '', type: 'bytes' }
  ]
}] as const;

// ERC20 ABI for transfer function
const ERC20_TRANSFER_ABI = [{
  name: 'transfer',
  type: 'function',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ]
}] as const;

// RPC URLs for different networks
const RPC_URLS = {
  ethereum: 'https://eth.llamarpc.com',
  mainnet: 'https://eth.llamarpc.com', // Ethereum mainnet alias
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  base: 'https://mainnet.base.org',
  codex: 'https://rpc.codex.technology',
  celo: 'https://forno.celo.org',
  linea: 'https://rpc.linea.build',
  optimism: 'https://mainnet.optimism.io',
  polygon: 'https://polygon-rpc.com',
  unichain: 'https://rpc.unichain.org',
  worldchain: 'https://worldchain-mainnet.g.alchemy.com/public',
  zircuit: 'https://mainnet.zircuit.com',
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
  worldchain: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1', // World Chain USDC
  zircuit: '0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF', // Zircuit USDC
};

// Delegator addresses for different networks (EIP-7702 delegation targets)
const DELEGATOR_ADDRESSES = {
  ethereum: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  mainnet: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496', // Ethereum mainnet alias
  arbitrum: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  avalanche: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  base: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  codex: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  celo: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  linea: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  optimism: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  polygon: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  unichain: '0xEAF663a2AEd3c9D73f5c484471C5F658A2Fb1496',
  worldchain: '0x3CAFF4B47aBA17E9576aD928Fa8f978ad9777269',
  zircuit: '0x3CAFF4B47aBA17E9576aD928Fa8f978ad9777269',
};

// Eventor addresses for different networks (commit/reveal contract)
const EVENTOR_ADDRESSES = {
  ethereum: '0x2BfC586A555bFd792b9a8b0936277b515CF45773',
  mainnet: '0x2BfC586A555bFd792b9a8b0936277b515CF45773', // Ethereum mainnet alias
  arbitrum: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  avalanche: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  base: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  codex: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  celo: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  linea: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  optimism: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  polygon: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  unichain: '0x171EAbC5712370d08338651AE3419AB7d179Dd42',
  worldchain: '0x04fd13aED1B64639CCcCeeF1492741835ADCc15F',
  zircuit: '0x04fd13aED1B64639CCcCeeF1492741835ADCc15F',
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

export function getRpcUrl(network: string): string {
  const rpcUrl = RPC_URLS[network as keyof typeof RPC_URLS];
  if (!rpcUrl) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(RPC_URLS).join(', ')}`);
  }
  return rpcUrl;
}

export function getDelegatorAddress(network: string): string {
  const delegatorAddress = DELEGATOR_ADDRESSES[network as keyof typeof DELEGATOR_ADDRESSES];
  if (!delegatorAddress) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(DELEGATOR_ADDRESSES).join(', ')}`);
  }
  return delegatorAddress;
}

export function getEventorAddress(network: string): string {
  const eventorAddress = EVENTOR_ADDRESSES[network as keyof typeof EVENTOR_ADDRESSES];
  if (!eventorAddress) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(EVENTOR_ADDRESSES).join(', ')}`);
  }
  return eventorAddress;
}

export function getNetworkConfig(network: string): {
  rpcUrl: string;
  usdcAddress: string;
  delegatorAddress: string;
  eventorAddress: string;
} {
  return {
    rpcUrl: getRpcUrl(network),
    usdcAddress: getUSDCAddress(network),
    delegatorAddress: getDelegatorAddress(network),
    eventorAddress: getEventorAddress(network),
  };
}

/**
 * Create calldata for the commit function using viem serialization
 */
export function createEventorCalldata(to: string, usdcValue: string, paymentId: string): string {
  // Convert USDC amount to uint256 (6 decimals)
  const amountInWei = parseUnits(usdcValue, 6);

  // Ensure proper address formatting with checksum
  const checksummedTo = getAddress(to);

  // Use viem to encode the function call
  const calldata = encodeFunctionData({
    abi: COMMIT_ABI,
    functionName: 'commit',
    args: [checksummedTo, amountInWei, paymentId]
  });

  return calldata;
}

/**
 * Create calldata for ERC20 transfer function
 */
export function createUSDCTransferCalldata(to: string, usdcValue: string): string {
  // Convert USDC amount to uint256 (6 decimals)
  const amountInWei = parseUnits(usdcValue, 6);

  // Ensure proper address formatting with checksum
  const checksummedTo = getAddress(to);

  // Use viem to encode the transfer function call
  const calldata = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [checksummedTo, amountInWei]
  });

  return calldata;
}

/**
 * Create calldata for the reveal function using viem serialization
 */
export function createEventorRevealCalldata(to: string, usdcValue: string, paymentId: string): string {
  // Convert USDC amount to uint256 (6 decimals)
  const amountInWei = parseUnits(usdcValue, 6);

  // Ensure proper address formatting with checksum
  const checksummedTo = getAddress(to);

  // Use viem to encode the function call
  const calldata = encodeFunctionData({
    abi: REVEAL_ABI,
    functionName: 'reveal',
    args: [checksummedTo, amountInWei, paymentId]
  });

  return calldata;
}

/**
 * Create the array of (address, uint256, bytes) tuples
 * Creates all three items: eventor commit, USDC transfer, and eventor reveal
 */
export function createCalldataArray(eventorAddress: string, to: string, usdcValue: string, paymentId: string, network: string): Array<[string, string, string]> {
  const firstCalldata = createEventorCalldata(to, usdcValue, paymentId);
  const secondCalldata = createUSDCTransferCalldata(to, usdcValue);
  const thirdCalldata = createEventorRevealCalldata(to, usdcValue, paymentId);

  // Get USDC contract address for the network
  const usdcAddress = USDC_ADDRESSES[network as keyof typeof USDC_ADDRESSES];
  if (!usdcAddress) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(USDC_ADDRESSES).join(', ')}`);
  }

  // Return array with:
  // [0]: (eventor, 0, commit calldata)
  // [1]: (usdc, 0, transfer calldata)
  // [2]: (eventor, 0, reveal calldata)
  return [
    [eventorAddress, '0', firstCalldata],
    [usdcAddress, '0', secondCalldata],
    [eventorAddress, '0', thirdCalldata]
  ];
}

/**
 * Pack the calldata array into bytes
 */
export function packCalldataArray(calldataArray: Array<[string, string, string]>): string {
  // Transform the array to proper types for encoding
  const tuples = calldataArray.map(([address, value, data]) => ({
    target: getAddress(address), // Ensure proper checksum formatting
    value: BigInt(value),
    data: data as `0x${string}`
  }));

  // Encode as (address,uint256,bytes)[]
  const packedBytes = encodeAbiParameters(
    [{
      name: 'calls', type: 'tuple[]', components: [
        { name: 'target', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' }
      ]
    }],
    [tuples]
  );

  return packedBytes;
}

/**
 * Create calldata for execute(bytes32,bytes) function
 */
export function createExecuteCalldata(packedBytes: string): string {
  // Fixed bytes32 value
  const fixedBytes32 = '0x0100000000000000000000000000000000000000000000000000000000000000';

  // Create the execute calldata
  const executeCalldata = encodeFunctionData({
    abi: EXECUTE_ABI,
    functionName: 'execute',
    args: [fixedBytes32 as `0x${string}`, packedBytes as `0x${string}`]
  });

  return executeCalldata;
}

/**
 * Send transaction with execute calldata (self-transaction with zero value)
 */
export async function sendExecuteTransaction(
  privateKey: string,
  executeCalldata: string,
  network: string,
  rpcUrl: string
): Promise<string> {
  try {
    const chain = CHAIN_CONFIG[network as keyof typeof CHAIN_CONFIG];
    if (!chain) {
      throw new Error(`Unsupported network: ${network}`);
    }

    // Create account from private key (ensure proper formatting)
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });

    // Send transaction (self-transaction with zero value)
    const txHash = await walletClient.sendTransaction({
      to: account.address,
      value: BigInt(0),
      data: executeCalldata as `0x${string}`,
    });

    return txHash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}

/**
 * Create EIP-7702 authorization for delegation
 * 
 * @param nonce - For same-account transactions (sender == authorizer), use currentNonce + 1
 *                For different-account transactions (sponsored), use currentNonce
 */
export async function createEIP7702Authorization(
  privateKey: string,
  delegatorAddress: string,
  chainId: number,
  nonce: number = 0
): Promise<any> {
  // Create account from private key for signing
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(formattedKey as `0x${string}`);

  // EIP-7702 authorization structure
  const authorization = {
    chainId: BigInt(chainId),
    address: delegatorAddress as `0x${string}`,
    nonce: BigInt(nonce)
  };

  // Create the authorization hash for signing according to EIP-7702
  // The commitment format: keccak256(0x05 || rlp([chain_id, address, nonce]))
  const MAGIC_BYTE = 0x05;

  // Helper function to encode a number as minimal RLP
  function encodeRlpNumber(num: bigint): Uint8Array {
    if (num === 0n) return new Uint8Array([0x80]); // Empty string encoding for 0

    // Convert to minimal hex (remove leading zeros)
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex;

    const bytes = new Uint8Array(Buffer.from(hex, 'hex'));

    if (bytes.length === 1 && bytes[0] < 0x80) {
      return bytes; // Single byte < 0x80 encodes as itself
    } else if (bytes.length <= 55) {
      const result = new Uint8Array(1 + bytes.length);
      result[0] = 0x80 + bytes.length;
      result.set(bytes, 1);
      return result;
    } else {
      throw new Error('Number too large for simple RLP encoding');
    }
  }

  // RLP encode the authorization tuple [chain_id, address, nonce]
  const chainIdRlp = encodeRlpNumber(authorization.chainId);
  const addressBytes = new Uint8Array(Buffer.from(authorization.address.slice(2), 'hex'));
  const addressRlp = new Uint8Array(1 + addressBytes.length);
  addressRlp[0] = 0x80 + addressBytes.length; // 0x94 for 20-byte address
  addressRlp.set(addressBytes, 1);
  const nonceRlp = encodeRlpNumber(authorization.nonce);

  // Calculate total length and encode the list
  const totalContentLength = chainIdRlp.length + addressRlp.length + nonceRlp.length;
  const listHeader = totalContentLength <= 55 ?
    new Uint8Array([0xc0 + totalContentLength]) :
    (() => { throw new Error('List too long for simple RLP encoding'); })();

  // Combine into full RLP-encoded list
  const rlpEncoded = new Uint8Array(listHeader.length + totalContentLength);
  let offset = 0;
  rlpEncoded.set(listHeader, offset);
  offset += listHeader.length;
  rlpEncoded.set(chainIdRlp, offset);
  offset += chainIdRlp.length;
  rlpEncoded.set(addressRlp, offset);
  offset += addressRlp.length;
  rlpEncoded.set(nonceRlp, offset);

  // Create the full message: 0x05 || rlp([chain_id, address, nonce])
  const messageData = new Uint8Array(1 + rlpEncoded.length);
  messageData[0] = MAGIC_BYTE;
  messageData.set(rlpEncoded, 1);

  const authorizationHash = keccak256(toHex(messageData));

  // Sign the authorization hash directly (no message prefix for EIP-7702)
  const signature = await account.sign({
    hash: authorizationHash
  });

  // Parse signature into r, s, v components for EIP-7702
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  // Calculate yParity correctly for EIP-7702
  let yParity;
  if (v === 27) {
    yParity = 0;
  } else if (v === 28) {
    yParity = 1;
  } else {
    // For EIP-155 transactions
    yParity = v % 2;
  }

  return {
    chainId: authorization.chainId,
    address: authorization.address,
    nonce: authorization.nonce,
    yParity,
    r,
    s
  };
}

/**
 * Send EIP-7702 transaction with delegation and execute calldata
 */
export async function sendEIP7702Transaction(
  privateKey: string,
  executeCalldata: string,
  delegatorAddress: string,
  network: string,
  rpcUrl: string
): Promise<string> {
  try {
    const chain = CHAIN_CONFIG[network as keyof typeof CHAIN_CONFIG];
    if (!chain) {
      throw new Error(`Unsupported network: ${network}`);
    }

    // Create account from private key
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);

    // Create public client for reading data
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Get current nonce for authorization
    const accountNonce = await publicClient.getTransactionCount({
      address: account.address,
    });

    // Create authorization for delegation with current nonce + 1 (for same-account transactions)
    const authorization = await createEIP7702Authorization(
      privateKey,
      delegatorAddress,
      chain.id,
      Number(accountNonce) + 1
    );

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });

    // Send EIP-7702 transaction 
    const txHash = await walletClient.sendTransaction({
      to: account.address,
      value: BigInt(0),
      data: executeCalldata as `0x${string}`,
      gas: BigInt(500000),
      type: 'eip7702',
      authorizationList: [authorization],
    });

    return txHash;
  } catch (error) {
    console.error('Error sending EIP-7702 transaction:', error);
    throw error;
  }
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