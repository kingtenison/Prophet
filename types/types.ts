export type ColumnType = 'text' | 'number' | 'date' | 'boolean'

export interface ColumnMeta {
  name: string
  type: ColumnType
}

export interface Dataset {
  id: string
  user_id: string
  name: string
  file_path: string
  columns: ColumnMeta[]
  row_count: number
  created_at: string
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

export interface ChartFilter {
  column: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between'
  value: string | number | [number, number]
}

export interface WidgetConfig {
  x_col: string
  y_col: string
  aggregation?: AggregationType
  filters?: ChartFilter[]
  title?: string
  color?: string
  group_col?: string
}

export interface Widget {
  id: string
  dashboard_id: string
  dataset_id: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table'
  config: WidgetConfig
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  dataset?: Dataset
}

export interface Dashboard {
  id: string
  user_id: string
  title: string
  is_public: boolean
  layout: Record<string, { x: number; y: number; w: number; h: number }>
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  display_name: string
  created_at: string
}

// Extend Supabase Database types
import type { Database } from './supabase'

export type SupabaseDataset = Database['public']['Tables']['datasets']['Row']
export type SupabaseDashboard = Database['public']['Tables']['dashboards']['Row']
export type SupabaseWidget = Database['public']['Tables']['widgets']['Row']
