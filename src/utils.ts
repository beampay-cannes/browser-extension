/**
 * Validates if the given string is a valid Ethereum address (basic format check)
 */
export function validateAddress(address: string): string {
  // Basic validation - check if it's a valid hex string of correct length
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error(`Invalid wallet address: ${address}`);
  }
  return address;
}

/**
 * Validates if the given string is a valid amount (positive number)
 */
export function validateAmount(amount: string): string {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    throw new Error(`Invalid amount: ${amount} is not a valid number`);
  }

  if (numAmount <= 0) {
    throw new Error(`Invalid amount: ${amount} must be greater than 0`);
  }

  // Check if it has too many decimal places (USDC has 6 decimals)
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 6) {
    throw new Error(`Invalid amount: ${amount} has too many decimal places (max 6 for USDC)`);
  }

  return amount;
}

/**
 * Formats a private key to ensure it has the correct format
 */
export function formatPrivateKey(privateKey: string): string {
  // Remove any whitespace
  const cleanKey = privateKey.trim();

  // Add 0x prefix if not present
  if (!cleanKey.startsWith('0x')) {
    return '0x' + cleanKey;
  }

  return cleanKey;
}

/**
 * Validates if the private key is in the correct format
 */
export function validatePrivateKey(privateKey: string): string {
  const formattedKey = formatPrivateKey(privateKey);

  // Check if it's 64 characters (32 bytes) + 0x prefix
  if (formattedKey.length !== 66) {
    throw new Error('Invalid private key: must be 64 characters (32 bytes) long');
  }

  // Check if it's valid hex
  if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
    throw new Error('Invalid private key: must be a valid hexadecimal string');
  }

  return formattedKey;
}

/**
 * Validates if the payment ID is a valid string
 */
export function validatePaymentId(paymentId: string): string {
  const trimmed = paymentId.trim();

  if (trimmed.length === 0) {
    throw new Error('Invalid payment ID: cannot be empty');
  }

  // Basic validation - just ensure it's a non-empty string
  return trimmed;
} 