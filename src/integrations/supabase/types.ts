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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bank_transactions: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          balance: number | null
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          is_reconciled: boolean | null
          source: string | null
          tink_account_id: string | null
          tink_transaction_id: string | null
          transaction_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          balance?: number | null
          category?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          is_reconciled?: boolean | null
          source?: string | null
          tink_account_id?: string | null
          tink_transaction_id?: string | null
          transaction_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          balance?: number | null
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_reconciled?: boolean | null
          source?: string | null
          tink_account_id?: string | null
          tink_transaction_id?: string | null
          transaction_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_tink_account_id_fkey"
            columns: ["tink_account_id"]
            isOneToOne: false
            referencedRelation: "tink_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          bank_account: string | null
          company_name: string
          created_at: string
          currency: string | null
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          company_name?: string
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          company_name?: string
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string
          created_at: string
          customer_id: string
          customer_since: string
          email: string
          id: string
          last_purchase: string | null
          name: string
          outstanding_balance: number | null
          phone: string
          status: string
          total_purchases: number | null
          type: string
          updated_at: string
          vehicles_purchased: number | null
        }
        Insert: {
          address: string
          created_at?: string
          customer_id: string
          customer_since?: string
          email: string
          id?: string
          last_purchase?: string | null
          name: string
          outstanding_balance?: number | null
          phone: string
          status?: string
          total_purchases?: number | null
          type: string
          updated_at?: string
          vehicles_purchased?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          customer_id?: string
          customer_since?: string
          email?: string
          id?: string
          last_purchase?: string | null
          name?: string
          outstanding_balance?: number | null
          phone?: string
          status?: string
          total_purchases?: number | null
          type?: string
          updated_at?: string
          vehicles_purchased?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          expense_id: string
          id: string
          receipt_url: string | null
          tax_deductible: boolean | null
          updated_at: string
          vehicle_id: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          expense_id: string
          id?: string
          receipt_url?: string | null
          tax_deductible?: boolean | null
          updated_at?: string
          vehicle_id?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          expense_id?: string
          id?: string
          receipt_url?: string | null
          tax_deductible?: boolean | null
          updated_at?: string
          vehicle_id?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          actual_sale_price: number | null
          color: string | null
          created_at: string
          expected_sale_price: number | null
          id: string
          images_count: number | null
          inventory_id: string
          last_service_date: string | null
          location: string | null
          make: string
          mileage: number | null
          model: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          sale_date: string | null
          status: string
          tuv_expiry: string | null
          updated_at: string
          vin: string
          year: number
        }
        Insert: {
          actual_sale_price?: number | null
          color?: string | null
          created_at?: string
          expected_sale_price?: number | null
          id?: string
          images_count?: number | null
          inventory_id: string
          last_service_date?: string | null
          location?: string | null
          make: string
          mileage?: number | null
          model: string
          notes?: string | null
          purchase_date?: string
          purchase_price: number
          sale_date?: string | null
          status?: string
          tuv_expiry?: string | null
          updated_at?: string
          vin: string
          year: number
        }
        Update: {
          actual_sale_price?: number | null
          color?: string | null
          created_at?: string
          expected_sale_price?: number | null
          id?: string
          images_count?: number | null
          inventory_id?: string
          last_service_date?: string | null
          location?: string | null
          make?: string
          mileage?: number | null
          model?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          sale_date?: string | null
          status?: string
          tuv_expiry?: string | null
          updated_at?: string
          vin?: string
          year?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          updated_at: string
          vehicle_sale_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          updated_at?: string
          vehicle_sale_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          updated_at?: string
          vehicle_sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_vehicle_sale_id_fkey"
            columns: ["vehicle_sale_id"]
            isOneToOne: false
            referencedRelation: "vehicle_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tink_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: string | null
          balance: number | null
          created_at: string
          currency: string | null
          iban: string | null
          id: string
          last_synced_at: string | null
          status: string
          tink_account_id: string
          tink_user_id: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          created_at?: string
          currency?: string | null
          iban?: string | null
          id?: string
          last_synced_at?: string | null
          status?: string
          tink_account_id: string
          tink_user_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          created_at?: string
          currency?: string | null
          iban?: string | null
          id?: string
          last_synced_at?: string | null
          status?: string
          tink_account_id?: string
          tink_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tink_accounts_tink_user_id_fkey"
            columns: ["tink_user_id"]
            isOneToOne: false
            referencedRelation: "tink_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tink_users: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          refresh_token: string | null
          tink_user_id: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          refresh_token?: string | null
          tink_user_id: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          refresh_token?: string | null
          tink_user_id?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_order: number
          image_url: string
          inventory_id: string
          is_primary: boolean
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_order?: number
          image_url: string
          inventory_id: string
          is_primary?: boolean
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_order?: number
          image_url?: string
          inventory_id?: string
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_sales: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          profit: number
          purchase_price: number
          sale_date: string
          sale_id: string
          sale_price: number
          updated_at: string
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
          vin: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          profit: number
          purchase_price: number
          sale_date?: string
          sale_id: string
          sale_price: number
          updated_at?: string
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
          vin: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          profit?: number
          purchase_price?: number
          sale_date?: string
          sale_id?: string
          sale_price?: number
          updated_at?: string
          vehicle_make?: string
          vehicle_model?: string
          vehicle_year?: number
          vin?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee"
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
    Enums: {
      app_role: ["admin", "employee"],
    },
  },
} as const
