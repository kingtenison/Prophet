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
          display_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          display_name?: string | null
        }
        Relationships: []
      }
      datasets: {
        Row: {
          id: string
          user_id: string
          name: string
          file_path: string
          columns: Json
          row_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          file_path: string
          columns: Json
          row_count?: number
          created_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          file_path?: string
          columns?: Json
          row_count?: number
        }
        Relationships: [
          { foreignKeyName: 'datasets_user_id_fkey', columns: ['user_id'], isOneToOne: false }
        ]
      }
      dashboards: {
        Row: {
          id: string
          user_id: string
          title: string
          is_public: boolean
          layout: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          is_public?: boolean
          layout?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          title?: string
          is_public?: boolean
          layout?: Json
        }
        Relationships: [
          { foreignKeyName: 'dashboards_user_id_fkey', columns: ['user_id'], isOneToOne: false }
        ]
      }
      widgets: {
        Row: {
          id: string
          dashboard_id: string
          dataset_id: string
          type: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table'
          config: Json
          position: Json
          created_at: string
        }
        Insert: {
          id?: string
          dashboard_id: string
          dataset_id: string
          type: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table'
          config?: Json
          position?: Json
          created_at?: string
        }
        Update: {
          dashboard_id?: string
          dataset_id?: string
          type?: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table'
          config?: Json
          position?: Json
        }
        Relationships: [
          { foreignKeyName: 'widgets_dashboard_id_fkey', columns: ['dashboard_id'], isOneToOne: false },
          { foreignKeyName: 'widgets_dataset_id_fkey', columns: ['dataset_id'], isOneToOne: false }
        ]
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
