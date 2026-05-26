export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      entry_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          entry_id: string
          id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          entry_id: string
          id?: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          entry_id?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: 'entry_photos_entry_id_fkey'
            columns: ['entry_id']
            isOneToOne: false
            referencedRelation: 'journal_entries'
            referencedColumns: ['id']
          }
        ]
      }
      journal_entries: {
        Row: {
          created_at: string | null
          cuisine_type: string | null
          date_of_visit: string | null
          highlights: string | null
          id: string
          location: string | null
          price_range: string | null
          rating: number
          restaurant_name: string
          updated_at: string | null
          user_id: string
          would_return: string | null
        }
        Insert: {
          created_at?: string | null
          cuisine_type?: string | null
          date_of_visit?: string | null
          highlights?: string | null
          id?: string
          location?: string | null
          price_range?: string | null
          rating: number
          restaurant_name: string
          updated_at?: string | null
          user_id: string
          would_return?: string | null
        }
        Update: {
          created_at?: string | null
          cuisine_type?: string | null
          date_of_visit?: string | null
          highlights?: string | null
          id?: string
          location?: string | null
          price_range?: string | null
          rating?: number
          restaurant_name?: string
          updated_at?: string | null
          user_id?: string
          would_return?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type JournalEntry = Tables<'journal_entries'>
export type EntryPhoto = Tables<'entry_photos'>
export type Profile = Tables<'profiles'>
