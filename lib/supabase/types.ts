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
      people: {
        Row: {
          id: string
          name: string
          color: string
          default_nights: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          default_nights: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          default_nights?: number
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          starts_at: string
          ends_at: string | null
          event_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          starts_at: string
          ends_at?: string | null
          event_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          starts_at?: string
          ends_at?: string | null
          event_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          title: string
          description: string | null
          amount_cents: number
          paid_by: string
          category: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          amount_cents: number
          paid_by: string
          category?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          amount_cents?: number
          paid_by?: string
          category?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      expense_participants: {
        Row: {
          id: string
          expense_id: string
          person_id: string
          nights: number | null
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          person_id: string
          nights?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          person_id?: string
          nights?: number | null
          created_at?: string
        }
      }
      grocery_items: {
        Row: {
          id: string
          name: string
          category: string
          quantity: string | null
          requested_by: string | null
          is_checked: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string
          quantity?: string | null
          requested_by?: string | null
          is_checked?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          quantity?: string | null
          requested_by?: string | null
          is_checked?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          doc_type: string
          storage_path: string | null
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          doc_type: string
          storage_path?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          doc_type?: string
          storage_path?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      app_config: {
        Row: {
          id: number
          passcode_hash: string
          trip_name: string
          trip_start_date: string | null
          trip_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          passcode_hash: string
          trip_name?: string
          trip_start_date?: string | null
          trip_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          passcode_hash?: string
          trip_name?: string
          trip_start_date?: string | null
          trip_end_date?: string | null
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
