// Content script that injects BeamPay API into web pages
(() => {
  console.log('BeamPay: Content script starting...');

  // Inject the BeamPay API script into the page
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = () => {
    console.log('BeamPay: Inject script loaded successfully');
    script.remove();
  };
  script.onerror = () => {
    console.error('BeamPay: Failed to load inject script');
    script.remove();
  };

  // Inject the script into the page
  (document.head || document.documentElement).appendChild(script);

  console.log('BeamPay: Script injection initiated');

  // Listen for payment requests from the injected script
  window.addEventListener('message', async (event: MessageEvent) => {
    if (event.source !== window || event.data.type !== 'beampay-send') {
      return;
    }

    console.log('BeamPay: Received payment request:', event.data);

    const { requestId, data } = event.data;
    const { chain, amount, to, paymentId } = data;

    try {
      // Store payment data and open popup for user confirmation
      await chrome.storage.local.set({
        pendingPayment: {
          network: chain,
          amount,
          recipient: to,
          paymentId,
          timestamp: Date.now(),
          source: 'dapp'
        }
      });

      // Send message to background script to open popup
      const response = await chrome.runtime.sendMessage({
        action: 'openPopupWithPayment',
        data: {
          network: chain,
          amount,
          recipient: to,
          paymentId
        },
        source: 'dapp'
      });

      if (response.success) {
        // Send success response back to injected script
        window.postMessage({
          type: 'beampay-response',
          requestId,
          success: true,
          result: {
            success: true,
            message: 'Payment popup opened. Please confirm the transaction.',
            popupOpened: true
          }
        }, '*');
      } else {
        // Send error response back to injected script
        window.postMessage({
          type: 'beampay-response',
          requestId,
          success: false,
          error: response.error || 'Failed to open payment popup'
        }, '*');
      }
    } catch (error) {
      console.error('BeamPay: Error handling payment request:', error);

      // Send error response back to injected script
      window.postMessage({
        type: 'beampay-response',
        requestId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, '*');
    }
  });

  console.log('BeamPay content script loaded');
})(); 