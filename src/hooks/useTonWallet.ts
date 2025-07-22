
import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useToast } from '@/hooks/use-toast';
import { TonTransactionService } from '@/services/tonTransactionService';

export interface TonTransaction {
  to: string;
  value: string;
  data?: string;
}

export const useTonWallet = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize transaction service
  const transactionService = new TonTransactionService(tonConnectUI);

  // Enhanced connection checking with better error handling
  const checkConnection = useCallback(async () => {
    if (!tonConnectUI) {
      console.log('❌ TonConnectUI غير مهيأ');
      return;
    }

    try {
      console.log('🔍 فحص اتصال محفظة TON...');
      console.log('📱 مثيل TonConnectUI:', !!tonConnectUI);
      console.log('🔗 حالة الاتصال:', tonConnectUI?.connected);
      console.log('💳 المحفظة الحالية:', tonConnectUI?.wallet);
      
      const connected = tonConnectUI.connected;
      const hasWallet = !!tonConnectUI.wallet;
      
      console.log('🎯 نتائج فحص الاتصال:', { connected, hasWallet });
      
      // Update connection state
      setIsConnected(connected && hasWallet);
      setConnectionError(null);
      
      if (connected && hasWallet && tonConnectUI.wallet?.account) {
        const address = tonConnectUI.wallet.account.address;
        console.log('✅ تم ربط المحفظة بنجاح');
        console.log('📍 عنوان المحفظة:', address);
        
        setWalletAddress(address);
        
        // Fetch balance with improved error handling
        try {
          console.log('💰 جلب رصيد المحفظة...');
          const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
          
          if (!response.ok) {
            throw new Error(`خطأ HTTP! الحالة: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('📊 استجابة API الرصيد:', data);
          
          if (data.ok && data.result) {
            const balanceInTon = (parseInt(data.result) / 1_000_000_000).toFixed(4);
            setBalance(balanceInTon);
            console.log('✅ تم جلب الرصيد بنجاح:', balanceInTon, 'TON');
          } else {
            console.warn('⚠️ API الرصيد أرجع خطأ:', data);
            setBalance('0.0000');
          }
        } catch (balanceError) {
          console.error('❌ فشل في جلب الرصيد:', balanceError);
          setBalance('0.0000');
        }
      } else {
        console.log('❌ المحفظة غير متصلة أو لا توجد معلومات حساب');
        setWalletAddress(null);
        setBalance(null);
      }
    } catch (error) {
      console.error('💥 خطأ في فحص الاتصال:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'خطأ اتصال غير معروف');
    }
  }, [tonConnectUI]);

  // Enhanced effect for monitoring TON Connect UI changes
  useEffect(() => {
    if (!tonConnectUI) {
      console.log('⏳ انتظار تهيئة TonConnectUI...');
      return;
    }

    console.log('🚀 تم تهيئة TonConnectUI، إعداد المستمعين...');
    
    // Initial connection check
    checkConnection();
    
    // Enhanced status change listener
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      console.log('🔄 === تم تغيير حالة المحفظة ===');
      console.log('🔄 كائن المحفظة الجديد:', wallet);
      console.log('🔄 حالة الاتصال:', !!wallet);
      
      // Immediate state updates
      const connected = !!wallet;
      setIsConnected(connected);
      
      if (wallet?.account) {
        const address = wallet.account.address;
        setWalletAddress(address);
        setConnectionError(null);
        console.log('✅ تم ربط المحفظة عبر تغيير الحالة:', address);
        
        // Show success toast
        toast({
          title: "تم الاتصال بنجاح",
          description: "تم ربط محفظة TON بنجاح",
        });
      } else {
        setWalletAddress(null);
        setBalance(null);
        console.log('❌ تم قطع اتصال المحفظة عبر تغيير الحالة');
      }
      
      // Re-check connection after a short delay
      setTimeout(() => {
        checkConnection();
      }, 200);
    });
    
    return () => {
      if (unsubscribe) {
        console.log('🧹 تنظيف مستمع حالة المحفظة');
        unsubscribe();
      }
    };
  }, [tonConnectUI, checkConnection, toast]);

  // Enhanced connect wallet function
  const connectWallet = useCallback(async () => {
    try {
      if (!tonConnectUI) {
        throw new Error('TonConnect UI غير مهيأ');
      }

      console.log('🚀 === محاولة ربط المحفظة ===');
      console.log('🔍 حالة الاتصال الحالية:', tonConnectUI.connected);
      console.log('💳 المحفظة الحالية:', tonConnectUI.wallet);
      
      // Check if already connected properly
      if (tonConnectUI.connected && tonConnectUI.wallet?.account) {
        console.log('✅ المحفظة متصلة بالفعل، فرض تحديث واجهة المستخدم');
        setIsConnected(true);
        setWalletAddress(tonConnectUI.wallet.account.address);
        
        toast({
          title: "المحفظة متصلة بالفعل",
          description: "محفظة TON متصلة ومعدة للاستخدام",
        });
        return;
      }

      setIsLoading(true);
      setConnectionError(null);
      
      console.log('📱 فتح نافذة الاتصال...');
      
      // Open the modal and wait for user interaction
      await tonConnectUI.openModal();
      
      console.log('✅ تم فتح نافذة الاتصال بنجاح');
      
    } catch (error) {
      console.error('💥 فشل الاتصال:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setConnectionError(errorMessage);
      
      toast({
        title: "فشل الاتصال",
        description: `فشل في ربط محفظة TON: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tonConnectUI, toast]);

  // Enhanced disconnect function
  const disconnectWallet = useCallback(async () => {
    try {
      if (!tonConnectUI) {
        throw new Error('TonConnect UI غير مهيأ');
      }

      console.log('🔌 قطع اتصال المحفظة...');
      setIsLoading(true);
      
      await tonConnectUI.disconnect();
      
      // Reset state immediately
      setWalletAddress(null);
      setBalance(null);
      setIsConnected(false);
      setConnectionError(null);
      
      console.log('✅ تم قطع اتصال المحفظة بنجاح');
      
      toast({
        title: "تم قطع الاتصال",
        description: "تم قطع اتصال المحفظة بنجاح",
      });
    } catch (error) {
      console.error('💥 فشل قطع اتصال المحفظة:', error);
      toast({
        title: "فشل قطع الاتصال",
        description: "فشل في قطع اتصال المحفظة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tonConnectUI, toast]);

  // Enhanced sendTransaction with better error handling
  const sendTransaction = useCallback(async (
    toAddress: string, 
    amountTon: number, 
    comment?: string
  ) => {
    console.log('🎬 === بدء إرسال المعاملة من المحفظة ===');
    console.log('📤 تفاصيل المعاملة:', { toAddress, amountTon, comment });

    if (!isConnected || !tonConnectUI) {
      const error = 'المحفظة غير متصلة';
      console.error('❌', error);
      throw new Error(error);
    }

    if (!amountTon || amountTon <= 0) {
      const error = `مبلغ غير صحيح: ${amountTon}`;
      console.error('❌', error);
      throw new Error(error);
    }

    try {
      setIsLoading(true);
      
      console.log('💸 إرسال المعاملة عبر الخدمة...');
      const result = await transactionService.sendTransaction(toAddress, amountTon, comment);
      
      console.log('✅ تم إرسال المعاملة بنجاح:', result);
      toast({
        title: "تم إرسال المعاملة",
        description: `تم إرسال ${amountTon} TON بنجاح`,
      });

      return result;
      
    } catch (error) {
      console.error('💥 فشلت المعاملة:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ معاملة غير معروف';
      
      toast({
        title: "فشل المعاملة",
        description: `فشل في إرسال TON: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 === انتهاء إرسال المعاملة من المحفظة ===');
    }
  }, [isConnected, transactionService, toast, tonConnectUI]);

  // Format address for display
  const formatAddress = useCallback((address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    isConnected,
    walletAddress,
    balance,
    isLoading,
    connectionError,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    formatAddress,
    tonConnectUI
  };
};
