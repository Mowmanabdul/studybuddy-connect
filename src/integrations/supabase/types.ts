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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          user_type?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          user_type?: string
        }
        Relationships: []
      }
      diagnostic_answers: {
        Row: {
          answered_at: string
          attempt_id: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_option_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_attempts: {
        Row: {
          completed_at: string | null
          id: string
          score: number | null
          started_at: string
          status: string
          test_id: string
          time_spent_seconds: number | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          status?: string
          test_id: string
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          status?: string
          test_id?: string
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_questions: {
        Row: {
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          options: Json
          order_index: number
          question_text: string
          test_id: string
          topic: string
        }
        Insert: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          options: Json
          order_index?: number
          question_text: string
          test_id: string
          topic: string
        }
        Update: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          question_text?: string
          test_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_recommendations: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          overall_analysis: string
          recommendations: Json
          strengths: Json
          study_plan: string | null
          weaknesses: Json
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          overall_analysis: string
          recommendations?: Json
          strengths?: Json
          study_plan?: string | null
          weaknesses?: Json
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          overall_analysis?: string
          recommendations?: Json
          strengths?: Json
          study_plan?: string | null
          weaknesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_recommendations_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_tests: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          grade: string
          id: string
          subject: string
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          grade: string
          id?: string
          subject: string
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          grade?: string
          id?: string
          subject?: string
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      learning_goals: {
        Row: {
          created_at: string
          id: string
          subject: string
          target_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject: string
          target_percentage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject?: string
          target_percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          first_name: string
          grade: string | null
          id: string
          last_name: string
          subjects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name: string
          grade?: string | null
          id?: string
          last_name: string
          subjects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string
          grade?: string | null
          id?: string
          last_name?: string
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answered_at: string
          correct_option: string
          id: string
          is_correct: boolean
          question_index: number
          selected_option: string
          session_id: string
        }
        Insert: {
          answered_at?: string
          correct_option: string
          id?: string
          is_correct: boolean
          question_index: number
          selected_option: string
          session_id: string
        }
        Update: {
          answered_at?: string
          correct_option?: string
          id?: string
          is_correct?: boolean
          question_index?: number
          selected_option?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          difficulty: string
          grade: string
          id: string
          questions: Json
          score: number | null
          status: string
          subject: string
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          difficulty?: string
          grade: string
          id?: string
          questions?: Json
          score?: number | null
          status?: string
          subject: string
          total_questions?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          difficulty?: string
          grade?: string
          id?: string
          questions?: Json
          score?: number | null
          status?: string
          subject?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          learner_id: string
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["session_status"]
          subject: string
          tutor_id: string
          tutor_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          learner_id: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["session_status"]
          subject: string
          tutor_id: string
          tutor_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          learner_id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          subject?: string
          tutor_id?: string
          tutor_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tutor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          subject: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          subject: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          subject?: string
          tutor_id?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "learner" | "tutor" | "admin"
      difficulty_level: "easy" | "medium" | "hard"
      session_status: "pending" | "confirmed" | "completed" | "cancelled"
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
      app_role: ["learner", "tutor", "admin"],
      difficulty_level: ["easy", "medium", "hard"],
      session_status: ["pending", "confirmed", "completed", "cancelled"],
    },
  },
} as const
