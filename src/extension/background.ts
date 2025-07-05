// Import existing functions from the CLI codebase
import { sendUSDCTransaction } from '../usdc';
import { validateAddress, validateAmount, validatePaymentId } from '../utils';
import { getNetworkConfig } from '../usdc';

// Environment variables are injected by webpack
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('PRIVATE_KEY not found in environment variables');
}

// Types for message passing
interface TransactionRequest {
  action: string;
  data: {
    network: string;
    amount: string;
    recipient: string;
    paymentId: string;
    isDryRun: boolean;
  };
}

interface TransactionResponse {
  success: boolean;
  txHash?: string;
  error?: string;
  method?: string;
  networkName?: string;
  senderAddress?: string;
  message?: string;
  popupOpened?: boolean;
}

// Message listener for popup and dApp communication
chrome.runtime.onMessage.addListener((
  request: TransactionRequest & { source?: string, action?: string },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: TransactionResponse) => void
) => {
  if (request.action === 'sendTransaction') {
    // Log the source of the request
    const source = request.source || 'popup';
    console.log(`BeamPay: Transaction request from ${source}`);

    handleTransaction(request.data)
      .then(result => {
        console.log(`BeamPay: Transaction ${result.success ? 'successful' : 'failed'} from ${source}`);
        sendResponse(result);
      })
      .catch(error => sendResponse({
        success: false,
        error: error.message || 'Unknown error occurred'
      }));

    // Return true to indicate we'll send a response asynchronously
    return true;
  }

  if (request.action === 'openPopupWithPayment') {
    console.log('BeamPay: Opening popup with payment data:', request.data);

    // Open the popup
    chrome.action.openPopup()
      .then(() => {
        sendResponse({ success: true, message: 'Popup opened successfully' });
      })
      .catch(error => {
        console.error('BeamPay: Failed to open popup:', error);
        sendResponse({ success: false, error: 'Failed to open popup' });
      });

    return true;
  }
});

async function handleTransaction(data: TransactionRequest['data']): Promise<TransactionResponse> {
  try {
    const { network, amount, recipient, paymentId, isDryRun } = data;

    // Validate inputs using existing validators
    if (!validateAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    if (!validateAmount(amount)) {
      throw new Error('Invalid amount');
    }

    if (!validatePaymentId(paymentId)) {
      throw new Error('Invalid payment ID');
    }

    // Get network configuration
    const networkConfig = getNetworkConfig(network);

    // Check if private key is available
    if (!PRIVATE_KEY) {
      throw new Error('Private key not configured. Please set PRIVATE_KEY in your .env file');
    }

    // Validate private key format
    if (typeof PRIVATE_KEY !== 'string') {
      throw new Error('Private key must be a string');
    }

    // Format private key
    const formattedKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;

    // Validate private key length (64 hex chars + 0x prefix = 66 chars)
    if (formattedKey.length !== 66) {
      throw new Error(`Invalid private key length: expected 66 characters (including 0x prefix), got ${formattedKey.length}`);
    }

    // Get sender address for display
    const { privateKeyToAddress } = await import('viem/accounts');
    const senderAddress = privateKeyToAddress(formattedKey as `0x${string}`);

    // Determine transaction method
    const eip7702Support = networkConfig.chainId === 1 || networkConfig.chainId === 48900;
    const method = eip7702Support ? 'EIP-7702 delegation' : 'Direct transaction';

    if (isDryRun) {
      // For dry run, just validate inputs and return success
      return {
        success: true,
        method,
        networkName: getNetworkName(network),
        senderAddress
      };
    }

    // Send actual transaction using existing CLI logic
    console.log(`Sending ${amount} USDC to ${recipient} on ${network}`);
    console.log(`Payment ID: ${paymentId}`);
    console.log(`Method: ${method}`);

    const txHash = await sendUSDCTransaction({
      amount,
      recipient,
      paymentId,
      network,
      dryRun: false
    });

    return {
      success: true,
      txHash,
      method,
      networkName: getNetworkName(network)
    };

  } catch (error) {
    console.error('Transaction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      error: errorMessage
    };
  }
}

function getNetworkName(network: string): string {
  const networkNames: { [key: string]: string } = {
    ethereum: 'Ethereum',
    zircuit: 'Zircuit',
    flow: 'Flow'
  };

  return networkNames[network] || network;
}

// Initialize service worker
console.log('BeamPay background service worker initialized');
console.log('Private key configured:', !!PRIVATE_KEY);

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('BeamPay extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // Set default values on first install
    chrome.storage.local.set({
      formValues: {
        network: 'ethereum',
        amount: '1',
        recipient: '0xD270c4804bcA681a5C915b18Ce86D0CD0e800CC7',
        paymentId: ''
      }
    });
  }
}); 