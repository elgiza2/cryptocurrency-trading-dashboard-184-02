import { TonConnectUI } from '@tonconnect/ui-react';
import { supabase } from '@/integrations/supabase/client';

export interface TransactionDetails {
  toAddress: string;
  amountTON: number;
  amountNanotons: string;
  comment?: string;
  timestamp: number;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  details?: TransactionDetails;
}

export class EnhancedTonTransactionService {
  private tonConnectUI: TonConnectUI;
  private readonly MIN_AMOUNT = 0.001;
  private readonly MAX_AMOUNT = 1000;
  private readonly LARGE_AMOUNT_THRESHOLD = 10;
  
  private transactionCounts = new Map<string, number>();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_TRANSACTIONS_PER_MINUTE = 5;

  constructor(tonConnectUI: TonConnectUI) {
    this.tonConnectUI = tonConnectUI;
  }

  // Enhanced conversion with precise validation
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

    const nanotons = Math.floor(tonAmount * 1_000_000_000);
    const nanotonsString = nanotons.toString();
    
    console.log('Calculated nanotons:', nanotons);
    console.log('Nanotons string:', nanotonsString);
    console.log('Verification:', nanotons / 1_000_000_000, 'TON');
    console.log('=== End Conversion ===');
    
    return nanotonsString;
  }

  // Enhanced validation with comprehensive checks
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
      throw new Error('Nanotون amount is required');
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

  // Rate limiting implementation
  private checkRateLimit(userAddress: string): void {
    const now = Date.now();
    const userTransactions = this.transactionCounts.get(userAddress) || 0;
    
    if (userTransactions >= this.MAX_TRANSACTIONS_PER_MINUTE) {
      throw new Error('Rate limit exceeded. Please wait before sending another transaction.');
    }
    
    this.transactionCounts.set(userAddress, userTransactions + 1);
    
    // Clean up rate limit after window
    setTimeout(() => {
      const current = this.transactionCounts.get(userAddress) || 0;
      if (current > 0) {
        this.transactionCounts.set(userAddress, current - 1);
      }
    }, this.RATE_LIMIT_WINDOW);
  }

  // Enhanced address validation
  private validateTonAddress(address: string): boolean {
    // Basic TON address validation
    if (!address || address.length < 48) {
      return false;
    }
    
    // Check if it starts with UQ or EQ (raw address format)
    if (!address.startsWith('UQ') && !address.startsWith('EQ')) {
      return false;
    }
    
    // Check if it contains only valid base64 characters
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(address.substring(2));
  }

  // Get user authentication status
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated. Please log in first.');
    }
    return user;
  }

  // Record transaction in database with error recovery
  private async recordTransaction(
    details: TransactionDetails,
    tokenId?: string,
    transactionType: 'buy' | 'sell' | 'transfer' = 'transfer'
  ): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      const transactionData = {
        user_id: user.id,
        transaction_type: transactionType,
        amount: details.amountTON,
        status: details.status,
        ton_tx_hash: details.transactionHash,
        ...(tokenId && { cryptocurrency_id: tokenId })
      };

      const { error } = await supabase.from('transactions').insert(transactionData);
      
      if (error) {
        console.error('Failed to record transaction:', error);
        // Don't throw here - transaction already sent successfully
        // Just log the database error for monitoring
      } else {
        console.log('✅ Transaction recorded successfully');
      }
    } catch (error) {
      console.error('Database recording failed:', error);
      // Continue - don't block user flow for database issues
    }
  }

  // Enhanced transaction sending with comprehensive error handling
  async sendTransaction(
    toAddress: string, 
    amountTON: number, 
    comment?: string,
    showConfirmation: boolean = true
  ): Promise<TransactionResult> {
    console.log('🚀 === Starting Enhanced TON Transaction ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Recipient:', toAddress);
    console.log('Amount TON:', amountTON);
    console.log('Comment:', comment);

    try {
      // Step 1: Validate user authentication
      await this.getCurrentUser();

      // Step 2: Validate address format
      if (!this.validateTonAddress(toAddress)) {
        throw new Error('Invalid TON address format');
      }

      // Step 3: Rate limiting check
      this.checkRateLimit(toAddress);

      // Step 4: Amount validation
      if (amountTON < this.MIN_AMOUNT) {
        throw new Error(`Minimum amount is ${this.MIN_AMOUNT} TON`);
      }

      if (amountTON > this.MAX_AMOUNT) {
        throw new Error(`Maximum amount is ${this.MAX_AMOUNT} TON`);
      }

      // Step 5: User confirmation for large amounts
      if (showConfirmation && amountTON >= this.LARGE_AMOUNT_THRESHOLD) {
        const confirmed = window.confirm(
          `You are about to send ${amountTON} TON. Are you sure you want to continue?`
        );
        if (!confirmed) {
          return {
            success: false,
            error: 'Transaction cancelled by user'
          };
        }
      }

      // Step 6: Convert amount
      const amountNanotons = this.tonToNanotons(amountTON);
      
      // Step 7: Create transaction details
      const transactionDetails: TransactionDetails = {
        toAddress,
        amountTON,
        amountNanotons,
        comment: comment || '',
        timestamp: Date.now(),
        status: 'pending'
      };

      // Step 8: Validate transaction
      this.validateTransaction(transactionDetails);

      // Step 9: Create TON transaction object
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: toAddress,
            amount: amountNanotons,
            ...(comment && { payload: comment })
          }
        ]
      };

      console.log('📋 Final transaction object:');
      console.log('- Valid until:', transaction.validUntil);
      console.log('- Message address:', transaction.messages[0].address);
      console.log('- Message amount:', transaction.messages[0].amount);

      // Step 10: Send transaction
      console.log('📤 Sending transaction to TON Connect...');
      const result = await this.tonConnectUI.sendTransaction(transaction);
      
      console.log('✅ Transaction sent successfully!');
      console.log('Transaction result:', result);

      // Update transaction details with result
      transactionDetails.status = 'confirmed';
      transactionDetails.transactionHash = result?.boc || 'unknown';

      // Record in database (non-blocking)
      this.recordTransaction(transactionDetails);
      
      console.log('🎉 === Transaction Complete ===');
      
      return {
        success: true,
        transactionHash: transactionDetails.transactionHash,
        details: transactionDetails
      };
      
    } catch (error) {
      console.error('❌ === Transaction Failed ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔥 === End Error Log ===');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Enhanced crypto buying with better error handling
  async buyCrypto(
    tokenId: string,
    tonAmount: number,
    tokenPrice: number,
    platformAddress: string
  ): Promise<TransactionResult> {
    try {
      const comment = `Buy crypto token ${tokenId} for ${tonAmount} TON`;
      const result = await this.sendTransaction(platformAddress, tonAmount, comment, true);
      
      if (result.success && result.details) {
        // Record as buy transaction
        await this.recordTransaction(result.details, tokenId, 'buy');
      }
      
      return result;
    } catch (error) {
      console.error('Crypto purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Crypto purchase failed'
      };
    }
  }

  // Get transaction status
  async getTransactionStatus(transactionHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    // In a real implementation, this would query the TON blockchain
    // For now, we'll return a mock status
    console.log('Checking transaction status for:', transactionHash);
    return 'confirmed';
  }

  // Get user's transaction history
  async getTransactionHistory(limit: number = 10) {
    try {
      const user = await this.getCurrentUser();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }
}