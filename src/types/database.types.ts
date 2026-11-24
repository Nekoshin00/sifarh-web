export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      licenses: {
        Row: {
          created_at: string
          encrypted_key: string
          id: string
          key_last4: string
          purchase_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_key: string
          id?: string
          key_last4: string
          purchase_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_key?: string
          id?: string
          key_last4?: string
          purchase_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_purchase_id_user_id_fkey"
            columns: ["purchase_id", "user_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          amount_cents: number
          created_at: string
          currency: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          amount_cents: number
          created_at?: string
          currency: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          payment_provider: string
          product_id: string
          provider_checkout_id: string | null
          provider_payment_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency: string
          id?: string
          paid_at?: string | null
          payment_provider: string
          product_id: string
          provider_checkout_id?: string | null
          provider_payment_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_provider?: string
          product_id?: string
          provider_checkout_id?: string | null
          provider_payment_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      claim_free_purchase: {
        Args: { p_product_slug: string }
        Returns: string
      }
      get_license_key: {
        Args: { p_purchase_id: string }
        Returns: string | null
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
