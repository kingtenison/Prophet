'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dashboard } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LayoutDashboard, Plus, BarChart3, Calendar, MoreHorizontal, Edit3, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<(Dashboard & { widgetCount: number })[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('dashboards')
      .select('*')
      .order('updated_at', { ascending: false })

    const withWidgets = await Promise.all(
      (data || []).map(async (d) => {
        const { count } = await supabase
          .from('widgets')
          .select('*', { count: 'exact', head: true })
          .eq('dashboard_id', d.id)
        return { ...d, widgetCount: count || 0 }
      })
    )

    setDashboards(withWidgets)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dashboard and all its widgets?')) return
    await supabase.from('widgets').delete().eq('dashboard_id', id)
    const { error } = await supabase.from('dashboards').delete().eq('id', id)
    if (!error) setDashboards(dashboards.filter(d => d.id !== id))
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboards</h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>All your interactive dashboards</p>
        </div>
        <Link href="/dashboards/new">
          <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" />New Dashboard</Button>
        </Link>
      </div>

      {dashboards.length === 0 ? (
        <EmptyState
          icon="dashboard"
          title="No dashboards yet"
          description="Create your first dashboard to organize your visualisations"
          action={
            <Link href="/dashboards/new">
              <Button className="btn-primary"><LayoutDashboard className="w-4 h-4 mr-2" />Create Dashboard</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map(dashboard => (
            <div key={dashboard.id} className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0"><LayoutDashboard className="w-5 h-5 text-indigo-400" /></div>
                  <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{dashboard.title}</h3>
                </div>
                <button onClick={() => handleDelete(dashboard.id)} className="text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40 mb-5">
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {dashboard.widgetCount} widgets</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(dashboard.updated_at)}</span>
                {dashboard.is_public && <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-400 rounded-full uppercase">Public</span>}
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboards/${dashboard.id}/edit`} className="flex-1">
                  <button className="w-full py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center gap-1">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </Link>
                <Link href={`/dashboards/${dashboard.id}/view`} className="flex-1">
                  <button className="w-full py-2 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
