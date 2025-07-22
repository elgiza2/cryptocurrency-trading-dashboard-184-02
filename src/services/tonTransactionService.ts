
import { TonConnectUI } from '@tonconnect/ui-react';

export interface TransactionDetails {
  toAddress: string;
  amountTON: number;
  amountNanotons: string;
  comment?: string;
  timestamp: number;
}

export class TonTransactionService {
  private tonConnectUI: TonConnectUI;
  private readonly MIN_AMOUNT = 0.001; // Minimum 0.001 TON
  private readonly MAX_AMOUNT = 1000; // Maximum 1000 TON
  private readonly LARGE_AMOUNT_THRESHOLD = 10; // Show confirmation for amounts > 10 TON

  constructor(tonConnectUI: TonConnectUI) {
    this.tonConnectUI = tonConnectUI;
  }

  // Convert TON to nanotons with English logging
  private tonToNanotons(tonAmount: number): string {
    console.log('=== TON to Nanotons Conversion ===');
    console.log('Input TON amount:', tonAmount);
    console.log('Input type:', typeof tonAmount);
    
    if (isNaN(tonAmount) || tonAmount <= 0) {
      throw new Error(`Invalid amount: ${tonAmount} TON`);
    }

    if (tonAmount < this.MIN_AMOUNT) {
      throw new Error(`Minimum amount is ${this.MIN_AMOUNT} TON`);
    }

    if (tonAmount > this.MAX_AMOUNT) {
      throw new Error(`Maximum amount is ${this.MAX_AMOUNT} TON`);
    }

    // More precise conversion to avoid floating point issues
    const nanotons = Math.floor(tonAmount * 1_000_000_000);
    const nanotonsString = nanotons.toString();
    
    console.log('Calculated nanotons (number):', nanotons);
    console.log('Nanotons as string:', nanotonsString);
    console.log('Conversion verification:', nanotons / 1_000_000_000, 'TON');
    console.log('=== End Conversion ===');
    
    return nanotonsString;
  }

  // Validate transaction before sending
  private validateTransaction(details: TransactionDetails): void {
    console.log('=== Transaction Validation ===');
    console.log('Transaction details:', details);
    
    if (!details.toAddress) {
      throw new Error('Recipient address is required');
    }
    
    if (!details.amountTON || details.amountTON <= 0) {
      throw new Error(`Invalid amount: ${details.amountTON} TON`);
    }
    
    if (!details.amountNanotons) {
      throw new Error('Nanoton amount is required');
    }
    
    // Verify conversion consistency
    const expectedNanotons = Math.floor(details.amountTON * 1_000_000_000).toString();
    if (details.amountNanotons !== expectedNanotons) {
      console.error('Amount conversion error!');
      console.error('Expected nanotons:', expectedNanotons);
      console.error('Actual nanotons:', details.amountNanotons);
      throw new Error('Amount conversion error');
    }
    
    console.log('✅ Transaction validated successfully');
    console.log('=== End Validation ===');
  }

  // Check if amount requires confirmation
  private requiresConfirmation(amountTON: number): boolean {
    return amountTON >= this.LARGE_AMOUNT_THRESHOLD;
  }

  // Send transaction with comprehensive logging and validation
  async sendTransaction(
    toAddress: string, 
    amountTON: number, 
    comment?: string
  ): Promise<any> {
    console.log('🚀 === Starting TON Transaction ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Recipient address:', toAddress);
    console.log('TON amount:', amountTON);
    console.log('Amount type:', typeof amountTON);
    console.log('Comment:', comment);

    try {
      // Step 1: Validate amount range
      if (amountTON < this.MIN_AMOUNT) {
        throw new Error(`Minimum amount is ${this.MIN_AMOUNT} TON`);
      }

      if (amountTON > this.MAX_AMOUNT) {
        throw new Error(`Maximum amount is ${this.MAX_AMOUNT} TON`);
      }

      // Step 2: Check if confirmation needed for large amounts
      if (this.requiresConfirmation(amountTON)) {
        const confirmed = window.confirm(
          `You are about to send ${amountTON} TON. Are you sure you want to continue?`
        );
        if (!confirmed) {
          throw new Error('Transaction cancelled by user');
        }
      }

      // Step 3: Convert amount
      const amountNanotons = this.tonToNanotons(amountTON);
      
      // Step 4: Create transaction details
      const transactionDetails: TransactionDetails = {
        toAddress,
        amountTON,
        amountNanotons,
        comment: comment || '',
        timestamp: Date.now()
      };

      // Step 5: Validate transaction
      this.validateTransaction(transactionDetails);

      // Step 6: Create clean TON transaction object
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: toAddress,
            amount: amountNanotons
          }
        ]
      };

      console.log('📋 Final transaction object:');
      console.log('- Valid until:', transaction.validUntil);
      console.log('- Messages[0].address:', transaction.messages[0].address);
      console.log('- Messages[0].amount:', transaction.messages[0].amount);
      console.log('- Amount type:', typeof transaction.messages[0].amount);

      // Step 7: Send transaction
      console.log('📤 Sending transaction to TON Connect...');
      const result = await this.tonConnectUI.sendTransaction(transaction);
      
      console.log('✅ Transaction sent successfully!');
      console.log('Transaction result:', result);
      console.log('🎉 === Transaction Complete ===');
      
      return result;
      
    } catch (error) {
      console.error('❌ === Transaction Failed ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔥 === End Error Log ===');
      throw error;
    }
  }
}
