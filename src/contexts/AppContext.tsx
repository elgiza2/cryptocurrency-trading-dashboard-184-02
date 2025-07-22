
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { DatabaseService } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface UserData {
  id: string;
  telegram_id: string;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code: string;
  is_premium: boolean;
  total_balance: number;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  telegramUser: TelegramUser | null;
  userData: UserData | null;
  isLoading: boolean;
  balance: number;
  updateBalance: (newBalance: number) => void;
  refreshUserData: () => Promise<void>;
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeTelegramUser();
  }, []);

  const initializeTelegramUser = async () => {
    try {
      setIsLoading(true);
      
      // Try to get Telegram user data
      let tgUser: TelegramUser;
      
      if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        tgUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
      } else {
        // Fallback for development/testing
        tgUser = {
          id: Date.now(),
          first_name: "Test User",
          username: "testuser"
        };
        console.log('Using fallback user for development');
      }
      
      setTelegramUser(tgUser);
      
      // Create or update user in database
      const { data: createdUser, error: createError } = await DatabaseService.createOrUpdateUser(tgUser);
      
      if (createError) {
        console.error('Error creating/updating user:', createError);
        toast({
          title: "خطأ في تحميل بيانات المستخدم",
          description: "حدث خطأ أثناء تحميل بيانات المستخدم",
          variant: "destructive"
        });
        return;
      }

      // Get full user data from database
      const { data: fullUserData, error: getUserError } = await DatabaseService.getUser(tgUser.id.toString());
      
      if (getUserError || !fullUserData) {
        console.error('Error getting user data:', getUserError);
        return;
      }

      setUserData(fullUserData);
      setBalance(Number(fullUserData.total_balance) || 0);
      
      console.log('User initialized successfully:', fullUserData);
      
    } catch (error) {
      console.error('Error initializing user:', error);
      toast({
        title: "خطأ في التهيئة",
        description: "حدث خطأ أثناء تهيئة التطبيق",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!telegramUser) return;
    
    try {
      const { data: fullUserData, error } = await DatabaseService.getUser(telegramUser.id.toString());
      
      if (error || !fullUserData) {
        console.error('Error refreshing user data:', error);
        return;
      }

      setUserData(fullUserData);
      setBalance(Number(fullUserData.total_balance) || 0);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!telegramUser || !userData) return;
    
    try {
      setBalance(newBalance);
      
      // Update balance in database
      const { error } = await DatabaseService.updateUserBalance(telegramUser.id.toString(), newBalance - balance);
      
      if (error) {
        console.error('Error updating balance:', error);
        // Revert local change if database update failed
        setBalance(balance);
        toast({
          title: "خطأ في تحديث الرصيد",
          description: "فشل في تحديث الرصيد في قاعدة البيانات",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh user data to get updated balance
      await refreshUserData();
      
    } catch (error) {
      console.error('Error updating balance:', error);
      setBalance(balance); // Revert change
    }
  };

  return (
    <AppContext.Provider value={{
      telegramUser,
      userData,
      isLoading,
      balance,
      updateBalance,
      refreshUserData
    }}>
      {children}
    </AppContext.Provider>
  );
};
