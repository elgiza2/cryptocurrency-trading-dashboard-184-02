import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { DatabaseService } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import { useReferralProcessor } from "@/hooks/useReferralProcessor";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface AppContextType {
  telegramUser: TelegramUser | null;
  isLoading: boolean;
  balance: { space: number; ton: number };
  updateBalance: (newBalance: { space: number; ton: number }) => void;
  refreshBalance: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState({ space: 0, ton: 0 });
  const { processReferral } = useReferralProcessor();

  useEffect(() => {
    initializeTelegramUser();
  }, []);

  const initializeTelegramUser = async () => {
    try {
      // Try to get Telegram user data
      if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
        setTelegramUser(tgUser);
        
        // Check if user is new (check if exists in database)
        const existingUser = await DatabaseService.getUser(tgUser.id.toString());
        const isNewUser = !existingUser.data;
        
        // Create or update user in database
        await DatabaseService.createOrUpdateUser(tgUser);
        
        // Process referral for new users
        if (isNewUser) {
          await processReferral(tgUser.id.toString());
        }
        
        // Initialize user balance if needed
        await supabase.rpc('initialize_user_balance', { user_telegram_id: tgUser.id.toString() });
        
        // Load user balance from database
        await loadUserBalance(tgUser.id.toString());
        
        console.log('Telegram user initialized:', tgUser);
      } else {
        // Fallback for development/testing
        const fallbackUser = {
          id: Date.now(),
          first_name: "Test User",
          username: "testuser"
        };
        setTelegramUser(fallbackUser);
        
        // Check if user is new for development
        const existingUser = await DatabaseService.getUser(fallbackUser.id.toString());
        const isNewUser = !existingUser.data;
        
        await DatabaseService.createOrUpdateUser(fallbackUser);
        
        // Process referral for new users (in development, check URL params)
        if (isNewUser) {
          await processReferral(fallbackUser.id.toString());
        }
        
        // Initialize user balance if needed
        await supabase.rpc('initialize_user_balance', { user_telegram_id: fallbackUser.id.toString() });
        
        // Load user balance from database
        await loadUserBalance(fallbackUser.id.toString());
        
        console.log('Using fallback user for development');
      }
    } catch (error) {
      console.error('Error initializing Telegram user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_balance', { user_telegram_id: userId });
      if (error) throw error;
      
      if (data && data.length > 0) {
        setBalance({
          space: parseFloat(data[0].space_balance.toString()) || 0,
          ton: parseFloat(data[0].ton_balance.toString()) || 0
        });
      }
    } catch (error) {
      console.error('Error loading user balance:', error);
    }
  };

  const updateBalance = (newBalance: { space: number; ton: number }) => {
    setBalance(newBalance);
  };

  const refreshBalance = async () => {
    if (telegramUser) {
      await loadUserBalance(telegramUser.id.toString());
    }
  };

  return (
    <AppContext.Provider value={{
      telegramUser,
      isLoading,
      balance,
      updateBalance,
      refreshBalance
    }}>
      {children}
    </AppContext.Provider>
  );
};