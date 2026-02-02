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
      audit_logs: {
        Row: {
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      employees: {
        Row: {
          id: string
          user_id: string | null
          role: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          hire_date: string
          position: string | null
          department: string | null
          base_salary: number | null
          commission_rate: number | null
          is_active: boolean
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          role: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          hire_date?: string
          position?: string | null
          department?: string | null
          base_salary?: number | null
          commission_rate?: number | null
          is_active?: boolean
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          role?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          hire_date?: string
          position?: string | null
          department?: string | null
          base_salary?: number | null
          commission_rate?: number | null
          is_active?: boolean
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_obligations: {
        Row: {
          created_at: string | null
          creditor_name: string
          due_date: string | null
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          notes: string | null
          obligation_type: string
          outstanding_balance: number
          principal_amount: number
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creditor_name: string
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          notes?: string | null
          obligation_type: string
          outstanding_balance: number
          principal_amount: number
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creditor_name?: string
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          notes?: string | null
          obligation_type?: string
          outstanding_balance?: number
          principal_amount?: number
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      purchase_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          vehicle_purchase_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          vehicle_purchase_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          vehicle_purchase_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_payments_vehicle_purchase_id_fkey"
            columns: ["vehicle_purchase_id"]
            isOneToOne: false
            referencedRelation: "vehicle_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      service_records: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string
          id: string
          inventory_id: string | null
          invoice_url: string | null
          mileage_at_service: number | null
          next_service_date: string | null
          next_service_mileage: number | null
          service_date: string
          service_type: string
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description: string
          id?: string
          inventory_id?: string | null
          invoice_url?: string | null
          mileage_at_service?: number | null
          next_service_date?: string | null
          next_service_mileage?: number | null
          service_date: string
          service_type: string
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string
          id?: string
          inventory_id?: string | null
          invoice_url?: string | null
          mileage_at_service?: number | null
          next_service_date?: string | null
          next_service_mileage?: number | null
          service_date?: string
          service_type?: string
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_records_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_integrations: {
        Row: {
          api_key: string | null
          consultant_id: string | null
          created_at: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          sync_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          consultant_id?: string | null
          created_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          consultant_id?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
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
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
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
      vehicle_purchases: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          id: string
          inventory_id: string | null
          notes: string | null
          outstanding_balance: number
          payment_due_date: string
          payment_method: string | null
          payment_status: string | null
          payment_terms_days: number | null
          purchase_date: string
          purchase_price: number
          seller_address: string | null
          seller_contact: string | null
          seller_name: string
          seller_type: string
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          outstanding_balance: number
          payment_due_date: string
          payment_method?: string | null
          payment_status?: string | null
          payment_terms_days?: number | null
          purchase_date?: string
          purchase_price: number
          seller_address?: string | null
          seller_contact?: string | null
          seller_name: string
          seller_type: string
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          outstanding_balance?: number
          payment_due_date?: string
          payment_method?: string | null
          payment_status?: string | null
          payment_terms_days?: number | null
          purchase_date?: string
          purchase_price?: number
          seller_address?: string | null
          seller_contact?: string | null
          seller_name?: string
          seller_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_purchases_inventory_id_fkey"
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
      app_role: "owner" | "manager" | "sales_manager" | "salesperson" | "accountant" | "hr_manager" | "inventory_manager" | "service_advisor" | "admin" | "employee"
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
      app_role: ["owner", "manager", "sales_manager", "salesperson", "accountant", "hr_manager", "inventory_manager", "service_advisor", "admin", "employee"],
    },
  },
} as const

// ============================================================================
// ADDITIONAL TABLES FROM MIGRATIONS
// ============================================================================

export type EmployeeAttendance = {
  id: string
  employee_id: string
  date: string
  check_in_time: string
  check_out_time: string | null
  status: 'present' | 'absent' | 'leave'
  notes: string | null
  created_at: string
  updated_at: string
}

export type EmployeeLeaves = {
  id: string
  employee_id: string
  leave_type: 'sick' | 'vacation' | 'personal' | 'unpaid'
  start_date: string
  end_date: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  approval_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type SalesPipeline = {
  id: string
  dealership_id: string | null
  vehicle_id: string | null
  customer_id: string | null
  salesperson_id: string | null
  stage: string
  lead_source: string | null
  deal_value: number | null
  probability_percentage: number | null
  expected_close_date: string | null
  notes: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
}

export type Leads = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  lead_source: string | null
  status: string
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year_from: number | null
  vehicle_year_to: number | null
  budget_min: number | null
  budget_max: number | null
  assigned_to: string | null
  notes: string | null
  last_contact_date: string | null
  created_at: string
  updated_at: string
}

export type EmployeePerformance = {
  id: string
  employee_id: string
  metric_date: string
  metric_type: string
  vehicles_sold: number
  total_sales_value: number
  commission_earned: number
  leads_generated: number
  leads_contacted: number
  conversion_rate: number | null
  test_drives: number
  customer_satisfaction_rating: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Commissions = {
  id: string
  employee_id: string
  vehicle_sale_id: string | null
  commission_rate: number
  commission_base_amount: number
  commission_amount: number
  sale_date: string
  payment_status: string
  payment_date: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CustomerFinancing = {
  id: string
  vehicle_sale_id: string
  customer_id: string | null
  financing_type: string
  total_amount: number
  down_payment: number
  loan_amount: number | null
  monthly_payment: number | null
  interest_rate: number
  interest_type: string | null
  loan_term_months: number | null
  start_date: string
  end_date: string | null
  status: string
  payments_made: number
  next_payment_date: string | null
  last_payment_date: string | null
  finance_company: string | null
  contract_number: string | null
  created_at: string
  updated_at: string
}

export type FinancingPayments = {
  id: string
  financing_id: string
  payment_amount: number
  payment_date: string
  payment_method: string | null
  reference_id: string | null
  notes: string | null
  created_at: string
}

export type TestDrives = {
  id: string
  vehicle_id: string
  customer_id: string
  salesperson_id: string | null
  scheduled_date: string
  actual_start_date: string | null
  actual_end_date: string | null
  status: string
  odometer_before: number | null
  odometer_after: number | null
  result: string | null
  customer_notes: string | null
  salesperson_notes: string | null
  created_at: string
  updated_at: string
}

export type MarketPrices = {
  id: string
  make: string
  model: string
  year: number
  avg_price: number | null
  min_price: number | null
  max_price: number | null
  median_price: number | null
  inventory_count: number | null
  days_on_market: number | null
  source: string | null
  condition: string | null
  mileage_km: number | null
  fuel_type: string | null
  transmission: string | null
  last_updated: string
  created_at: string
}

export type QRCodes = {
  id: string
  vehicle_id: string
  qr_code_url: string | null
  qr_code_data: Record<string, unknown> | null
  qr_image_base64: string | null
  created_at: string
  updated_at: string
}

export type VehicleTracking = {
  id: string
  vehicle_id: string
  current_status: string
  location_lot: string | null
  location_building: string | null
  received_date: string
  expected_sale_date: string | null
  last_status_change: string
  days_in_stock: number
  marketing_start_date: string | null
  created_at: string
  updated_at: string
}

export type AuditLogsEnhanced = {
  id: string
  user_id: string | null
  employee_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  change_reason: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type CommunicationHistory = {
  id: string
  customer_id: string
  employee_id: string | null
  channel: string
  message: string | null
  message_direction: string | null
  status: string
  external_id: string | null
  subject: string | null
  attachments: unknown
  created_at: string
}

export type RolePermissions = {
  id: string
  role: string
  resource: string
  action: string
  granted: boolean | null
  conditions: Record<string, unknown> | null
  created_at: string
}

export type CashAdvances = {
  id: string
  employee_id: string
  amount: number
  purpose: string | null
  status: string
  requested_date: string
  approved_date: string | null
  repayment_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
