'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dataset, ColumnMeta, AggregationType } from '@/types'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useChartBuilderStore } from '@/store/useChartBuilderStore'
import { aggregateData, buildPredicate } from '@/lib/data/aggregate'
import { useToast } from '@/components/ui/ToastProvider'
import { useCallback } from 'react'
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ScatterChart as ScatterIcon,
  Hash,
  Table
} from 'lucide-react'

const CHART_COLORS = [
  '#0ea5e9', '#6366f1', '#f59e0b', '#f43f5e', '#14b8a6', '#8b5cf6', '#ec4899', '#06b6d4'
]

export default function ChartBuilderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    selectedDatasetId,
    chartType,
    xColumn,
    yColumn,
    aggregation,
    groupColumn,
    filters,
    title,
    color,
    setDataset,
    setChartType,
    setXColumn,
    setYColumn,
    setAggregation,
    setGroupColumn,
    addFilter,
    removeFilter,
    updateFilter,
    setTitle,
    setColor,
    reset
  } = useChartBuilderStore()

  const { addToast } = useToast()

  const [editWidgetId, setEditWidgetId] = useState<string | null>(null)
  const [editDashboardId, setEditDashboardId] = useState<string | null>(null)

  useEffect(() => {
    fetchDatasets()
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get('edit')
    if (editId) {
      setEditWidgetId(editId)
      loadWidgetConfig(editId)
    }
  }, [])

  const loadWidgetConfig = async (id: string) => {
    const { data } = await supabase.from('widgets').select('*').eq('id', id).single()
    if (data) {
      setEditDashboardId(data.dashboard_id)
      setDataset(data.dataset_id)
      setChartType(data.type)
      setXColumn(data.config.x_col)
      setYColumn(data.config.y_col)
      if (data.config.aggregation) setAggregation(data.config.aggregation)
      if (data.config.group_col) setGroupColumn(data.config.group_col)
      setTitle(data.config.title || '')
      if (data.config.color) setColor(data.config.color)
    }
  }

  useEffect(() => {
    if (selectedDatasetId) {
      fetchDatasetData(selectedDatasetId)
    }
  }, [selectedDatasetId])

  const fetchDatasets = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false })

    setDatasets(data || [])
  }

  const fetchDatasetData = async (datasetId: string) => {
    setLoading(true)
    const dataset = datasets.find(d => d.id === datasetId)
    if (!dataset) { setLoading(false); return }

    const { data: fileBlob, error: storageErr } = await supabase.storage
      .from('datasets')
      .download(dataset.file_path)

    if (storageErr || !fileBlob) { setLoading(false); return }

    const isExcel = /\.(xlsx|xls)$/i.test(dataset.file_path)
    let rows: Record<string, unknown>[] = []

    if (isExcel) {
      const buffer = await fileBlob.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, rawNumbers: true })
    } else {
      const text = await fileBlob.text()
      rows = await new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (r) => resolve(r.data as Record<string, unknown>[]),
          error: () => resolve([]),
        })
      })
    }

    if (rows.length > 0) {
      setRawData(rows)

      // Auto-set defaults only if not already set
      const currentX = useChartBuilderStore.getState().xColumn
      const currentY = useChartBuilderStore.getState().yColumn
      if (!currentX) {
        setXColumn(dataset.columns[0]?.name || '')
      }
      if (!currentY) {
        const numericCols = dataset.columns.filter(c => c.type === 'number')
        if (numericCols.length) {
          setYColumn(numericCols[0].name)
        }
      }
    }
    setLoading(false)
  }

  const chartData = useMemo(() => {
    if (!xColumn || !yColumn || rawData.length === 0) return []

    const activeFilters = filters.filter(f => f.column && f.value !== '')
    const filterPredicate = activeFilters.length > 0
      ? buildPredicate(activeFilters.map(f => ({
          column: f.column,
          operator: f.operator,
          value: ['equals', 'contains'].includes(f.operator) ? f.value : Number(f.value)
        })))
      : undefined

    return aggregateData(
      rawData,
      xColumn,
      yColumn,
      aggregation,
      groupColumn || undefined,
      filterPredicate
    )
  }, [rawData, xColumn, yColumn, aggregation, groupColumn, filters])

  const handleSave = async (toDashboard: boolean = false) => {
    if (!selectedDatasetId) {
      addToast({ type: 'error', title: 'Please select a dataset' })
      return
    }
    if (!xColumn || !yColumn) {
      addToast({ type: 'error', title: 'Please select X and Y axis columns' })
      return
    }
    if (!title) {
      addToast({ type: 'error', title: 'Please enter a chart title' })
      return
    }

    setSaving(true)
    try {
      if (toDashboard) {
        const { data: dashData } = await supabase
          .from('dashboards')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            title: 'Untitled Dashboard',
            is_public: false,
            layout: {}
          })
          .select()
          .single()

        await supabase.from('widgets').insert({
          dashboard_id: dashData.id,
          dataset_id: selectedDatasetId,
          type: chartType,
          config: {
            x_col: xColumn,
            y_col: yColumn,
            aggregation,
            group_col: groupColumn || undefined,
            filters: filters.length ? filters : undefined,
            title,
            color
          },
          position: { x: 0, y: 0, w: 6, h: 4 }
        })

        addToast({ type: 'success', title: 'Widget saved to new dashboard!' })
        reset()
        router.push(`/dashboards/${dashData.id}/edit`)
      } else if (editWidgetId) {
        await supabase.from('widgets').update({
          dataset_id: selectedDatasetId,
          type: chartType,
          config: {
            x_col: xColumn,
            y_col: yColumn,
            aggregation,
            group_col: groupColumn || undefined,
            filters: filters.length ? filters : undefined,
            title,
            color
          }
        }).eq('id', editWidgetId)

        addToast({ type: 'success', title: 'Chart updated!' })
        if (editDashboardId) {
          router.push(`/dashboards/${editDashboardId}/edit`)
        }
      } else {
        addToast({ type: 'success', title: 'Chart configuration saved!' })
      }
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Config */}
        <div className="lg:w-1/3 space-y-6">
          <Card>
            <div className="px-6 py-4 border-b border-white/10">
              <h1 className="font-display font-bold text-xl text-white">Chart Builder</h1>
              <p className="text-sm text-white/50 mt-0.5">
                Build a chart from your dataset
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Dataset Selector */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Dataset
                </label>
                <Select
                  value={selectedDatasetId || ''}
                  onChange={(e) => setDataset(e.target.value || null)}
                  options={[
                    { value: '', label: 'Select dataset...' },
                    ...datasets.map(d => ({ value: d.id, label: d.name }))
                  ]}
                />
              </div>

              {selectedDataset && (
                <>
                  {/* Chart Type */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Chart type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'bar', icon: BarChart3, label: 'Bar' },
                        { value: 'line', icon: TrendingUp, label: 'Line' },
                        { value: 'pie', icon: PieChartIcon, label: 'Pie' },
                        { value: 'scatter', icon: ScatterIcon, label: 'Scatter' },
                        { value: 'kpi', icon: Hash, label: 'KPI' },
                        { value: 'table', icon: Table, label: 'Table' }
                      ].map(chart => {
                        const Icon = chart.icon
                        return (
                          <button
                            key={chart.value}
                            onClick={() => setChartType(chart.value as any)}
                            className={`p-3 rounded-xl border text-center transition-all ${chartType === chart.value
                                ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                                : 'border-white/20 hover:border-white/30'
                              }`}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs font-medium">{chart.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Axis Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">
                        X-Axis / Labels
                      </label>
                      <Select
                        value={xColumn}
                        onChange={(e) => setXColumn(e.target.value)}
                        options={selectedDataset.columns.map(c => ({
                          value: c.name,
                          label: `${c.name} (${c.type})`
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">
                        Y-Axis / Values
                      </label>
                      <Select
                        value={yColumn}
                        onChange={(e) => setYColumn(e.target.value)}
                        options={selectedDataset.columns
                          .filter(c => c.type === 'number')
                          .map(c => ({
                            value: c.name,
                            label: `${c.name} (number)`
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Aggregation */}
                  {['bar', 'line', 'scatter'].includes(chartType) && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">
                        Aggregation
                      </label>
                      <div className="flex gap-1.5">
                        {(['sum', 'avg', 'count', 'min', 'max'] as AggregationType[]).map(agg => (
                          <button
                            key={agg}
                            onClick={() => setAggregation(agg)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${aggregation === agg
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-white/20 text-white/60 hover:border-white/30'
                              }`}
                          >
                            {agg.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Group By (optional) */}
                  {(chartType === 'bar' || chartType === 'line') && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">
                        Group by (optional)
                      </label>
                      <Select
                        value={groupColumn}
                        onChange={(e) => setGroupColumn(e.target.value)}
                        options={[
                          { value: '', label: 'None' },
                          ...selectedDataset.columns
                            .filter(c => c.name !== xColumn && c.name !== yColumn)
                            .map(c => ({ value: c.name, label: c.name }))
                        ]}
                      />
                    </div>
                  )}

                  {/* Filter Builder */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-white/70">Filters</label>
                      <button
                        type="button"
                        onClick={addFilter}
                        className="text-xs text-blue-500 hover:text-blue-500 font-medium"
                      >
                        + Add filter
                      </button>
                    </div>
                    {filters.map(f => (
                      <div key={f.id} className="flex gap-2 items-end">
                        <Select
                          value={f.column}
                          onChange={(e) => updateFilter(f.id, { column: e.target.value })}
                          options={[
                            { value: '', label: 'Column' },
                            ...selectedDataset.columns.map(c => ({ value: c.name, label: c.name }))
                          ]}
                          className="flex-1"
                        />
                        <Select
                          value={f.operator}
                          onChange={(e) => updateFilter(f.id, { operator: e.target.value })}
                          options={[
                            { value: 'equals', label: '=' },
                            { value: 'contains', label: 'contains' },
                            { value: 'gt', label: '>' },
                            { value: 'lt', label: '<' }
                          ]}
                          className="w-24"
                        />
                        <Input
                          value={f.value}
                          onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeFilter(f.id)}
                          className="p-2 text-white/40 hover:text-rose-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Chart title
                    </label>
                    <Input
                      value={title || ''}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Untitled Chart"
                    />
                  </div>

                  {/* Color */}
                  {chartType !== 'table' && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">
                        Primary color
                      </label>
                      <div className="flex gap-2">
                        {CHART_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-secondary-900' : 'border-transparent'
                              }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Actions */}
                  <div className="pt-4 border-t border-white/10 flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-1 gap-2"
                      onClick={() => handleSave(true)}
                      loading={saving}
                    >
                      Save to Dashboard
                    </Button>
                    <Button variant="secondary" onClick={() => handleSave(false)}>
                      Save Config
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Dataset Info */}
          {selectedDataset && (
            <Card className="p-4">
              <h3 className="font-medium text-white mb-3">Dataset Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Rows</span>
                  <span className="font-medium">{selectedDataset.row_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Columns</span>
                  <span className="font-medium">{selectedDataset.columns.length}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Panel: Preview */}
        <div className="lg:flex-1 space-y-6">
          <Card className="p-6">
            <h2 className="font-display font-bold text-xl text-white mb-6">
              Live Preview
            </h2>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : !selectedDatasetId || !xColumn || !yColumn || chartData.length === 0 ? (
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl">
                <div className="text-center text-white/50">
                  <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>Select a dataset and configure axes to see preview</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={420} className="pointer-events-none lg:pointer-events-auto">
                {renderChart()}
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </div>
  )

  function renderChart() {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            {groupColumn && <Legend />}
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            {groupColumn && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </PieChart>
        )

      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" dataKey="name" name={xColumn} tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis type="number" dataKey="value" name={yColumn} tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Scatter data={chartData} fill={color} />
          </ScatterChart>
        )

      case 'kpi': {
        const val = chartData.reduce((acc, d) => acc + (d.value || 0), 0)
        return (
          <div className="h-96 flex items-center justify-center p-8">
            <div className="text-center bg-white/5 rounded-3xl p-10 border border-white/10 w-full max-w-sm shadow-2xl">
              <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-[0.2em] mb-4">
                {title || yColumn}
              </p>
              <p className="text-6xl lg:text-7xl font-bold text-white tracking-tighter">
                {val.toLocaleString()}
              </p>
              <div className="flex items-center justify-center gap-3 mt-8">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  {aggregation?.toUpperCase()}
                </span>
                <span className="text-xs text-white/30">
                  based on {xColumn}
                </span>
              </div>
            </div>
          </div>
        )
      }

      case 'table': {
        const cols = Object.keys(rawData[0] || {})
        const displayData = rawData.slice(0, 10)
        return (
          <div className="h-96 overflow-auto rounded-2xl border border-white/10 bg-[#0a0a0a] custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="sticky top-0 bg-[#111] z-10">
                <tr className="border-b border-white/10">
                  {cols.map(c => (
                    <th key={c} className="px-4 py-3 font-semibold text-[#2563EB] uppercase tracking-wider whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    {cols.map(c => (
                      <td key={c} className="px-4 py-3 text-white/60 font-mono text-xs whitespace-nowrap">
                        {String(row[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rawData.length > 10 && (
              <div className="p-4 text-center text-white/30 text-xs border-t border-white/5 bg-white/[0.01]">
                Previewing first 10 rows of {rawData.length.toLocaleString()}
              </div>
            )}
          </div>
        )
      }

      default:
        return (
          <div className="h-96 flex items-center justify-center text-white/50">
            {String(chartType).toUpperCase()} chart preview coming soon
          </div>
        )
    }
  }
}

