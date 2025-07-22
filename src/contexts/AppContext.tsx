import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { DatabaseService } from "@/lib/database";

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
  balance: number;
  updateBalance: (newBalance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    initializeTelegramUser();
  }, []);

  const initializeTelegramUser = async () => {
    try {
      // Try to get Telegram user data
      if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
        setTelegramUser(tgUser);
        
        // Create or update user in database
        await DatabaseService.createOrUpdateUser(tgUser);
        
        console.log('Telegram user initialized:', tgUser);
      } else {
        // Fallback for development/testing
        const fallbackUser = {
          id: Date.now(),
          first_name: "Test User",
          username: "testuser"
        };
        setTelegramUser(fallbackUser);
        await DatabaseService.createOrUpdateUser(fallbackUser);
        console.log('Using fallback user for development');
      }
    } catch (error) {
      console.error('Error initializing Telegram user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    if (telegramUser) {
      DatabaseService.updateUserBalance(telegramUser.id.toString(), newBalance);
    }
  };

  return (
    <AppContext.Provider value={{
      telegramUser,
      isLoading,
      balance,
      updateBalance
    }}>
      {children}
    </AppContext.Provider>
  );
};