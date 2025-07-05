#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { sendUSDC } from './usdc';
import { validateAddress, validateAmount } from './utils';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('delegator-cli')
  .description('CLI tool for sending USDC tokens')
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

      if (options.dryRun) {
        console.log(chalk.yellow('🧪 Dry run mode - no transaction will be sent'));
        return;
      }

      // Check environment variables
      const rpcUrl = process.env.RPC_URL;
      const privateKey = process.env.PRIVATE_KEY;
      const delegatorAddress = process.env.DELEGATOR_ADDRESS;

      if (!rpcUrl || !privateKey || !delegatorAddress) {
        throw new Error('Missing required environment variables: RPC_URL, PRIVATE_KEY, and DELEGATOR_ADDRESS');
      }

      // Send USDC
      const txHash = await sendUSDC({
        amount: validAmount,
        recipient: validRecipient,
        network: options.network,
        rpcUrl,
        privateKey,
        delegatorAddress
      });

      console.log(chalk.green(`✅ Transaction sent successfully!`));
      console.log(chalk.green(`Transaction hash: ${txHash}`));

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(); 