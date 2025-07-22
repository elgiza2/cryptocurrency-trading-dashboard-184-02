
import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, ArrowDown, Coins, Copy, ExternalLink } from "lucide-react";
import { useTonWallet } from "@/hooks/useTonWallet";
import { useTonPrice } from "@/hooks/useTonPrice";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { EnhancedDepositDialog } from "./EnhancedDepositDialog";
import { supabase } from "@/integrations/supabase/client";
import vireonLogo from "@/assets/vireon-logo.png";
import usdtLogo from "@/assets/usdt-logo.png";

const tonLogo = "/lovable-uploads/512a8240-b5f7-4248-acb5-8c6170abc85c.png";

interface TokenBalance {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  icon: string;
}

interface WalletPageProps {
  userBalance?: { space: number; ton: number };
}

const WalletPage = ({ userBalance: propUserBalance }: WalletPageProps) => {
  const { isConnected, balance, connectWallet, formatAddress, walletAddress, sendTransaction } = useTonWallet();
  const { tonPrice } = useTonPrice();
  const { toast } = useToast();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalUserBalance, setInternalUserBalance] = useState(0);

  // Load wallet holdings from database
  useEffect(() => {
    loadWalletHoldings();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [isConnected, walletAddress]);

  const loadWalletHoldings = async () => {
    try {
      setLoading(true);
      
      // Get user's real balance from database
      let realUserBalance = 0;
      
      // Try to get Telegram user data first
      const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (telegramUser?.id) {
        // Get user balance using telegram_id
        const { data: userData } = await supabase
          .from('users')
          .select('total_balance')
          .eq('telegram_id', telegramUser.id.toString())
          .single();
          
        realUserBalance = userData?.total_balance || 0;
      } else if (walletAddress) {
        // Fallback: try to get user by wallet address in profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('ton_wallet_address', walletAddress)
          .single();

        if (profile) {
          // Get user's total balance from users table
          const { data: userData } = await supabase
            .from('users')
            .select('total_balance')
            .eq('id', profile.user_id)
            .single();
          
          realUserBalance = userData?.total_balance || 0;
        }
      }
      
      setInternalUserBalance(realUserBalance);

      // Always include TON with both wallet balance and real balance
      const tonBalance = {
        symbol: "TON",
        name: "Toncoin", 
        amount: realUserBalance, // Use real balance instead of wallet balance
        value: realUserBalance * tonPrice,
        icon: tonLogo
      };

      // Get wallet holdings from database
      if (walletAddress) {
        const { data: holdings, error } = await supabase
          .from('wallet_holdings')
          .select(`
            balance,
            cryptocurrency:cryptocurrencies(
              id,
              name,
              symbol,
              current_price,
              icon_url
            )
          `)
          .eq('user_id', walletAddress)
          .gt('balance', 0);

        if (error) {
          console.error('Error loading wallet holdings:', error);
        }

        const databaseTokens: TokenBalance[] = holdings?.map(holding => ({
          symbol: holding.cryptocurrency?.symbol || '',
          name: holding.cryptocurrency?.name || '',
          amount: holding.balance || 0,
          value: (holding.balance || 0) * (holding.cryptocurrency?.current_price || 0),
          icon: holding.cryptocurrency?.icon_url || ''
        })) || [];

        // Combine TON with database tokens
        setTokenBalances([tonBalance, ...databaseTokens]);
      } else {
        // If no wallet connected, just show TON with real balance
        setTokenBalances([tonBalance]);
      }
    } catch (error) {
      console.error('Error loading wallet holdings:', error);
      // Fallback to show user's real balance
      setTokenBalances([{
        symbol: "TON",
        name: "Toncoin",
        amount: propUserBalance?.ton || internalUserBalance,
        value: (propUserBalance?.ton || internalUserBalance) * tonPrice,
        icon: tonLogo
      }]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('wallet-holdings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_holdings'
        },
        () => {
          console.log('Wallet holdings updated, reloading...');
          loadWalletHoldings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Update user balance when balance changes
  useEffect(() => {
    if (isConnected && !loading) {
      const currentBalance = propUserBalance?.ton || internalUserBalance;
      setTokenBalances(prev => 
        prev.map(token => 
          token.symbol === "TON" 
            ? {
                ...token,
                amount: currentBalance,
                value: currentBalance * tonPrice
              }
            : token
        )
      );
    }
  }, [propUserBalance, internalUserBalance, tonPrice, isConnected, loading]);

  const totalValue = tokenBalances.reduce((sum, token) => sum + token.value, 0);

  const handleDeposit = async (amount: number) => {
    console.log('🎯 WalletPage handleDeposit called with amount:', amount);
    console.log('Amount type:', typeof amount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount for deposit",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const platformAddress = "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq";
      const comment = '';
      
      console.log('📤 About to call sendTransaction with exact amount:', amount);
      await sendTransaction(platformAddress, amount, comment);
      
      toast({
        title: "Deposit Successful",
        description: `Successfully deposited ${amount} TON to your wallet`,
      });
      
    } catch (error) {
      console.error("💥 Deposit failed in WalletPage:", error);
      toast({
        title: "Deposit Failed",
        description: "An error occurred during the deposit process",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-cyber font-bold text-white">Connect Your Wallet</h2>
          <p className="text-gray-400 max-w-sm text-sm">
            Connect your TON wallet to start managing your crypto assets
          </p>
        </div>
        
        <Button 
          onClick={() => connectWallet()}
          className="btn-mining w-full max-w-xs h-12 text-base font-bold"
        >
          Connect TON Wallet
        </Button>
        
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          <div className="text-center">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-gray-400">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-1">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-xs text-gray-400">Fast</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-1">
              <Coins className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xs text-gray-400">Multi-Currency</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-gray-400 cursor-pointer" onClick={copyAddress}>
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span className="text-sm">{formatAddress(walletAddress)}</span>
            <Copy className="h-3 w-3" />
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-matrix font-bold text-white">
              ${totalValue < 0.01 ? "<0.01" : totalValue.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Total Value</div>
            <div className="text-xs text-gray-500">
              Real Balance: {(propUserBalance?.ton || internalUserBalance).toFixed(4)} TON
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="text-center cursor-pointer" onClick={() => setIsDepositOpen(true)}>
              <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-primary/30 transition-colors">
                <ArrowDown className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-white font-space font-medium">Deposit</span>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-2 opacity-50">
                <TrendingUp className="h-5 w-5 text-gray-500" />
              </div>
              <span className="text-sm text-gray-500 font-space font-medium">Withdraw</span>
              <p className="text-xs text-gray-600 mt-1">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Enhanced Deposit Dialog */}
        <EnhancedDepositDialog
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onDeposit={handleDeposit}
          isProcessing={isProcessing}
        />

        {/* Tokens */}
        <div className="px-4 space-y-2 pb-20">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading wallet assets...
            </div>
          ) : (
            tokenBalances.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    <img src={token.icon} alt={token.symbol} className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <div className="font-cyber font-semibold text-white text-sm">{token.name}</div>
                    <div className="text-xs text-gray-400 font-matrix">{token.amount.toFixed(4)} {token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-matrix font-semibold text-white text-sm">${token.value.toFixed(2)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default WalletPage;
