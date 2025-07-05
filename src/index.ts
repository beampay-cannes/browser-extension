#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { sendUSDC, deriveAddressFromPrivateKey, checkEIP7702Delegation, createCalldataArray, packCalldataArray, createExecuteCalldata, sendExecuteTransaction, sendEIP7702Transaction } from './usdc';
import { validateAddress, validateAmount, validatePaymentId } from './utils';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('delegator-cli')
  .description('CLI tool for EIP-7702 delegation checking and calldata formation')
  .version('1.0.0');

program
  .argument('<amount>', 'Amount of USDC to send')
  .argument('<recipient>', 'Recipient wallet address')
  .argument('<paymentId>', 'Payment ID (string)')
  .option('-n, --network <network>', 'Network to use (ethereum, arbitrum, avalanche, base, celo, linea, optimism, polygon, unichain, worldchain)', 'ethereum')
  .option('-d, --dry-run', 'Perform a dry run without sending the transaction')
  .action(async (amount: string, recipient: string, paymentId: string, options) => {
    try {
      console.log(chalk.blue('🚀 Starting USDC transfer...'));

      // Validate inputs
      const validAmount = validateAmount(amount);
      const validRecipient = validateAddress(recipient);
      const validPaymentId = validatePaymentId(paymentId);

      console.log(chalk.cyan(`Amount: ${validAmount} USDC`));
      console.log(chalk.cyan(`Recipient: ${validRecipient}`));
      console.log(chalk.cyan(`Payment ID: ${validPaymentId}`));
      console.log(chalk.cyan(`Network: ${options.network}`));

      // Check environment variables
      const rpcUrl = process.env.RPC_URL;
      const privateKey = process.env.PRIVATE_KEY;
      const delegatorAddress = process.env.DELEGATOR_ADDRESS;
      const eventorAddress = process.env.EVENTOR_ADDRESS;

      if (!rpcUrl || !privateKey || !delegatorAddress || !eventorAddress) {
        throw new Error('Missing required environment variables: RPC_URL, PRIVATE_KEY, DELEGATOR_ADDRESS, and EVENTOR_ADDRESS');
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

      // Create calldata array
      console.log(chalk.blue('\n📦 Creating calldata array...'));
      const calldataArray = createCalldataArray(eventorAddress, validRecipient, validAmount, validPaymentId, options.network);

      console.log(chalk.cyan('Calldata Array:'));
      calldataArray.forEach((item, index) => {
        console.log(chalk.cyan(`  [${index}]: (${item[0]}, ${item[1]}, ${item[2]})`));
      });

      // Pack the array into bytes
      console.log(chalk.blue('\n📦 Packing calldata array into bytes...'));
      const packedBytes = packCalldataArray(calldataArray);
      console.log(chalk.cyan('Packed Bytes:'));
      console.log(chalk.cyan(packedBytes));

      // Create execute calldata
      console.log(chalk.blue('\n🔧 Creating execute calldata...'));
      const executeCalldata = createExecuteCalldata(packedBytes);
      console.log(chalk.cyan('Execute Calldata:'));
      console.log(chalk.cyan(executeCalldata));

      // Send transaction based on delegation status
      if (delegationResult.isDelegated) {
        const delegationMatches = delegationResult.delegationTarget?.toLowerCase() === delegatorAddress.toLowerCase();
        if (delegationMatches && !options.dryRun) {
          console.log(chalk.blue('\n📡 Sending transaction (with existing delegation)...'));
          console.log(chalk.cyan(`From: ${derivedAddress}`));
          console.log(chalk.cyan(`To: ${derivedAddress} (self-transaction)`));
          console.log(chalk.cyan(`Value: 0`));
          console.log(chalk.cyan(`Network: ${options.network}`));

          const txHash = await sendExecuteTransaction(privateKey, executeCalldata, options.network, rpcUrl);
          console.log(chalk.green('✅ Transaction sent successfully!'));
          console.log(chalk.green(`Transaction Hash: ${txHash}`));
        } else if (delegationMatches && options.dryRun) {
          console.log(chalk.yellow('\n🔍 Dry run mode - transaction would be sent but skipped'));
        } else {
          console.log(chalk.red('\n❌ No transaction sent - delegation target does not match DELEGATOR_ADDRESS'));
        }
      } else {
        // No delegation found - send EIP-7702 transaction to create delegation
        if (!options.dryRun) {
          console.log(chalk.blue('\n📡 Sending EIP-7702 transaction (creating delegation)...'));
          console.log(chalk.cyan(`From: ${derivedAddress}`));
          console.log(chalk.cyan(`To: ${derivedAddress} (self-transaction)`));
          console.log(chalk.cyan(`Value: 0`));
          console.log(chalk.cyan(`Delegating to: ${delegatorAddress}`));
          console.log(chalk.cyan(`Network: ${options.network}`));
          console.log(chalk.cyan(`Transaction Type: 0x4 (EIP-7702)`));

          const txHash = await sendEIP7702Transaction(privateKey, executeCalldata, delegatorAddress, options.network, rpcUrl);
          console.log(chalk.green('✅ EIP-7702 transaction sent successfully!'));
          console.log(chalk.green(`Transaction Hash: ${txHash}`));
        } else {
          console.log(chalk.yellow('\n🔍 Dry run mode - EIP-7702 transaction would be sent but skipped'));
        }
      }

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(); 