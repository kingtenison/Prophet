'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dataset } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Database, Plus, Upload, BarChart3, Calendar, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, formatBytes } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<(Dataset & { file_size?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const pageSize = 12
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: allFiles } = await supabase.storage
      .from('datasets')
      .list()

    const fileSizeMap: Record<string, number> = {}
    if (allFiles) {
      allFiles.forEach(f => {
        if (f.metadata?.size) fileSizeMap[f.name] = f.metadata.size
      })
    }

    const withSizes = (data || []).map(d => ({
      ...d,
      file_size: d.file_path ? (fileSizeMap[d.file_path.split('/').pop() || ''] || 0) : 0
    }))

    setDatasets(withSizes)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('datasets').delete().eq('id', deleteTarget)
    if (!error) setDatasets(datasets.filter(d => d.id !== deleteTarget))
    setDeleting(false)
    setDeleteTarget(null)
  }

  const filtered = datasets.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
          <h1 className="text-4xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Datasets</h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>All your uploaded data sources</p>
        </div>
        <Link href="/datasets/upload">
          <Button className="btn-primary"><Upload className="w-4 h-4 mr-2" />Upload Data</Button>
        </Link>
      </div>

      {datasets.length > 6 && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search datasets..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="database"
          title={search ? 'No matching datasets' : 'No datasets yet'}
          description={search ? 'Try a different search term' : 'Upload your first dataset to get started'}
          action={
            <Link href="/datasets/upload">
              <Button className="btn-primary"><Upload className="w-4 h-4 mr-2" />Upload Data</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map(dataset => (
            <div key={dataset.id} className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-500/10 shrink-0"><Database className="w-5 h-5 text-blue-400" /></div>
                  <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{dataset.name}</h3>
                </div>
                <button onClick={() => setDeleteTarget(dataset.id)} className="text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40 mb-5">
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {dataset.row_count.toLocaleString()} rows</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(dataset.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">{formatBytes(dataset.file_size || 0)}</span>
                <Link href={`/datasets/${dataset.id}`}>
                  <button className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Open
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-white/40 font-mono">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Dataset"
        message="This action cannot be undone. The dataset and all associated data will be permanently removed."
        confirmLabel="Delete Permanently"
        loading={deleting}
      />
    </div>
  )
}
