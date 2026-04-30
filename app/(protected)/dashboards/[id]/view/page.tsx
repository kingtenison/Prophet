'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dashboard, Widget } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DashboardWidget } from '@/components/DashboardWidget'
import { InsightsPanel } from '@/components/InsightsPanel'
import { toPng } from 'html-to-image'
import {
  LayoutDashboard,
  Download,
  ArrowLeft,
  Share2,
  Calendar,
  BarChart3,
  Loader2,
  Sparkles
} from 'lucide-react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { formatDate } from '@/lib/utils'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function DashboardViewPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const dashboardId = params.id as string
  const exportRef = useRef<HTMLDivElement>(null)

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [widgets, setWidgets] = useState<(Widget & { dataset?: any })[]>([])
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

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

  const handleExport = async () => {
    if (!exportRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true, 
        backgroundColor: '#0a0a0a',
        style: {
           borderRadius: '0'
        }
      })
      const link = document.createElement('a')
      link.download = `${dashboard?.title || 'Dashboard'}_Report.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      {/* Navigation Header */}
      <div className="w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              {dashboard?.title || 'Untitled Dashboard'}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-white/40 text-xs">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(dashboard?.updated_at || '')}</span>
              <span className="flex items-center gap-1"><LayoutDashboard className="w-3 h-3" /> {widgets.length} Widgets</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
          >
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export Report (PNG)
          </Button>
          <Button variant="secondary" className="bg-white/5 border-white/10">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>

      {/* Main Dashboard Area (Exportable) */}
      <div ref={exportRef} className="w-full space-y-8 bg-[#0a0a0a] p-4 rounded-3xl">
        
        {/* Branding/Header for Export */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl italic">P</div>
             <div>
               <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Prophet Strategic Audit</h2>
               <p className="text-[10px] text-white/30 uppercase">Enterprise Intelligence Report</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-white/20 uppercase tracking-widest">Confidential</p>
             <p className="text-xs text-white/40">Dashboard Snapshot</p>
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout -mx-4"
          layouts={{ lg: widgets.map(w => ({
            i: w.id, x: w.position.x || 0, y: w.position.y || 0, w: w.position.w || 4, h: w.position.h || 3
          })) }}
          breakpoints={{ '2xl': 2000, xl: 1400, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ '2xl': 12, xl: 12, lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={120}
          isDraggable={false}
          isResizable={false}
          margin={[24, 24]}
        >
          {widgets.map((widget) => {
            const dataset = datasets.find(d => d.id === widget.dataset_id)
            return (
              <div key={widget.id}>
                <Card className="h-full flex flex-col bg-[#111] border-white/5 shadow-xl">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider truncate">{widget.config.title || 'Untitled'}</h3>
                    <Badge variant="secondary" className="text-[9px] bg-white/5 text-white/40 border-none">{widget.type}</Badge>
                  </div>
                  <div className="flex-1 p-4">
                    <DashboardWidget widget={widget} />
                  </div>
                  <div className="p-2 px-4 text-[10px] text-white/20 border-t border-white/5 italic">
                    Source: {dataset?.name || 'Manual Entry'}
                  </div>
                </Card>
              </div>
            )
          })}
        </ResponsiveGridLayout>

        {/* AI Collective Intelligence Section */}
        {widgets.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em]">AI Strategic Narrative</span>
              </div>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className={`grid gap-6 ${
              widgets.filter(w => w.config?.x_col && w.config?.y_col).length === 1 
                ? 'grid-cols-1' 
                : 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'
            }`}>
               {widgets.filter(w => w.config?.x_col && w.config?.y_col).map(w => {
                 const wds = datasets.find(d => d.id === w.dataset_id)
                 if (!wds) return null
                 return (
                   <div key={w.id} className={widgets.filter(w => w.config?.x_col && w.config?.y_col).length === 1 ? 'w-full' : ''}>
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
        )}
        
        {/* Footer for Export */}
        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-end">
           <div className="text-[10px] text-white/20">
             <p>© 2026 PROPHET INTELLIGENCE ENGINE</p>
             <p>All values derived through recursive mathematical modeling.</p>
           </div>
           <div className="text-[10px] text-white/20 text-right">
             <p>AUTHENTICATED REPORT ID</p>
             <p className="font-mono">{dashboardId.slice(0, 8).toUpperCase()}</p>
           </div>
        </div>
      </div>
    </div>
  )
}
