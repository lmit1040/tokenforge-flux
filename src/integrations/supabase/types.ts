export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      artist_photos: {
        Row: {
          artist_id: string
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          photo_url: string
        }
        Insert: {
          artist_id: string
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url: string
        }
        Update: {
          artist_id?: string
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_photos_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_profiles: {
        Row: {
          artist_name: string
          banner_image_url: string | null
          bio: string | null
          created_at: string | null
          genre: string | null
          id: string
          is_published: boolean | null
          location: string | null
          profile_image_url: string | null
          social_links: Json | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          artist_name: string
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          artist_name?: string
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      content: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          duration: number | null
          file_size: number | null
          file_url: string
          id: string
          likes: number | null
          plays: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          likes?: number | null
          plays?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          likes?: number | null
          plays?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      content_earnings: {
        Row: {
          content_id: string
          created_at: string
          creator_id: string
          id: string
          total_earned: number | null
          total_plays: number | null
          updated_at: string
        }
        Insert: {
          content_id: string
          created_at?: string
          creator_id: string
          id?: string
          total_earned?: number | null
          total_plays?: number | null
          updated_at?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          total_earned?: number | null
          total_plays?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_earnings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_nfts: {
        Row: {
          chain_id: number | null
          content_id: string
          contract_address: string | null
          created_at: string
          id: string
          is_minted: boolean | null
          metadata_uri: string | null
          mint_transaction_hash: string | null
          royalty_percentage: number | null
          token_id: string | null
          updated_at: string
        }
        Insert: {
          chain_id?: number | null
          content_id: string
          contract_address?: string | null
          created_at?: string
          id?: string
          is_minted?: boolean | null
          metadata_uri?: string | null
          mint_transaction_hash?: string | null
          royalty_percentage?: number | null
          token_id?: string | null
          updated_at?: string
        }
        Update: {
          chain_id?: number | null
          content_id?: string
          contract_address?: string | null
          created_at?: string
          id?: string
          is_minted?: boolean | null
          metadata_uri?: string | null
          mint_transaction_hash?: string | null
          royalty_percentage?: number | null
          token_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_nfts_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_subscriptions: {
        Row: {
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          subscriber_id: string
          subscription_type: string
          token_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          subscriber_id: string
          subscription_type?: string
          token_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          subscriber_id?: string
          subscription_type?: string
          token_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchandise: {
        Row: {
          artist_id: string
          category: string
          created_at: string | null
          description: string | null
          download_url: string | null
          id: string
          image_url: string | null
          inventory_count: number | null
          is_active: boolean | null
          is_digital: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          category: string
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_digital?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_digital?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchandise_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      network_tokens: {
        Row: {
          chain_id: number
          created_at: string
          id: string
          is_active: boolean | null
          network_name: string
          reward_multiplier: number | null
          token_address: string | null
          token_symbol: string
        }
        Insert: {
          chain_id: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          network_name: string
          reward_multiplier?: number | null
          token_address?: string | null
          token_symbol: string
        }
        Update: {
          chain_id?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          network_name?: string
          reward_multiplier?: number | null
          token_address?: string | null
          token_symbol?: string
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_earnings: {
        Row: {
          created_at: string
          creator_amount: number
          fee_percentage: number
          id: string
          platform_fee_amount: number
          transaction_hash: string | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          creator_amount: number
          fee_percentage: number
          id?: string
          platform_fee_amount: number
          transaction_hash?: string | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          creator_amount?: number
          fee_percentage?: number
          id?: string
          platform_fee_amount?: number
          transaction_hash?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_earnings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "streaming_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          total_tokens_earned: number | null
          updated_at: string | null
          user_type: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          total_tokens_earned?: number | null
          updated_at?: string | null
          user_type?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          total_tokens_earned?: number | null
          updated_at?: string | null
          user_type?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      staking_rewards: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          reward_amount: number
          staked_amount: number
          staking_duration_days: number
          unstaked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          reward_amount: number
          staked_amount: number
          staking_duration_days: number
          unstaked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          reward_amount?: number
          staked_amount?: number
          staking_duration_days?: number
          unstaked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaming_rewards: {
        Row: {
          content_id: string
          created_at: string
          creator_id: string
          id: string
          reward_type: string
          token_amount: number
          transaction_hash: string | null
          viewer_id: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          creator_id: string
          id?: string
          reward_type: string
          token_amount: number
          transaction_hash?: string | null
          viewer_id?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          reward_type?: string
          token_amount?: number
          transaction_hash?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streaming_rewards_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          created_at: string
          current_balance: number | null
          id: string
          total_earned: number | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          current_balance?: number | null
          id?: string
          total_earned?: number | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          current_balance?: number | null
          id?: string
          total_earned?: number | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
