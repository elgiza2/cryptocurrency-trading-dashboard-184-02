
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

  // Convert TON to nanotons with detailed logging
  private tonToNanotons(tonAmount: number): string {
    console.log('=== TON to Nanotons Conversion ===');
    console.log('Input TON amount:', tonAmount);
    console.log('Input type:', typeof tonAmount);
    
    if (isNaN(tonAmount) || tonAmount <= 0) {
      throw new Error(`المبلغ غير صحيح: ${tonAmount} TON`);
    }

    if (tonAmount < this.MIN_AMOUNT) {
      throw new Error(`الحد الأدنى للإرسال هو ${this.MIN_AMOUNT} TON`);
    }

    if (tonAmount > this.MAX_AMOUNT) {
      throw new Error(`الحد الأقصى للإرسال هو ${this.MAX_AMOUNT} TON`);
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
      throw new Error('عنوان المستقبل مطلوب');
    }
    
    if (!details.amountTON || details.amountTON <= 0) {
      throw new Error(`المبلغ غير صحيح: ${details.amountTON} TON`);
    }
    
    if (!details.amountNanotons) {
      throw new Error('مبلغ النانوتون مطلوب');
    }
    
    // Verify conversion consistency
    const expectedNanotons = Math.floor(details.amountTON * 1_000_000_000).toString();
    if (details.amountNanotons !== expectedNanotons) {
      console.error('خطأ في تحويل المبلغ!');
      console.error('النانوتون المتوقع:', expectedNanotons);
      console.error('النانوتون الفعلي:', details.amountNanotons);
      throw new Error('خطأ في تحويل المبلغ');
    }
    
    console.log('✅ تم التحقق من المعاملة بنجاح');
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
    console.log('🚀 === بدء معاملة TON ===');
    console.log('الوقت:', new Date().toISOString());
    console.log('العنوان المستقبل:', toAddress);
    console.log('المبلغ TON:', amountTON);
    console.log('نوع المبلغ:', typeof amountTON);
    console.log('التعليق:', comment);

    try {
      // Step 1: Validate amount range
      if (amountTON < this.MIN_AMOUNT) {
        throw new Error(`الحد الأدنى للإرسال هو ${this.MIN_AMOUNT} TON`);
      }

      if (amountTON > this.MAX_AMOUNT) {
        throw new Error(`الحد الأقصى للإرسال هو ${this.MAX_AMOUNT} TON`);
      }

      // Step 2: Check if confirmation needed for large amounts
      if (this.requiresConfirmation(amountTON)) {
        const confirmed = window.confirm(
          `أنت على وشك إرسال ${amountTON} TON. هل أنت متأكد من المتابعة؟`
        );
        if (!confirmed) {
          throw new Error('تم إلغاء المعاملة من قبل المستخدم');
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

      console.log('📋 كائن المعاملة النهائي:');
      console.log('- صالح حتى:', transaction.validUntil);
      console.log('- الرسائل[0].العنوان:', transaction.messages[0].address);
      console.log('- الرسائل[0].المبلغ:', transaction.messages[0].amount);
      console.log('- نوع المبلغ:', typeof transaction.messages[0].amount);

      // Step 7: Send transaction
      console.log('📤 إرسال المعاملة إلى TON Connect...');
      const result = await this.tonConnectUI.sendTransaction(transaction);
      
      console.log('✅ تم إرسال المعاملة بنجاح!');
      console.log('نتيجة المعاملة:', result);
      console.log('🎉 === اكتملت المعاملة ===');
      
      return result;
      
    } catch (error) {
      console.error('❌ === فشلت المعاملة ===');
      console.error('تفاصيل الخطأ:', error);
      console.error('رسالة الخطأ:', error instanceof Error ? error.message : 'خطأ غير معروف');
      console.error('🔥 === نهاية سجل الأخطاء ===');
      throw error;
    }
  }
}
