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

        const data = aggregateData(
          rows,
          widget.config.x_col,
          widget.config.y_col,
          widget.config.aggregation || 'sum',
          widget.config.group_col
        )

        if (!cancelled) {
          setChartData(data)
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [widget.id, widget.config?.x_col, widget.config?.y_col, widget.config?.aggregation, widget.config?.group_col, widget.dataset?.file_path])

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
        No chart data — check column selection
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart(widget.type, chartData, widget.config)}
    </ResponsiveContainer>
  )
}

function renderChart(type: string, data: any[], config: any) {
  switch (type) {
    case 'bar':
      return (
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {data[0]?.group ? <Legend /> : null}
          <Bar dataKey="value" fill={config.color || '#0ea5e9'} radius={[4, 4, 0, 0]} />
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
          <Line type="monotone" dataKey="value" stroke={config.color || '#0ea5e9'} strokeWidth={3} dot={{ r: 4 }} />
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
          <Scatter data={data} fill={config.color || '#0ea5e9'} />
        </ScatterChart>
      )

    case 'kpi': {
      const val = data.reduce((acc, d) => acc + (d.value || 0), 0)
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl lg:text-5xl font-bold text-primary-600">{val.toLocaleString()}</p>
            <p className="text-secondary-600 mt-2">{config.y_col}</p>
            <p className="text-xs text-secondary-400 mt-1">{config.aggregation?.toUpperCase()}</p>
          </div>
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
