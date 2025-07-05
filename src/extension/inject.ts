// Injected script that creates the BeamPay API
(() => {
  console.log('BeamPay: Inject script starting...');

  // BeamPay API for dApps
  (window as any).beampay = {
    // Send a USDC payment
    async sendPayment({ chain, amount, to, paymentId }: {
      chain: string;
      amount: string;
      to: string;
      paymentId: string;
    }) {
      try {
        // Validate required parameters
        if (!chain || !amount || !to || !paymentId) {
          throw new Error('Missing required parameters: chain, amount, to, paymentId');
        }

        // Validate chain
        const supportedChains = ['ethereum', 'zircuit', 'flow'];
        if (!supportedChains.includes(chain)) {
          throw new Error(`Unsupported chain: ${chain}. Supported: ${supportedChains.join(', ')}`);
        }

        // Validate amount
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          throw new Error('Invalid amount: must be a positive number');
        }

        // Validate address
        if (!/^0x[0-9a-fA-F]{40}$/.test(to)) {
          throw new Error('Invalid recipient address');
        }

        // Send message to content script using postMessage
        const response = await new Promise((resolve, reject) => {
          // Set timeout to prevent hanging
          const timeout = setTimeout(() => {
            reject(new Error('Payment request timed out'));
          }, 30000); // 30 seconds timeout

          const requestId = 'beampay-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

          const messageHandler = (event: MessageEvent) => {
            if (event.data.type === 'beampay-response' && event.data.requestId === requestId) {
              window.removeEventListener('message', messageHandler);
              clearTimeout(timeout);

              if (event.data.success) {
                resolve(event.data.result);
              } else {
                reject(new Error(event.data.error));
              }
            }
          };

          window.addEventListener('message', messageHandler);

          // Send payment request
          window.postMessage({
            type: 'beampay-send',
            requestId,
            data: { chain, amount: amount.toString(), to, paymentId }
          }, '*');
        });

        return response;
      } catch (error: any) {
        throw new Error(`BeamPay Error: ${error.message}`);
      }
    },

    // Check if BeamPay is available
    isAvailable() {
      return true;
    },

    // Get supported networks
    getSupportedNetworks() {
      return ['ethereum', 'zircuit', 'flow'];
    }
  };

  // Dispatch ready event
  window.dispatchEvent(new CustomEvent('beampay-ready'));
  console.log('🌟 BeamPay API injected and ready!');
  console.log('BeamPay object:', (window as any).beampay);
})(); 