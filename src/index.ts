#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { sendUSDC, deriveAddressFromPrivateKey, checkEIP7702Delegation } from './usdc';
import { validateAddress, validateAmount } from './utils';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('delegator-cli')
  .description('CLI tool for simulating USDC token transfers')
  .version('1.0.0');

program
  .argument('<amount>', 'Amount of USDC to send')
  .argument('<recipient>', 'Recipient wallet address')
  .option('-n, --network <network>', 'Network to use (ethereum, arbitrum, avalanche, base, celo, linea, optimism, polygon, unichain, worldchain)', 'ethereum')
  .option('-d, --dry-run', 'Perform a dry run without sending the transaction')
  .action(async (amount: string, recipient: string, options) => {
    try {
      console.log(chalk.blue('🚀 Starting USDC transfer...'));

      // Validate inputs
      const validAmount = validateAmount(amount);
      const validRecipient = validateAddress(recipient);

      console.log(chalk.cyan(`Amount: ${validAmount} USDC`));
      console.log(chalk.cyan(`Recipient: ${validRecipient}`));
      console.log(chalk.cyan(`Network: ${options.network}`));

      // Check environment variables
      const rpcUrl = process.env.RPC_URL;
      const privateKey = process.env.PRIVATE_KEY;
      const delegatorAddress = process.env.DELEGATOR_ADDRESS;

      if (!rpcUrl || !privateKey || !delegatorAddress) {
        throw new Error('Missing required environment variables: RPC_URL, PRIVATE_KEY, and DELEGATOR_ADDRESS');
      }

      // Derive address from private key and check for EIP-7702 delegation
      const derivedAddress = deriveAddressFromPrivateKey(privateKey);
      console.log(chalk.cyan(`Derived Address from Private Key: ${derivedAddress}`));

      // Check if the derived address has contract code (EIP-7702 delegation)
      const delegationResult = await checkEIP7702Delegation(derivedAddress, options.network, rpcUrl);

      if (delegationResult.isDelegated) {
        console.log(chalk.magenta('🔗 EIP-7702 Delegation detected'));
        console.log(chalk.magenta(`   Delegated to: ${delegationResult.delegationTarget}`));

        // Check if delegation target matches DELEGATOR_ADDRESS from env
        const delegationMatches = delegationResult.delegationTarget?.toLowerCase() === delegatorAddress.toLowerCase();
        if (delegationMatches) {
          console.log(chalk.green('✅ Delegation target matches DELEGATOR_ADDRESS from env'));
        } else {
          console.log(chalk.red('❌ Delegation target does NOT match DELEGATOR_ADDRESS from env'));
          console.log(chalk.red(`   Expected: ${delegatorAddress}`));
          console.log(chalk.red(`   Actual: ${delegationResult.delegationTarget}`));
        }
      } else if (delegationResult.code) {
        console.log(chalk.yellow('📄 Regular Contract: Address has contract code (not EIP-7702)'));
        console.log(chalk.red('❌ No EIP-7702 delegation found'));
      } else {
        console.log(chalk.blue('👤 Regular EOA: No contract code detected'));
        console.log(chalk.red('❌ No EIP-7702 delegation found'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(); 