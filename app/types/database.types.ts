// Database type definitions
// TODO: Generate this file using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

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
      stanoffice_topics: {
        Row: {
          id: number
          title: string
          body: string
          image_url: string | null
          author_name: string | null
          is_anonymous: boolean
          show_id: boolean
          user_id_hash: string | null
          view_count: number
          comment_count: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          title: string
          body: string
          image_url?: string | null
          author_name?: string | null
          is_anonymous?: boolean
          show_id?: boolean
          user_id_hash?: string | null
          view_count?: number
          comment_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          title?: string
          body?: string
          image_url?: string | null
          author_name?: string | null
          is_anonymous?: boolean
          show_id?: boolean
          user_id_hash?: string | null
          view_count?: number
          comment_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      stanoffice_comments: {
        Row: {
          id: number
          topic_id: number
          body: string
          author_name: string | null
          is_anonymous: boolean
          user_id_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          topic_id: number
          body: string
          author_name?: string | null
          is_anonymous?: boolean
          user_id_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          topic_id?: number
          body?: string
          author_name?: string | null
          is_anonymous?: boolean
          user_id_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper types
export type Topic = Database['public']['Tables']['stanoffice_topics']['Row']
export type Comment = Database['public']['Tables']['stanoffice_comments']['Row']
export type TopicInsert = Database['public']['Tables']['stanoffice_topics']['Insert']
export type CommentInsert = Database['public']['Tables']['stanoffice_comments']['Insert']
