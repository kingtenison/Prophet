import * as React from 'react'
import { FileSpreadsheet, Database, BarChart3, LayoutDashboard, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: 'dataset' | 'chart' | 'dashboard' | 'upload' | React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

const iconMap: Record<string, React.ElementType> = {
  dataset: Database,
  chart: BarChart3,
  dashboard: LayoutDashboard,
  upload: Upload,
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const IconComponent = icon && typeof icon === 'string' ? iconMap[icon] : null

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {IconComponent && (
        <div className="p-4 rounded-full bg-secondary-100 text-secondary-400 mb-5">
          <IconComponent className="w-10 h-10" />
        </div>
      )}
      {typeof icon === 'object' && icon}

      <h3 className="text-xl font-display font-semibold text-secondary-900 mt-4 mb-2">
        {title}
      </h3>
      {description && (
        <p className="max-w-md text-secondary-500 leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}

export function DataTableEmpty({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon="dataset"
      title="No datasets yet"
      description="Upload your first CSV or Excel file to start building dashboards and visualising your data."
      action={
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          Upload Dataset
        </button>
      }
    />
  )
}

export function DashboardEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="dashboard"
      title="No dashboards yet"
      description="Create your first dashboard to organize and share your data visualisations."
      action={
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <LayoutDashboard className="w-4 h-4" />
          Create Dashboard
        </button>
      }
    />
  )
}
