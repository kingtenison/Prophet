'use client'

import { useEffect, useState } from 'react'
import { Widget } from '@/types'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { aggregateData } from '@/lib/data/aggregate'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { useFilterStore } from '@/store/useFilterStore'

const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#f43f5e', '#14b8a6', '#8b5cf6', '#ec4899', '#06b6d4']

async function parseFileToRows(blob: Blob, filePath: string): Promise<Record<string, unknown>[]> {
  const isExcel = /\.(xlsx|xls)$/i.test(filePath)

  if (isExcel) {
    const buffer = await blob.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, rawNumbers: true })
    return raw
  } else {
    // CSV
    const text = await blob.text()
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as Record<string, unknown>[]),
        error: () => resolve([]),
      })
    })
  }
}

export function DashboardWidget({ widget }: { widget: Widget & { dataset?: any } }) {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedSegment, setSelectedSegment } = useFilterStore()

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true)
      setError(null)

      if (!widget.dataset?.file_path) {
        setError('No dataset linked')
        setLoading(false)
        return
      }
      if (!widget.config?.x_col || !widget.config?.y_col) {
        setError('Chart not configured — click Edit to set axes')
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        let fileBlob: Blob | null = null

        const { data: directData, error: storageErr } = await supabase.storage
          .from('datasets')
          .download(widget.dataset.file_path)

        if (!storageErr && directData) {
          fileBlob = directData
        } else {
          // Fallback to API proxy (which handles binary data and RLS bypass)
          const res = await fetch(`/api/datasets/${widget.dataset.id}/download`)
          if (res.ok) {
            fileBlob = await res.blob()
          } else {
            setError(`Data access denied. This might be due to security policies or a missing file.`)
            setLoading(false)
            return
          }
        }

        const rows = await parseFileToRows(fileBlob, widget.dataset.file_path)

        if (rows.length === 0) {
          setError('File has no data rows')
          setLoading(false)
          return
        }

        if (widget.type === 'table') {
          // For table, we just pass the rows (maybe limit to 100 for performance)
          const filtered = selectedSegment 
            ? rows.filter(r => String(r[widget.config.x_col]) === selectedSegment)
            : rows
          if (!cancelled) setChartData(filtered.slice(0, 100))
        } else {
          const filteredRows = selectedSegment 
            ? rows.filter(r => String(r[widget.config.x_col]) === selectedSegment)
            : rows

          const data = aggregateData(
            filteredRows,
            widget.config.x_col,
            widget.config.y_col,
            widget.config.aggregation || 'sum',
            widget.config.group_col
          )
          if (!cancelled) setChartData(data)
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [widget.id, widget.config?.x_col, widget.config?.y_col, widget.config?.aggregation, widget.config?.group_col, widget.dataset?.file_path, widget.type, selectedSegment])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
        <span className="text-xs text-rose-400 font-medium">{error}</span>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-secondary-400">
        No data found
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden">
      {widget.type === 'kpi' || widget.type === 'table' ? (
        renderChart(widget.type, chartData, widget.config, setSelectedSegment)
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(widget.type, chartData, widget.config, setSelectedSegment)}
        </ResponsiveContainer>
      )}
    </div>
  )
}

function renderChart(type: string, data: any[], config: any, setSelectedSegment: (s: string | null) => void) {
  switch (type) {
    case 'bar':
      return (
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          onClick={(e) => e && e.activeLabel && setSelectedSegment(e.activeLabel)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} />
          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
          {data[0]?.group ? <Legend /> : null}
          <Bar dataKey="value" fill={config.color || 'var(--accent-primary)'} radius={[4, 4, 0, 0]} className="cursor-pointer" />
        </BarChart>
      )

    case 'line':
      return (
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {data[0]?.group ? <Legend /> : null}
          <Line type="monotone" dataKey="value" stroke={config.color || 'var(--accent-primary)'} strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      )

    case 'pie':
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={35}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )

    case 'scatter':
      return (
        <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="name" name={config.x_col} tick={{ fontSize: 11 }} />
          <YAxis type="number" dataKey="value" name={config.y_col} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill={config.color || 'var(--accent-primary)'} />
        </ScatterChart>
      )

    case 'kpi': {
      const val = data.reduce((acc, d) => acc + (d.value || 0), 0)
      return (
        <div className="h-full flex items-center justify-center p-4">
          <div className="text-center bg-white/5 rounded-2xl p-6 border border-white/10 w-full shadow-inner">
            <p className="text-xs font-semibold text-royalblue-600 uppercase tracking-wider mb-1">
              {config.title || config.y_col}
            </p>
            <p className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {val.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {config.aggregation?.toUpperCase()}
              </span>
              {config.x_col && (
                <span className="text-[10px] text-white/30 truncate max-w-[100px]">
                  by {config.x_col}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'table': {
      if (!data.length) return null
      const cols = Object.keys(data[0])
      return (
        <div className="h-full overflow-auto rounded-xl border border-white/10 bg-[#0a0a0a] custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-[#111] z-10">
              <tr className="border-b border-white/10">
                {cols.map(c => (
                  <th key={c} className="px-3 py-2 font-semibold text-[#2563EB] uppercase tracking-wider whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  {cols.map(c => (
                    <td key={c} className="px-3 py-1.5 text-white/60 font-mono whitespace-nowrap">
                      {String(row[c] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    default:
      return (
        <div className="h-full flex items-center justify-center text-sm text-secondary-400">
          Chart type not supported
        </div>
      )
  }
}

