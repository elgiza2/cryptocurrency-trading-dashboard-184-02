export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      crypto_daily_stats: {
        Row: {
          buy_transactions_count: number
          circulating_supply: number
          closing_price: number
          created_at: string
          cryptocurrency_id: string
          date: string
          highest_price: number
          holders_count: number
          id: string
          lowest_price: number
          market_cap: number
          opening_price: number
          price_change_percent: number
          sell_transactions_count: number
          total_supply: number
          transactions_count: number
          volume_24h: number
          volume_usd_24h: number
        }
        Insert: {
          buy_transactions_count?: number
          circulating_supply?: number
          closing_price?: number
          created_at?: string
          cryptocurrency_id: string
          date?: string
          highest_price?: number
          holders_count?: number
          id?: string
          lowest_price?: number
          market_cap?: number
          opening_price?: number
          price_change_percent?: number
          sell_transactions_count?: number
          total_supply?: number
          transactions_count?: number
          volume_24h?: number
          volume_usd_24h?: number
        }
        Update: {
          buy_transactions_count?: number
          circulating_supply?: number
          closing_price?: number
          created_at?: string
          cryptocurrency_id?: string
          date?: string
          highest_price?: number
          holders_count?: number
          id?: string
          lowest_price?: number
          market_cap?: number
          opening_price?: number
          price_change_percent?: number
          sell_transactions_count?: number
          total_supply?: number
          transactions_count?: number
          volume_24h?: number
          volume_usd_24h?: number
        }
        Relationships: [
          {
            foreignKeyName: "crypto_daily_stats_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_holders: {
        Row: {
          average_buy_price: number
          balance: number
          created_at: string
          cryptocurrency_id: string
          first_purchase_at: string
          id: string
          last_activity_at: string
          total_invested_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_buy_price?: number
          balance?: number
          created_at?: string
          cryptocurrency_id: string
          first_purchase_at?: string
          id?: string
          last_activity_at?: string
          total_invested_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_buy_price?: number
          balance?: number
          created_at?: string
          cryptocurrency_id?: string
          first_purchase_at?: string
          id?: string
          last_activity_at?: string
          total_invested_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_holders_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_reactions: {
        Row: {
          created_at: string
          cryptocurrency_id: string
          id: string
          reaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cryptocurrency_id: string
          id?: string
          reaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cryptocurrency_id?: string
          id?: string
          reaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cryptocurrencies: {
        Row: {
          created_at: string
          current_price: number | null
          description: string | null
          icon_url: string | null
          id: string
          last_trade_at: string | null
          market_cap: number | null
          name: string
          price_change_24h: number | null
          symbol: string
          telegram_url: string | null
          trade_count_24h: number | null
          twitter_url: string | null
          updated_at: string
          volume_24h: number | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          current_price?: number | null
          description?: string | null
          icon_url?: string | null
          id?: string
          last_trade_at?: string | null
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          symbol: string
          telegram_url?: string | null
          trade_count_24h?: number | null
          twitter_url?: string | null
          updated_at?: string
          volume_24h?: number | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          current_price?: number | null
          description?: string | null
          icon_url?: string | null
          id?: string
          last_trade_at?: string | null
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          symbol?: string
          telegram_url?: string | null
          trade_count_24h?: number | null
          twitter_url?: string | null
          updated_at?: string
          volume_24h?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      detailed_transactions: {
        Row: {
          amount: number
          block_number: number | null
          created_at: string
          cryptocurrency_id: string
          fee_amount: number
          fee_usd: number
          gas_used: number | null
          id: string
          price_per_token: number
          status: string
          ton_tx_hash: string | null
          total_value_usd: number
          transaction_index: number | null
          transaction_type: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          block_number?: number | null
          created_at?: string
          cryptocurrency_id: string
          fee_amount?: number
          fee_usd?: number
          gas_used?: number | null
          id?: string
          price_per_token: number
          status?: string
          ton_tx_hash?: string | null
          total_value_usd: number
          transaction_index?: number | null
          transaction_type: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          block_number?: number | null
          created_at?: string
          cryptocurrency_id?: string
          fee_amount?: number
          fee_usd?: number
          gas_used?: number | null
          id?: string
          price_per_token?: number
          status?: string
          ton_tx_hash?: string | null
          total_value_usd?: number
          transaction_index?: number | null
          transaction_type?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_transactions_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      market_metrics: {
        Row: {
          community_score: number | null
          cryptocurrency_id: string
          developer_activity_score: number | null
          fully_diluted_market_cap: number
          id: string
          liquidity_score: number | null
          market_cap: number
          price_to_earnings_ratio: number | null
          return_on_investment_24h: number | null
          return_on_investment_30d: number | null
          return_on_investment_7d: number | null
          social_sentiment_score: number | null
          timestamp: string
          total_value_locked: number
          volatility_index: number | null
          volume_to_market_cap_ratio: number | null
        }
        Insert: {
          community_score?: number | null
          cryptocurrency_id: string
          developer_activity_score?: number | null
          fully_diluted_market_cap?: number
          id?: string
          liquidity_score?: number | null
          market_cap?: number
          price_to_earnings_ratio?: number | null
          return_on_investment_24h?: number | null
          return_on_investment_30d?: number | null
          return_on_investment_7d?: number | null
          social_sentiment_score?: number | null
          timestamp?: string
          total_value_locked?: number
          volatility_index?: number | null
          volume_to_market_cap_ratio?: number | null
        }
        Update: {
          community_score?: number | null
          cryptocurrency_id?: string
          developer_activity_score?: number | null
          fully_diluted_market_cap?: number
          id?: string
          liquidity_score?: number | null
          market_cap?: number
          price_to_earnings_ratio?: number | null
          return_on_investment_24h?: number | null
          return_on_investment_30d?: number | null
          return_on_investment_7d?: number | null
          social_sentiment_score?: number | null
          timestamp?: string
          total_value_locked?: number
          volatility_index?: number | null
          volume_to_market_cap_ratio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_metrics_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_sessions: {
        Row: {
          created_at: string
          duration_hours: number
          end_time: string | null
          id: string
          is_active: boolean
          is_claimed: boolean
          is_completed: boolean
          reward_amount: number
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_hours?: number
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_claimed?: boolean
          is_completed?: boolean
          reward_amount?: number
          start_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_hours?: number
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_claimed?: boolean
          is_completed?: boolean
          reward_amount?: number
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          mission_type: string
          reward_amount: number
          reward_cryptocurrency_id: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          mission_type: string
          reward_amount: number
          reward_cryptocurrency_id: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          mission_type?: string
          reward_amount?: number
          reward_cryptocurrency_id?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_reward_cryptocurrency_id_fkey"
            columns: ["reward_cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      ownership_distribution: {
        Row: {
          created_at: string
          cryptocurrency_id: string
          date: string
          gini_coefficient: number | null
          id: string
          large_holders_count: number
          medium_holders_count: number
          small_holders_count: number
          top_10_holders_percentage: number
          top_100_holders_percentage: number
          whale_holders_count: number
          whale_percentage: number
        }
        Insert: {
          created_at?: string
          cryptocurrency_id: string
          date?: string
          gini_coefficient?: number | null
          id?: string
          large_holders_count?: number
          medium_holders_count?: number
          small_holders_count?: number
          top_10_holders_percentage?: number
          top_100_holders_percentage?: number
          whale_holders_count?: number
          whale_percentage?: number
        }
        Update: {
          created_at?: string
          cryptocurrency_id?: string
          date?: string
          gini_coefficient?: number | null
          id?: string
          large_holders_count?: number
          medium_holders_count?: number
          small_holders_count?: number
          top_10_holders_percentage?: number
          top_100_holders_percentage?: number
          whale_holders_count?: number
          whale_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "ownership_distribution_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          created_at: string
          cryptocurrency_id: string
          id: string
          new_price: number
          old_price: number
          price_change_percent: number
          transaction_type: string
          transaction_volume: number
        }
        Insert: {
          created_at?: string
          cryptocurrency_id: string
          id?: string
          new_price: number
          old_price: number
          price_change_percent?: number
          transaction_type: string
          transaction_volume?: number
        }
        Update: {
          created_at?: string
          cryptocurrency_id?: string
          id?: string
          new_price?: number
          old_price?: number
          price_change_percent?: number
          transaction_type?: string
          transaction_volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          ton_wallet_address: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          ton_wallet_address?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          ton_wallet_address?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          is_claimed: boolean | null
          referred_user_id: string
          referrer_user_id: string
          reward_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_claimed?: boolean | null
          referred_user_id: string
          referrer_user_id: string
          reward_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_claimed?: boolean | null
          referred_user_id?: string
          referrer_user_id?: string
          reward_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      trading_pairs: {
        Row: {
          base_currency_id: string
          created_at: string
          current_price: number | null
          id: string
          is_active: boolean | null
          price_change_24h: number | null
          quote_currency_id: string
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          base_currency_id: string
          created_at?: string
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          price_change_24h?: number | null
          quote_currency_id: string
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          base_currency_id?: string
          created_at?: string
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          price_change_24h?: number | null
          quote_currency_id?: string
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_pairs_base_currency_id_fkey"
            columns: ["base_currency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_pairs_quote_currency_id_fkey"
            columns: ["quote_currency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_volumes: {
        Row: {
          average_transaction_size: number
          buy_volume: number
          buy_volume_usd: number
          created_at: string
          cryptocurrency_id: string
          hour_timestamp: string
          id: string
          net_volume: number
          sell_volume: number
          sell_volume_usd: number
          transactions_count: number
          unique_traders: number
        }
        Insert: {
          average_transaction_size?: number
          buy_volume?: number
          buy_volume_usd?: number
          created_at?: string
          cryptocurrency_id: string
          hour_timestamp: string
          id?: string
          net_volume?: number
          sell_volume?: number
          sell_volume_usd?: number
          transactions_count?: number
          unique_traders?: number
        }
        Update: {
          average_transaction_size?: number
          buy_volume?: number
          buy_volume_usd?: number
          created_at?: string
          cryptocurrency_id?: string
          hour_timestamp?: string
          id?: string
          net_volume?: number
          sell_volume?: number
          sell_volume_usd?: number
          transactions_count?: number
          unique_traders?: number
        }
        Relationships: [
          {
            foreignKeyName: "trading_volumes_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          cryptocurrency_id: string
          id: string
          price_usd: number | null
          status: string
          ton_tx_hash: string | null
          total_usd: number | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          cryptocurrency_id: string
          id?: string
          price_usd?: number | null
          status?: string
          ton_tx_hash?: string | null
          total_usd?: number | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          cryptocurrency_id?: string
          id?: string
          price_usd?: number | null
          status?: string
          ton_tx_hash?: string | null
          total_usd?: number | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed_at: string
          id: string
          mission_id: string
          reward_claimed: boolean | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          mission_id: string
          reward_claimed?: boolean | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          mission_id?: string
          reward_claimed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          is_premium: boolean | null
          language_code: string | null
          last_name: string | null
          photo_url: string | null
          telegram_id: string
          telegram_username: string | null
          total_balance: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_premium?: boolean | null
          language_code?: string | null
          last_name?: string | null
          photo_url?: string | null
          telegram_id: string
          telegram_username?: string | null
          total_balance?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_premium?: boolean | null
          language_code?: string | null
          last_name?: string | null
          photo_url?: string | null
          telegram_id?: string
          telegram_username?: string | null
          total_balance?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wallet_holdings: {
        Row: {
          balance: number | null
          created_at: string
          cryptocurrency_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          cryptocurrency_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          cryptocurrency_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_holdings_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_crypto_reaction_counts: {
        Args: { crypto_id: string }
        Returns: {
          love_count: number
          fire_count: number
          broken_heart_count: number
        }[]
      }
      get_user_referral_stats: {
        Args: { p_user_id: string }
        Returns: {
          total_referrals: number
          total_earned: number
        }[]
      }
      register_referral: {
        Args: {
          p_referrer_identifier: string
          p_referred_user_id: string
          p_reward_amount?: number
        }
        Returns: boolean
      }
      toggle_crypto_reaction: {
        Args: { crypto_id: string; user_identifier: string; reaction: string }
        Returns: boolean
      }
      update_comprehensive_metrics: {
        Args: { crypto_id: string }
        Returns: boolean
      }
      update_crypto_price: {
        Args: { crypto_id: string; trade_volume: number; trade_type: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
