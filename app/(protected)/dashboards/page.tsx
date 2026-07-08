'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dashboard } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LayoutDashboard, Plus, BarChart3, Calendar, Trash2, Edit3, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<(Dashboard & { widgetCount: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const pageSize = 12
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

    const dashboardIds = (data || []).map(d => d.id)
    let widgetCounts: Record<string, number> = {}
    if (dashboardIds.length > 0) {
      const { data: counts } = await supabase
        .from('widgets')
        .select('dashboard_id')
        .in('dashboard_id', dashboardIds)
      if (counts) {
        widgetCounts = counts.reduce<Record<string, number>>((acc, w) => {
          acc[w.dashboard_id] = (acc[w.dashboard_id] || 0) + 1
          return acc
        }, {})
      }
    }

    const withWidgets = (data || []).map(d => ({
      ...d,
      widgetCount: widgetCounts[d.id] || 0
    }))

    setDashboards(withWidgets)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('dashboards').delete().eq('id', deleteTarget)
    if (!error) setDashboards(dashboards.filter(d => d.id !== deleteTarget))
    setDeleting(false)
    setDeleteTarget(null)
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.slice(page * pageSize, (page + 1) * pageSize).map(dashboard => (
            <div key={dashboard.id} className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0"><LayoutDashboard className="w-5 h-5 text-indigo-400" /></div>
                  <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{dashboard.title}</h3>
                </div>
                <button onClick={() => setDeleteTarget(dashboard.id)} className="text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 className="w-4 h-4" />
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
          {dashboards.length > pageSize && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-white/40 font-mono">
                {page + 1} / {Math.max(1, Math.ceil(dashboards.length / pageSize))}
              </span>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(dashboards.length / pageSize) - 1, p + 1))}
                disabled={page >= Math.ceil(dashboards.length / pageSize) - 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Dashboard"
        message="This will permanently delete this dashboard and all its widgets."
        confirmLabel="Delete Permanently"
        loading={deleting}
      />
    </div>
  )
}
