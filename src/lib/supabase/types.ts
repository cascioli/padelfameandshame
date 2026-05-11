export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          karma: number
          wins: number
          losses: number
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          karma?: number
          wins?: number
          losses?: number
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          username?: string
          karma?: number
          wins?: number
          losses?: number
          avatar_url?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          created_at: string
          winner_ids: string[]
          loser_ids: string[]
          score: string
          beer_debtor_id: string
          chronicle_text: string | null
          vibe: 'epic' | 'roast' | 'friendly'
        }
        Insert: {
          id?: string
          created_at?: string
          winner_ids: string[]
          loser_ids: string[]
          score: string
          beer_debtor_id: string
          chronicle_text?: string | null
          vibe: 'epic' | 'roast' | 'friendly'
        }
        Update: {
          chronicle_text?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      log_match_karma: {
        Args: {
          p_winner_ids: string[]
          p_loser_ids: string[]
          p_beer_debtor_id: string
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Vibe = 'epic' | 'roast' | 'friendly'
