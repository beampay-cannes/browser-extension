# BeamPay dApp Integration

BeamPay automatically injects a global `window.beampay` object into all web pages.

## Usage

```javascript
// Wait for BeamPay to be ready
window.addEventListener('beampay-ready', async () => {
  console.log('BeamPay is ready!');
  
  try {
    const result = await window.beampay.sendPayment({
      chain: 'ethereum',
      amount: '10.5',
      to: '0x742d35Cc6aE7c0773E9fE0b4d4B1BA4cc4B52b02',
      paymentId: 'order_123'
    });
    
    console.log('Payment successful!', result);
  } catch (error) {
    console.error('Payment failed:', error.message);
  }
});
```

## API Reference

- `window.beampay.sendPayment({ chain, amount, to, paymentId })`
- `window.beampay.isAvailable()`
- `window.beampay.getSupportedNetworks()`

## Supported Networks

- ethereum
- zircuit
- flow 