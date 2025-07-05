import { createPublicClient, http, isAddress, encodeFunctionData, parseUnits, getAddress, encodeAbiParameters, createWalletClient, keccak256, toHex } from 'viem';
import { privateKeyToAddress, privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
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

const flow = defineChain({
  id: 747,
  name: 'Flow',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flow Explorer',
      url: 'https://evm.flowscan.io',
    },
  },
});

// Chain configurations
const CHAIN_CONFIG = {
  ethereum: mainnet,
  zircuit: zircuit,
  flow: flow,
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
  zircuit: 'https://mainnet.zircuit.com',
  flow: 'https://mainnet.evm.nodes.onflow.org',
};

// USDC contract addresses for different networks
const USDC_ADDRESSES = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum mainnet USDC
  zircuit: '0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF', // Zircuit USDC
  flow: '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52', // Flow USDC
};

// Delegator addresses for different networks (EIP-7702 delegation targets)
const DELEGATOR_ADDRESSES = {
  ethereum: '0x4A23b165F2F07b6226097F7EA92E104C04734250',
  zircuit: '0x4A23b165F2F07b6226097F7EA92E104C04734250',
  flow: '0x4A23b165F2F07b6226097F7EA92E104C04734250', // Flow delegator
};

// Eventor addresses for different networks (commit/reveal contract)
const EVENTOR_ADDRESSES = {
  ethereum: '0x2BfC586A555bFd792b9a8b0936277b515CF45773',
  zircuit: '0x04fd13aED1B64639CCcCeeF1492741835ADCc15F',
  flow: '0xEF96A222dEb97BeE8c7c6D24A64a7eb47C2d1186', // Flow eventor
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
  chainId: number;
} {
  const chain = CHAIN_CONFIG[network as keyof typeof CHAIN_CONFIG];
  const chainId = chain ? chain.id : 1; // Default to Ethereum mainnet

  return {
    rpcUrl: getRpcUrl(network),
    usdcAddress: getUSDCAddress(network),
    delegatorAddress: getDelegatorAddress(network),
    eventorAddress: getEventorAddress(network),
    chainId,
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

  // Helper function to convert hex string to Uint8Array (browser-compatible)
  function hexToUint8Array(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  // Helper function to encode a number as minimal RLP
  function encodeRlpNumber(num: bigint): Uint8Array {
    if (num === 0n) return new Uint8Array([0x80]); // Empty string encoding for 0

    // Convert to minimal hex (remove leading zeros)
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex;

    const bytes = hexToUint8Array(hex);

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
  const addressBytes = hexToUint8Array(authorization.address.slice(2));
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

// Extension-specific interface and function
export interface SendUSDCTransactionParams {
  amount: string;
  recipient: string;
  paymentId: string;
  network: string;
  dryRun?: boolean;
}

export async function sendUSDCTransaction(params: SendUSDCTransactionParams): Promise<string> {
  const { amount, recipient, paymentId, network, dryRun = false } = params;

  // Get environment variables
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is not set');
  }

  // Get network configuration
  const networkConfig = getNetworkConfig(network);

  // Create calldata for the transaction
  const calldataArray = createCalldataArray(
    networkConfig.eventorAddress,
    recipient,
    amount,
    paymentId,
    network
  );

  // Pack the calldata array
  const packedBytes = packCalldataArray(calldataArray);

  // Create execute calldata
  const executeCalldata = createExecuteCalldata(packedBytes);

  if (dryRun) {
    console.log('Dry run - transaction would be sent with:', {
      network,
      amount,
      recipient,
      paymentId,
      calldataArray,
      executeCalldata
    });
    return 'dry-run-tx-hash';
  }

  // Check for existing delegation
  const senderAddress = deriveAddressFromPrivateKey(privateKey);
  const delegationCheck = await checkEIP7702Delegation(senderAddress, network, networkConfig.rpcUrl);

  if (delegationCheck.isDelegated && delegationCheck.delegationTarget === networkConfig.delegatorAddress) {
    // Use existing delegation
    console.log('✅ Using existing EIP-7702 delegation');
    return await sendExecuteTransaction(
      privateKey,
      executeCalldata,
      network,
      networkConfig.rpcUrl
    );
  } else {
    // Create new EIP-7702 delegation
    console.log('🔄 Creating new EIP-7702 delegation');
    return await sendEIP7702Transaction(
      privateKey,
      executeCalldata,
      networkConfig.delegatorAddress,
      network,
      networkConfig.rpcUrl
    );
  }
} 