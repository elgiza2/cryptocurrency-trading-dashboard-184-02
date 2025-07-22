import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  telegramId?: string;
  email?: string;
  isAuthenticated: boolean;
}

export class AuthService {
  // Get current authenticated user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('No authenticated user found');
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        telegramId: user.user_metadata?.telegram_id?.toString(),
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.isAuthenticated || false;
  }

  // Get or create user based on Telegram data
  static async getOrCreateUserFromTelegram(telegramUser: any): Promise<AuthUser | null> {
    try {
      // First check if we have a Supabase auth user
      const authUser = await this.getCurrentUser();
      
      if (authUser) {
        // Update user profile with Telegram data if needed
        await this.updateUserProfile(authUser.id, telegramUser);
        return authUser;
      }

      // If no auth user, create anonymous session for Telegram user
      console.log('Creating session for Telegram user:', telegramUser.id);
      
      // For now, we'll use the existing user creation system
      // In production, you might want to implement proper auth
      return {
        id: telegramUser.id.toString(),
        telegramId: telegramUser.id.toString(),
        isAuthenticated: false // Telegram user but not Supabase authenticated
      };
    } catch (error) {
      console.error('Error handling Telegram user:', error);
      return null;
    }
  }

  // Update user profile data
  static async updateUserProfile(userId: string, telegramUser: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          telegram_id: telegramUser.id.toString(),
          telegram_username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          photo_url: telegramUser.photo_url,
          language_code: telegramUser.language_code,
          is_premium: telegramUser.is_premium || false,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user profile:', error);
      } else {
        console.log('User profile updated successfully');
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
    }
  }

  // Get user balance
  static async getUserBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('total_balance')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.log('No balance found for user:', userId);
        return 0;
      }

      return Number(data.total_balance) || 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }

  // Update user balance
  static async updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          total_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user balance:', error);
        return false;
      }

      console.log('User balance updated successfully:', newBalance);
      return true;
    } catch (error) {
      console.error('Error in updateUserBalance:', error);
      return false;
    }
  }

  // Map Telegram user ID to Supabase user ID for transactions
  static async mapTelegramToSupabaseUser(telegramId: string): Promise<string | null> {
    try {
      // First try to find existing mapping
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', telegramId)
        .single();

      if (!error && data) {
        return data.id;
      }

      // If no mapping exists and we have an authenticated user, use that
      const authUser = await this.getCurrentUser();
      if (authUser?.isAuthenticated) {
        return authUser.id;
      }

      console.log('No user mapping found for Telegram ID:', telegramId);
      return null;
    } catch (error) {
      console.error('Error mapping Telegram to Supabase user:', error);
      return null;
    }
  }
}