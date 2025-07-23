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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      crypto_reactions: {
        Row: {
          created_at: string | null
          cryptocurrency_id: string
          id: string
          reaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cryptocurrency_id: string
          id?: string
          reaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cryptocurrency_id?: string
          id?: string
          reaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_reactions_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      cryptocurrencies: {
        Row: {
          created_at: string | null
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
          updated_at: string | null
          volume_24h: number | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
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
          updated_at?: string | null
          volume_24h?: number | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
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
          updated_at?: string | null
          volume_24h?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      giveaway_participants: {
        Row: {
          created_at: string | null
          entry_fee_paid: number
          giveaway_id: string
          id: string
          joined_at: string | null
          ton_tx_hash: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_fee_paid: number
          giveaway_id: string
          id?: string
          joined_at?: string | null
          ton_tx_hash?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_fee_paid?: number
          giveaway_id?: string
          id?: string
          joined_at?: string | null
          ton_tx_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_participants_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaways: {
        Row: {
          created_at: string | null
          current_participants: number | null
          description: string | null
          end_time: string
          entry_fee_ton: number
          id: string
          is_active: boolean | null
          is_finished: boolean | null
          is_free: boolean | null
          max_participants: number | null
          prize_image_url: string
          prize_value_ton: number
          start_time: string
          title: string
          total_pool_ton: number | null
          updated_at: string | null
          winner_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_time: string
          entry_fee_ton: number
          id?: string
          is_active?: boolean | null
          is_finished?: boolean | null
          is_free?: boolean | null
          max_participants?: number | null
          prize_image_url: string
          prize_value_ton: number
          start_time?: string
          title: string
          total_pool_ton?: number | null
          updated_at?: string | null
          winner_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_time?: string
          entry_fee_ton?: number
          id?: string
          is_active?: boolean | null
          is_finished?: boolean | null
          is_free?: boolean | null
          max_participants?: number | null
          prize_image_url?: string
          prize_value_ton?: number
          start_time?: string
          title?: string
          total_pool_ton?: number | null
          updated_at?: string | null
          winner_user_id?: string | null
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          created_at: string | null
          duration_hours: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          is_claimed: boolean | null
          is_completed: boolean | null
          reward_amount: number | null
          start_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          is_claimed?: boolean | null
          is_completed?: boolean | null
          reward_amount?: number | null
          start_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          is_claimed?: boolean | null
          is_completed?: boolean | null
          reward_amount?: number | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          mission_type: string
          reward_amount: number
          reward_cryptocurrency_id: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          mission_type: string
          reward_amount: number
          reward_cryptocurrency_id: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          mission_type?: string
          reward_amount?: number
          reward_cryptocurrency_id?: string
          title?: string
          updated_at?: string | null
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
      nft_collections: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          mining_power: number | null
          name: string
          rarity: string | null
          remaining_supply: number | null
          total_supply: number | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mining_power?: number | null
          name: string
          rarity?: string | null
          remaining_supply?: number | null
          total_supply?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mining_power?: number | null
          name?: string
          rarity?: string | null
          remaining_supply?: number | null
          total_supply?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          is_claimed: boolean | null
          referred_user_id: string
          referrer_user_id: string
          reward_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_claimed?: boolean | null
          referred_user_id: string
          referrer_user_id: string
          reward_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_claimed?: boolean | null
          referred_user_id?: string
          referrer_user_id?: string
          reward_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      servers: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number
          icon_url: string | null
          id: string
          is_active: boolean | null
          mining_power: number
          name: string
          price_ton: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          mining_power?: number
          name: string
          price_ton: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          mining_power?: number
          name?: string
          price_ton?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          cryptocurrency_id: string
          id: string
          price_usd: number | null
          status: string | null
          ton_tx_hash: string | null
          total_usd: number | null
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          cryptocurrency_id: string
          id?: string
          price_usd?: number | null
          status?: string | null
          ton_tx_hash?: string | null
          total_usd?: number | null
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          cryptocurrency_id?: string
          id?: string
          price_usd?: number | null
          status?: string | null
          ton_tx_hash?: string | null
          total_usd?: number | null
          transaction_type?: string
          updated_at?: string | null
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
          completed_at: string | null
          id: string
          mission_id: string
          reward_claimed: boolean | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          mission_id: string
          reward_claimed?: boolean | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
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
      user_nfts: {
        Row: {
          created_at: string | null
          id: string
          mining_power: number | null
          nft_id: string
          purchase_price: number
          purchased_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mining_power?: number | null
          nft_id: string
          purchase_price: number
          purchased_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mining_power?: number | null
          nft_id?: string
          purchase_price?: number
          purchased_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nfts_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_servers: {
        Row: {
          created_at: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          mining_power: number
          purchase_price: number
          server_id: string
          start_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          mining_power: number
          purchase_price: number
          server_id: string
          start_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          mining_power?: number
          purchase_price?: number
          server_id?: string
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_servers_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
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
          created_at: string | null
          cryptocurrency_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          cryptocurrency_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          cryptocurrency_id?: string
          id?: string
          updated_at?: string | null
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
      finish_expired_giveaways: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
