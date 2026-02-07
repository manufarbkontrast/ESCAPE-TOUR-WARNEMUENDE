export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          amount_cents: number
          booking_code: string
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          id: string
          paid_at: string | null
          participant_count: number
          payment_intent_id: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: Database['public']['Enums']['booking_status'] | null
          team_name: string | null
          tour_id: string
          updated_at: string | null
          user_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          amount_cents: number
          booking_code: string
          contact_email: string
          contact_phone?: string | null
          id?: string
          participant_count?: number
          scheduled_date: string
          status?: Database['public']['Enums']['booking_status'] | null
          team_name?: string | null
          tour_id: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          booking_code?: string
          contact_email?: string
          status?: Database['public']['Enums']['booking_status'] | null
          team_name?: string | null
          payment_intent_id?: string | null
          paid_at?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          session_id: string
          verification_code: string
        }
        Insert: {
          data: Json
          id?: string
          session_id: string
          verification_code: string
        }
        Update: {
          data?: Json
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          booking_id: string
          completed_at: string | null
          created_at: string | null
          current_station_index: number | null
          device_info: Json | null
          hints_used: number | null
          id: string
          last_activity_at: string | null
          needs_sync: boolean | null
          offline_data: Json | null
          paused_at: string | null
          puzzles_skipped: number | null
          started_at: string | null
          status: Database['public']['Enums']['session_status'] | null
          team_name: string | null
          total_pause_seconds: number | null
          total_points: number | null
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          id?: string
          status?: Database['public']['Enums']['session_status'] | null
          team_name?: string | null
          tour_id: string
        }
        Update: {
          current_station_index?: number | null
          hints_used?: number | null
          last_activity_at?: string | null
          puzzles_skipped?: number | null
          started_at?: string | null
          status?: Database['public']['Enums']['session_status'] | null
          total_points?: number | null
          completed_at?: string | null
          paused_at?: string | null
          total_pause_seconds?: number | null
        }
        Relationships: []
      }
      hints: {
        Row: {
          available_after_seconds: number | null
          created_at: string | null
          hint_level: number
          id: string
          marks_as_skipped: boolean | null
          point_penalty: number | null
          puzzle_id: string
          text_de: string
          text_en: string | null
          time_bonus_penalty_percent: number | null
        }
        Insert: {
          hint_level: number
          id?: string
          puzzle_id: string
          text_de: string
        }
        Update: {
          text_de?: string
          text_en?: string | null
        }
        Relationships: []
      }
      puzzles: {
        Row: {
          answer_type: string
          answer_validation_mode: string | null
          ar_content: Json | null
          ar_marker_url: string | null
          audio_url: string | null
          base_points: number | null
          case_sensitive: boolean | null
          correct_answer: Json
          created_at: string | null
          difficulty: Database['public']['Enums']['difficulty']
          id: string
          image_url: string | null
          instruction_de: string | null
          instruction_en: string | null
          options: Json | null
          order_index: number | null
          puzzle_type: Database['public']['Enums']['puzzle_type']
          question_de: string
          question_en: string | null
          station_id: string
          time_bonus_enabled: boolean | null
          time_bonus_max_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          answer_type: string
          correct_answer: Json
          difficulty: Database['public']['Enums']['difficulty']
          puzzle_type: Database['public']['Enums']['puzzle_type']
          question_de: string
          station_id: string
        }
        Update: {
          question_de?: string
          instruction_de?: string | null
        }
        Relationships: []
      }
      stations: {
        Row: {
          ambient_sound: string | null
          background_audio_url: string | null
          completion_text_de: string | null
          completion_text_en: string | null
          created_at: string | null
          estimated_duration_minutes: number | null
          header_image_url: string | null
          id: string
          intro_text_de: string | null
          intro_text_en: string | null
          location: unknown
          location_name: string | null
          name_de: string
          name_en: string | null
          order_index: number
          radius_meters: number | null
          story_text_de: string | null
          story_text_en: string | null
          subtitle_de: string | null
          subtitle_en: string | null
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          location: unknown
          name_de: string
          order_index: number
          tour_id: string
        }
        Update: {
          name_de?: string
          intro_text_de?: string | null
          story_text_de?: string | null
        }
        Relationships: []
      }
      tours: {
        Row: {
          created_at: string | null
          description_de: string | null
          description_en: string | null
          distance_meters: number
          duration_minutes: number
          group_price_cents: number | null
          id: string
          is_active: boolean | null
          max_group_size: number | null
          meta_description: string | null
          meta_title: string | null
          min_age: number | null
          name_de: string
          name_en: string | null
          price_cents: number
          slug: string
          updated_at: string | null
          variant: Database['public']['Enums']['tour_variant']
        }
        Insert: {
          name_de: string
          price_cents: number
          slug: string
          variant: Database['public']['Enums']['tour_variant']
        }
        Update: {
          name_de?: string
          description_de?: string | null
          is_active?: boolean | null
        }
        Relationships: []
      }
    }
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
      difficulty: 'easy' | 'medium' | 'hard' | 'finale'
      puzzle_type:
        | 'count'
        | 'photo_search'
        | 'symbol_find'
        | 'combination'
        | 'ar_puzzle'
        | 'audio'
        | 'logic'
        | 'navigation'
        | 'document_analysis'
        | 'text_analysis'
      session_status: 'pending' | 'active' | 'paused' | 'completed' | 'expired'
      tour_variant: 'family' | 'adult'
    }
  }
}
