// Import network configurations from existing code
import { getNetworkConfig } from '../usdc';

// DOM elements
const form = document.getElementById('transactionForm') as HTMLFormElement;
const networkSelect = document.getElementById('network') as HTMLSelectElement;
const networkInfo = document.getElementById('networkInfo') as HTMLDivElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const recipientInput = document.getElementById('recipient') as HTMLInputElement;
const paymentIdInput = document.getElementById('paymentId') as HTMLInputElement;
const dryRunBtn = document.getElementById('dryRunBtn') as HTMLButtonElement;
const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

// Initialize the popup
document.addEventListener('DOMContentLoaded', function () {
  // Load saved values
  loadSavedValues();

  // Event listeners
  networkSelect.addEventListener('change', onNetworkChange);
  dryRunBtn.addEventListener('click', () => handleTransaction(true));
  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    handleTransaction(false);
  });

  // Auto-save form values
  [networkSelect, amountInput, recipientInput, paymentIdInput].forEach(input => {
    input.addEventListener('input', saveValues);
  });
});

function onNetworkChange() {
  const network = networkSelect.value;
  if (network) {
    try {
      const config = getNetworkConfig(network);
      const eip7702Support = config.chainId === 1 || config.chainId === 480 || config.chainId === 48900;

      networkInfo.innerHTML = `
        <div><strong>Chain ID:</strong> ${config.chainId}</div>
        <div><strong>USDC:</strong> ${config.usdcAddress.substring(0, 10)}...${config.usdcAddress.substring(config.usdcAddress.length - 6)}</div>
        <div><strong>EIP-7702:</strong> ${eip7702Support ?
          '<span class="eip7702-badge eip7702-supported">✅ Supported</span>' :
          '<span class="eip7702-badge eip7702-not-supported">❌ Not supported</span>'}</div>
        <div><strong>Delegator:</strong> ${config.delegatorAddress.substring(0, 10)}...${config.delegatorAddress.substring(config.delegatorAddress.length - 6)}</div>
      `;
      networkInfo.classList.remove('hidden');
    } catch (error) {
      console.error('Network configuration error:', error);
      networkInfo.classList.add('hidden');
    }
  } else {
    networkInfo.classList.add('hidden');
  }
  saveValues();
}

function validateAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

function validateAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
}

function validatePaymentId(paymentId: string): boolean {
  return paymentId.trim().length > 0 && paymentId.trim().length <= 100;
}

function validateForm(): { network: string; amount: string; recipient: string; paymentId: string } {
  const network = networkSelect.value;
  const amount = amountInput.value;
  const recipient = recipientInput.value;
  const paymentId = paymentIdInput.value;

  if (!network) {
    throw new Error('Please select a network');
  }

  if (!validateAmount(amount)) {
    throw new Error('Please enter a valid amount (0.000001 - 1,000,000 USDC)');
  }

  if (!validateAddress(recipient)) {
    throw new Error('Please enter a valid recipient address');
  }

  if (!validatePaymentId(paymentId)) {
    throw new Error('Please enter a valid payment ID (1-100 characters)');
  }

  return { network, amount, recipient, paymentId };
}

function showStatus(message: string, type: string) {
  statusDiv.className = `status ${type}`;
  statusDiv.innerHTML = message;
  statusDiv.classList.remove('hidden');
}

function hideStatus() {
  statusDiv.classList.add('hidden');
}

function setButtonsEnabled(enabled: boolean) {
  dryRunBtn.disabled = !enabled;
  sendBtn.disabled = !enabled;
}

async function handleTransaction(isDryRun: boolean) {
  try {
    // Validate form
    const { network, amount, recipient, paymentId } = validateForm();

    // Show loading status
    showStatus(`${isDryRun ? 'Preparing dry run' : 'Sending payment'}...`, 'loading');
    setButtonsEnabled(false);

    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: 'sendTransaction',
      data: {
        network,
        amount,
        recipient,
        paymentId,
        isDryRun
      }
    });

    if (response.success) {
      let message = '';
      if (isDryRun) {
        message = `
          ✅ Dry run successful!<br>
          <strong>Network:</strong> ${response.networkName}<br>
          <strong>Amount:</strong> ${amount} USDC<br>
          <strong>Recipient:</strong> ${recipient}<br>
          <strong>Payment ID:</strong> ${paymentId}<br>
          <strong>Method:</strong> ${response.method}<br>
          <strong>Address:</strong> ${response.senderAddress}
        `;
      } else {
        message = `
          ✅ Payment sent successfully!<br>
          <strong>Transaction Hash:</strong>
          <div class="tx-hash">${response.txHash}</div>
          <strong>Network:</strong> ${response.networkName}<br>
          <strong>Method:</strong> ${response.method}
        `;
      }
      showStatus(message, 'success');
    } else {
      showStatus(`❌ Error: ${response.error}`, 'error');
    }
  } catch (error) {
    showStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  } finally {
    setButtonsEnabled(true);
  }
}

function saveValues() {
  const values = {
    network: networkSelect.value,
    amount: amountInput.value,
    recipient: recipientInput.value,
    paymentId: paymentIdInput.value
  };
  chrome.storage.local.set({ formValues: values });
}

function loadSavedValues() {
  chrome.storage.local.get(['formValues'], (result) => {
    if (result.formValues) {
      const values = result.formValues;
      if (values.network) {
        networkSelect.value = values.network;
        onNetworkChange();
      }
      if (values.amount) amountInput.value = values.amount;
      if (values.recipient) recipientInput.value = values.recipient;
      if (values.paymentId) paymentIdInput.value = values.paymentId;
    }
  });
} 