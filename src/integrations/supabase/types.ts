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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          id: string
          kid_id: string | null
          label: string
          user_id: string
          week: string
        }
        Insert: {
          created_at?: string
          id?: string
          kid_id?: string | null
          label: string
          user_id?: string
          week: string
        }
        Update: {
          created_at?: string
          id?: string
          kid_id?: string | null
          label?: string
          user_id?: string
          week?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_submissions: {
        Row: {
          camp_id: string | null
          created_at: string
          details: string
          id: string
          kind: string
          name: string
          source_url: string
          status: string
          user_id: string
        }
        Insert: {
          camp_id?: string | null
          created_at?: string
          details: string
          id?: string
          kind: string
          name: string
          source_url: string
          status?: string
          user_id?: string
        }
        Update: {
          camp_id?: string | null
          created_at?: string
          details?: string
          id?: string
          kind?: string
          name?: string
          source_url?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      commute_addresses: {
        Row: {
          address: string
          place_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          place_key: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          address?: string
          place_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commute_route_cache: {
        Row: {
          cache_key: string
          expires_at: string
          result: Json
          user_id: string
        }
        Insert: {
          cache_key: string
          expires_at: string
          result: Json
          user_id?: string
        }
        Update: {
          cache_key?: string
          expires_at?: string
          result?: Json
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          camp_id: string
          created_at: string
          kid_ids: string[]
          user_id: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          kid_ids?: string[]
          user_id?: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          kid_ids?: string[]
          user_id?: string
        }
        Relationships: []
      }
      households: {
        Row: {
          home_zip: string
          updated_at: string
          user_id: string
        }
        Insert: {
          home_zip: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          home_zip?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kids: {
        Row: {
          age: number
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          age?: number
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      planner_share_recipients: {
        Row: {
          created_at: string
          share_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          share_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          share_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_share_recipients_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "planner_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_shares: {
        Row: {
          created_at: string
          id: string
          kid_ids: string[]
          title: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kid_ids: string[]
          title: string
          token?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          kid_ids?: string[]
          title?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          camp_id: string
          created_at: string
          id: string
          kid_id: string
          user_id: string
          week: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          id?: string
          kid_id: string
          user_id?: string
          week: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          id?: string
          kid_id?: string
          user_id?: string
          week?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          created_at: string
          id: string
          label: string
          user_id: string
          zip: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          user_id?: string
          zip: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          user_id?: string
          zip?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_planner_share: { Args: { invite_token: string }; Returns: string }
      shared_planners: { Args: never; Returns: Json }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
