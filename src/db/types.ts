export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          zip: string | null
          country: string | null
          company_name: string | null
          company_logo: string | null
          signature: string | null
          business_type: string | null
          tax_number: string | null
          bank_name: string | null
          account_name: string | null
          account_number: string | null
          swift_code: string | null
          iban: string | null
          preferred_currency: string | null
          is_profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          zip?: string | null
          country?: string | null
          company_name?: string | null
          company_logo?: string | null
          signature?: string | null
          business_type?: string | null
          tax_number?: string | null
          bank_name?: string | null
          account_name?: string | null
          account_number?: string | null
          swift_code?: string | null
          iban?: string | null
          preferred_currency?: string | null
          is_profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          zip?: string | null
          country?: string | null
          company_name?: string | null
          company_logo?: string | null
          signature?: string | null
          business_type?: string | null
          tax_number?: string | null
          bank_name?: string | null
          account_name?: string | null
          account_number?: string | null
          swift_code?: string | null
          iban?: string | null
          preferred_currency?: string | null
          is_profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          province: string | null
          zip: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          zip?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          zip?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          invoice_number: string
          customer_id: string | null
          issue_date: string
          due_date: string
          status: string
          currency: string
          subtotal: number
          tax_rate: number | null
          tax_amount: number | null
          discount_rate: number | null
          discount_amount: number | null
          shipping_amount: number | null
          total_amount: number
          notes: string | null
          payment_terms: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_number: string
          customer_id?: string | null
          issue_date: string
          due_date: string
          status?: string
          currency?: string
          subtotal?: number
          tax_rate?: number | null
          tax_amount?: number | null
          discount_rate?: number | null
          discount_amount?: number | null
          shipping_amount?: number | null
          total_amount?: number
          notes?: string | null
          payment_terms?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_number?: string
          customer_id?: string | null
          issue_date?: string
          due_date?: string
          status?: string
          currency?: string
          subtotal?: number
          tax_rate?: number | null
          tax_amount?: number | null
          discount_rate?: number | null
          discount_amount?: number | null
          shipping_amount?: number | null
          total_amount?: number
          notes?: string | null
          payment_terms?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price?: number
          amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
