'use client'

import { Widget, Dashboard } from '@/types'
import { Card } from '@/components/ui/Card'
import { DashboardWidget } from '@/components/DashboardWidget'
import { InsightsPanel } from '@/components/InsightsPanel'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { BarChart3 } from 'lucide-react'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface DashboardViewClientProps {
  dashboard: Dashboard
  widgets: Widget[]
}

export default function DashboardViewClient({
  dashboard,
  widgets
}: DashboardViewClientProps) {
  if (widgets.length === 0) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 text-secondary-200 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-secondary-600">Empty dashboard</h3>
        <p className="text-secondary-400 mt-1">This dashboard has no widgets yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold text-secondary-900 leading-tight">
          {dashboard.title}
        </h1>
        <p className="text-secondary-500 mt-2">
          {widgets.length} visualisation{widgets.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ResponsiveGridLayout
        className="layout -mx-4"
        layouts={{
          lg: widgets.map(w => ({
            i: w.id,
            x: w.position?.x || 0,
            y: w.position?.y || 0,
            w: w.position?.w || 4,
            h: w.position?.h || 3,
            static: true
          }))
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={120}
        isDraggable={false}
        isResizable={false}
        margin={[24, 24]}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="h-full group">
            <Card className="p-5 h-full flex flex-col shadow-soft hover:shadow-lg transition-shadow border-secondary-200/60 bg-white overflow-hidden">
              {(widget.config.title || widget.type !== 'kpi') && (
                <div className="mb-4 flex-shrink-0">
                  <h3 className="font-display font-semibold text-secondary-900 truncate">
                    {widget.config.title || `${widget.type.charAt(0).toUpperCase()}${widget.type.slice(1)} Chart`}
                  </h3>
                  {widget.dataset && (
                    <p className="text-[10px] text-secondary-400 uppercase tracking-wider font-medium mt-0.5">
                      {(widget.dataset as any).name}
                    </p>
                  )}
                </div>
              )}

              <div className="flex-1 min-h-0 relative">
                <DashboardWidget widget={widget} />
              </div>
            </Card>
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* AI Insights Section */}
      {widgets.filter(w => w.config?.x_col && w.config?.y_col).length > 0 && (
        <div className="mt-12 pt-12 border-t border-secondary-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-secondary-200" />
            <span className="text-xs font-bold text-secondary-400 uppercase tracking-[0.2em] px-4">
              AI-Powered Insights
            </span>
            <div className="h-px flex-1 bg-secondary-200" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {widgets.filter(w => w.config?.x_col && w.config?.y_col).map(w => {
              const ds = w.dataset as any
              if (!ds) return null
              return (
                <InsightsPanel
                  key={`insight-${w.id}`}
                  dataset={ds}
                  xCol={w.config.x_col}
                  yCol={w.config.y_col}
                  title={w.config.title}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
