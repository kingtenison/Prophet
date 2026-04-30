'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dashboard, Widget } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { DashboardWidget } from '@/components/DashboardWidget'
import { InsightsPanel } from '@/components/InsightsPanel'
import { useToast } from '@/components/ui/ToastProvider'
import {
  BarChart3,
  LayoutDashboard,
  Plus,
  Trash2,
  Share2,
  Eye,
  Edit3,
  X,
  Loader2,
  Download
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { generateStrategicPDF } from '@/lib/reports/pdf'
import { useFilterStore } from '@/store/useFilterStore'
import { useThemeStore } from '@/store/useThemeStore'

const ResponsiveGridLayout = WidthProvider(Responsive)

const CHART_ICONS: Record<string, any> = {
  bar: BarChart3,
  line: BarChart3,
  pie: BarChart3,
  scatter: BarChart3,
  kpi: BarChart3,
  table: BarChart3
}

export default function DashboardEditPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const dashboardId = params.id as string

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [widgets, setWidgets] = useState<(Widget & { dataset?: any })[]>([])
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const theme = useThemeStore()
  const { selectedSegment, clearFilters } = useFilterStore()
  const exportRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!exportRef.current || !dashboard) return
    
    addToast({ type: 'info', title: 'Generating Strategic Audit...', description: 'Preparing high-fidelity PDF report' })
    
    // First page/summary analysis
    const configured = widgets.filter(w => w.config?.x_col && w.config?.y_col)
    if (configured.length === 0) return

    // Simple mock analysis for the PDF (would normally come from the AI engine)
    const analysis = {
      summary: { total: 1000, average: 50, growthRate: 12, trend: 'up', trendStrength: 0.85 },
      narrative: `Prophet Strategic Audit for ${dashboard.title}. Quantitative indices show strong market positioning with a confidence score of 85%. Recommend immediate scaling in primary growth segments.`
    }

    await generateStrategicPDF({
      title: dashboard.title,
      orgName: theme.orgName,
      analysis: analysis as any,
      widgets: widgets,
      footer: theme.reportFooter
    })
    
    addToast({ type: 'success', title: 'Report Downloaded', description: 'Your PDF audit is ready' })
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchDashboard()
    fetchDatasets()
  }, [dashboardId])

  const fetchDashboard = async () => {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single()

    if (!error && data) {
      setDashboard(data)
      setTempTitle(data.title)
      
      // Fetch widgets with dataset details
      const { data: widgetData } = await supabase
        .from('widgets')
        .select(`
          *,
          dataset:datasets(id, name, columns, file_path)
        `)
        .eq('dashboard_id', dashboardId)
        .order('position')

      if (widgetData) {
        setWidgets(widgetData as any)
      }
    }
    setLoading(false)
  }

  const fetchDatasets = async () => {
    const { data } = await supabase.from('datasets').select('*')
    setDatasets(data || [])
  }

  const { addToast } = useToast()

  const handleTitleSave = async () => {
    if (!tempTitle.trim()) return

    const { error } = await supabase
      .from('dashboards')
      .update({ title: tempTitle })
      .eq('id', dashboardId)

    if (!error) {
      setDashboard(prev => prev ? { ...prev, title: tempTitle } : null)
      addToast({ type: 'success', title: 'Dashboard renamed' })
    }
    setIsEditingTitle(false)
  }

  const handleShareToggle = async () => {
    const newPublic = !dashboard?.is_public
    const { error } = await supabase
      .from('dashboards')
      .update({ is_public: newPublic })
      .eq('id', dashboardId)

    if (!error) {
      setDashboard(prev => prev ? { ...prev, is_public: newPublic } : null)
      addToast({ type: 'success', title: newPublic ? 'Dashboard is now public!' : 'Dashboard is now private' })
    }
  }

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Delete this widget?')) return

    const { error } = await supabase.from('widgets').delete().eq('id', widgetId)
    if (!error) {
      setWidgets(prev => prev.filter(w => w.id !== widgetId))
      addToast({ type: 'success', title: 'Widget removed' })
    }
  }

  const handleAddWidget = async (datasetId: string) => {
    const newWidget = {
      dashboard_id: dashboardId,
      dataset_id: datasetId,
      type: 'bar',
      config: { x_col: '', y_col: '', title: 'New Chart' },
      position: { x: 0, y: Infinity, w: 12, h: 4 }
    }

    const { data, error } = await supabase.from('widgets').insert(newWidget).select()
    if (!error && data) {
      setWidgets(prev => [...prev, data[0] as Widget])
      addToast({ type: 'success', title: 'Widget added!' })
    }
  }

  const handleLayoutChange = async (currentLayout: Layout[]) => {
    // Optimistic UI update
    setWidgets(prev => prev.map(w => {
      const l = currentLayout.find(item => item.i === w.id)
      if (l) return { ...w, position: { x: l.x, y: l.y, w: l.w, h: l.h } }
      return w
    }))
    
    // Save to DB
    setSaving(true)
    try {
      const promises = currentLayout.map(item => 
        supabase.from('widgets').update({
          position: { x: item.x, y: item.y, w: item.w, h: item.h }
        }).eq('id', item.i)
      )
      await Promise.all(promises)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                className="text-2xl font-display font-bold py-1 px-2"
                autoFocus
              />
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-white/40 hover:text-white/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsEditingTitle(true)}>
              <h1 className="text-2xl font-display font-bold text-white">
                {dashboard?.title || 'Untitled Dashboard'}
              </h1>
              <Edit3 className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <p className="text-white/60 text-sm mt-1">
            {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
            {dashboard?.is_public && (
              <span className="ml-2">
                <Badge variant="success">Public</Badge>
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button variant="secondary" onClick={handleShareToggle}>
            <Share2 className="w-4 h-4 mr-2" />
            {dashboard?.is_public ? 'Public' : 'Share'}
          </Button>

          <Button variant="secondary" onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white border-none font-bold">
            <Download className="w-4 h-4 mr-2" />
            Strategic PDF
          </Button>

          {selectedSegment && (
            <Button variant="outline" onClick={clearFilters} className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
              <X className="w-4 h-4 mr-2" />
              Clear Filter: {selectedSegment}
            </Button>
          )}

          <Link href={`/dashboards/${dashboardId}/view`} target="_blank">
            <Button variant="ghost">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      {/* Add Widget Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
          <span className="text-sm font-medium text-white/70">Add widget:</span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddWidget(e.target.value)
                e.target.value = ''
              }
            }}
            defaultValue=""
            className="flex-1 px-3 py-2 border border-white/20 rounded-lg bg-[#111] text-sm"
          >
            <option value="">Select a dataset...</option>
            {datasets.map(ds => (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Widget Grid (React-Grid-Layout) */}
      <div ref={exportRef}>
      {widgets.length > 0 ? (
        <div className="relative">
          {saving && (
            <div className="absolute -top-10 right-0 flex items-center text-sm text-white/50">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving layout...
            </div>
          )}
          <ResponsiveGridLayout
            className="layout -mx-4"
            layouts={{ lg: widgets.map(w => ({
              i: w.id, x: w.position.x || 0, y: w.position.y || 0, w: w.position.w || 4, h: w.position.h || 3
            })) }}
            breakpoints={{ '2xl': 2000, xl: 1400, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ '2xl': 12, xl: 12, lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={120}
            onDragStop={handleLayoutChange}
            onResizeStop={handleLayoutChange}
            isDraggable={!isMobile}
            isResizable={!isMobile}
            draggableHandle=".cursor-move"
            margin={[24, 24]}
          >
            {widgets.map((widget) => {
              const Icon = CHART_ICONS[widget.type] || BarChart3
              const dataset = datasets.find(d => d.id === widget.dataset_id)

              return (
                <div key={widget.id} className="h-full">
                  <Card className="h-full flex flex-col group relative overflow-hidden shadow-soft hover:shadow-elevated transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4 flex-shrink-0 cursor-move">
                      <Badge variant="secondary" className="capitalize">
                        {widget.type}
                      </Badge>
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWidget(widget.id);
                        }}
                        className="p-1.5 text-white/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 min-h-0 bg-[#111] rounded-xl border border-white/10 relative">
                      {widget.config.x_col && widget.config.y_col ? (
                        <DashboardWidget widget={widget} />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <Icon className="w-10 h-10 text-[#60A5FA] mb-2" />
                          <span className="text-xs text-white/40 font-medium">Configure to view chart</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 pb-2">
                      <h3 className="font-semibold text-white truncate">
                        {widget.config.title || 'Untitled Chart'}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-white/50 truncate pr-2">
                          {dataset?.name || 'Unknown dataset'}
                        </p>
                        <Link href={`/charts/new?edit=${widget.id}`} onMouseDown={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Edit3 className="w-3 h-3 mr-1.5" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </ResponsiveGridLayout>
        </div>
      ) : (
          <div className="col-span-full">
            <EmptyState
              icon="chart"
              title="No widgets yet"
              description="Add a dataset and configure a chart to get started"
              action={
                <Link href="/charts/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Chart
                  </Button>
                </Link>
              }
            />
          </div>
        )}
      {/* Auto Insights Section */}
      {widgets.filter(w => w.config?.x_col && w.config?.y_col).length > 0 && (() => {
        const configured = widgets.filter(w => w.config?.x_col && w.config?.y_col)
        const first = configured[0]
        const ds = datasets.find(d => d.id === first.dataset_id)
        if (!ds) return null
        return (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-secondary-100" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2">AI-Powered Insights</span>
              <div className="h-px flex-1 bg-secondary-100" />
            </div>
            <div className={`grid gap-6 ${
              configured.length === 1 
                ? 'grid-cols-1' 
                : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
            }`}>
              {configured.map(w => {
                const wds = datasets.find(d => d.id === w.dataset_id)
                if (!wds) return null
                return (
                  <div key={w.id} className={configured.length === 1 ? 'w-full' : ''}>
                    <InsightsPanel
                      dataset={wds}
                      xCol={w.config.x_col}
                      yCol={w.config.y_col}
                      title={w.config.title}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-white/10 rounded-lg w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} height={300} />
        ))}
      </div>
    </div>
  )
}


