'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend
} from 'recharts'
import { analyzeData, detectCorrelations, AnalysisResult, Insight, InsightSeverity } from '@/lib/data/insights'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Zap,
  BarChart3, GitBranch, Eye, ChevronDown, ChevronUp, RefreshCw,
  Volume2, Square, Play, Sparkles
} from 'lucide-react'

interface InsightsPanelProps {
  dataset: {
    id: string
    file_path: string
    columns: { name: string; type: string }[]
    name: string
  }
  xCol: string
  yCol: string
  title?: string
}

const SEVERITY_STYLES: Record<InsightSeverity, string> = {
  info: 'border-sky-200 bg-sky-50/60 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50/60 text-amber-900',
  critical: 'border-rose-200 bg-rose-50/60 text-rose-900',
}

const SEVERITY_DOT: Record<InsightSeverity, string> = {
  info: 'bg-sky-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-rose-500',
}

function InsightCard({ insight }: { insight: Insight }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={`rounded-xl border px-4 py-3 transition-all cursor-pointer select-none ${SEVERITY_STYLES[insight.severity]}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[insight.severity]}`} />
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-snug">{insight.title}</p>
            {insight.value !== undefined && (
              <p className="text-xs opacity-70 mt-0.5 font-mono">
                Value: {typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {insight.change !== undefined && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${insight.change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {insight.change >= 0 ? '+' : ''}{insight.change.toFixed(1)}%
            </span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 opacity-50" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
        </div>
      </div>
      {expanded && (
        <p className="text-xs opacity-80 mt-2 leading-relaxed pl-4 border-t border-current/10 pt-2">
          {insight.description}
        </p>
      )}
    </div>
  )
}

export function InsightsPanel({ dataset, xCol, yCol, title }: InsightsPanelProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [correlations, setCorrelations] = useState<ReturnType<typeof detectCorrelations>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'insights' | 'forecast' | 'correlations' | 'narrative'>('narrative')
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    if (!dataset?.file_path || !xCol || !yCol) return
    loadAndAnalyze()
  }, [dataset?.file_path, xCol, yCol])

  const loadAndAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      let fileBlob: Blob | null = null

      const { data: directData, error: storageErr } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path)

      if (!storageErr && directData) {
        fileBlob = directData
      } else {
        const res = await fetch(`/api/datasets/${dataset.id}/download`)
        if (res.ok) {
          fileBlob = await res.blob()
        } else {
          throw new Error('Data access denied. This dataset might be private.')
        }
      }

      const isExcel = /\.(xlsx|xls)$/i.test(dataset.file_path)
      let rows: Record<string, unknown>[] = []

      if (isExcel) {
        const buffer = await fileBlob.arrayBuffer()
        const wb = XLSX.read(buffer, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, rawNumbers: true })
      } else {
        const text = await fileBlob.text()
        rows = await new Promise(resolve =>
          Papa.parse(text, {
            header: true, dynamicTyping: true, skipEmptyLines: true,
            complete: r => resolve(r.data as any),
            error: () => resolve([]),
          })
        )
      }

      const analysisResult = analyzeData(rows, xCol, yCol)
      setResult(analysisResult)

      const numericCols = dataset.columns
        .filter(c => c.type === 'number')
        .map(c => c.name)
      if (numericCols.length >= 2) {
        setCorrelations(detectCorrelations(rows, numericCols))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSpeak = () => {
    if (typeof window === 'undefined') return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    if (result?.narrative) {
      const utterance = new SpeechSynthesisUtterance(result.narrative)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    }
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-primary-500 animate-pulse" />
          <h3 className="font-display font-bold text-lg text-secondary-900">Analyzing data...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-secondary-100 rounded-xl animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-soft">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold text-sm">Analysis failed: {error}</span>
        </div>
      </div>
    )
  }

  if (!result) return null

  const { summary, insights, forecast } = result
  const TrendIcon = summary.trend === 'up' ? TrendingUp : summary.trend === 'down' ? TrendingDown : Minus
  const trendColor = summary.trend === 'up' ? 'text-emerald-500' : summary.trend === 'down' ? 'text-rose-500' : 'text-secondary-400'

  return (
    <div className="rounded-2xl border border-secondary-200 bg-white shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary-100 bg-gradient-to-r from-primary-50/50 to-indigo-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-secondary-900">Auto Insights</h3>
            <p className="text-xs text-secondary-500">{title || `${xCol} × ${yCol}`} · {summary.count} data points</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeak}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold ${isSpeaking ? 'bg-primary-100 text-primary-700' : 'hover:bg-secondary-100 text-secondary-500'}`}
            title={isSpeaking ? "Stop reading" : "Listen to analysis"}
          >
            {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? "Stop" : "Listen"}
          </button>
          <button onClick={loadAndAnalyze} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors" title="Refresh analysis">
            <RefreshCw className="w-4 h-4 text-secondary-400" />
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-secondary-100 border-b border-secondary-100">
        {[
          { label: 'Total', value: summary.total.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
          { label: 'Average', value: summary.average.toLocaleString(undefined, { maximumFractionDigits: 1 }) },
          { label: 'Max', value: summary.max.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
          { label: 'Min', value: summary.min.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
        ].map(stat => (
          <div key={stat.label} className="px-4 py-3 text-center">
            <p className="text-xs text-secondary-500 uppercase tracking-wide font-medium">{stat.label}</p>
            <p className="font-bold text-secondary-900 mt-0.5 text-sm sm:text-base">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Trend Badge */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${summary.trend === 'up' ? 'bg-emerald-50 text-emerald-700' :
            summary.trend === 'down' ? 'bg-rose-50 text-rose-700' :
              'bg-secondary-100 text-secondary-600'
          }`}>
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          {summary.trend === 'up' ? `Growing +${summary.growthRate.toFixed(1)}%` :
            summary.trend === 'down' ? `Declining ${summary.growthRate.toFixed(1)}%` :
              'Stable Trend'}
        </div>
        <span className="text-xs text-secondary-400">Std Dev: {summary.stdDev.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-1 border-b border-secondary-100">
          {[
            { key: 'narrative', label: 'Summary', icon: Sparkles },
            { key: 'insights', label: 'Insights', icon: Eye, count: insights.length },
            { key: 'forecast', label: 'Forecast', icon: TrendingUp },
            { key: 'correlations', label: 'Correlations', icon: GitBranch, count: correlations.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.key
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 pt-4">
        {/* NARRATIVE TAB */}
        {activeTab === 'narrative' && (
          <div className="space-y-4">
            <div className="bg-primary-50/30 rounded-xl p-5 border border-primary-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-12 h-12 text-primary-600" />
              </div>
              <h4 className="text-sm font-bold text-primary-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Data Narrative
              </h4>
              <p className="text-secondary-700 leading-relaxed text-sm italic">
                "{result.narrative}"
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSpeak}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm border border-primary-100 transition-all hover:shadow-md"
                >
                  {isSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  {isSpeaking ? "Stop Reading" : "Read Aloud"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-secondary-100 bg-secondary-50/30">
                <p className="text-[10px] uppercase tracking-wider font-bold text-secondary-400 mb-1">Trend Strength</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${summary.trendStrength * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-secondary-700">{(summary.trendStrength * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-secondary-100 bg-secondary-50/30">
                <p className="text-[10px] uppercase tracking-wider font-bold text-secondary-400 mb-1">Consistency</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(0, 100 - (summary.stdDev / summary.average * 100))}%` }} />
                  </div>
                  <span className="text-sm font-bold text-secondary-700">{Math.max(0, 100 - (summary.stdDev / summary.average * 100)).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="space-y-2.5">
            {insights.length === 0 && (
              <p className="text-secondary-400 text-sm text-center py-4">No significant patterns detected.</p>
            )}
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {/* FORECAST TAB */}
        {activeTab === 'forecast' && (
          <div>
            {forecast.length < 2 ? (
              <p className="text-secondary-400 text-sm text-center py-4">Not enough data for forecasting (need at least 3 rows).</p>
            ) : (
              <>
                <p className="text-xs text-secondary-500 mb-4">
                  Linear regression forecast with confidence interval. Dashed section = projected values.
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip
                        formatter={(val: any, name: string) => [
                          typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 0 }) : val,
                          name
                        ]}
                      />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="actual" name="Actual" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorActual)" connectNulls={false} dot={{ r: 3 }} />
                      <Area type="monotone" dataKey="forecast" name="Trend / Forecast" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" fill="url(#colorForecast)" dot={{ r: 3 }} />
                      <Area type="monotone" dataKey="upper" name="Upper CI" stroke="#a5b4fc" strokeWidth={1} strokeDasharray="2 2" fill="transparent" dot={false} />
                      <Area type="monotone" dataKey="lower" name="Lower CI" stroke="#a5b4fc" strokeWidth={1} strokeDasharray="2 2" fill="transparent" dot={false} />
                      <ReferenceLine x={`Forecast +1`} stroke="#6366f1" strokeDasharray="4 2" label={{ value: 'Forecast →', position: 'insideTopLeft', fontSize: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {forecast.filter(p => p.name.startsWith('Forecast')).map((p, i) => (
                    <div key={i} className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2.5 text-center">
                      <p className="text-xs text-indigo-500 font-medium">{p.name}</p>
                      <p className="text-base font-bold text-indigo-900 mt-0.5">
                        {p.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-indigo-400 mt-0.5">
                        {p.lower.toLocaleString(undefined, { maximumFractionDigits: 0 })} – {p.upper.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* CORRELATIONS TAB */}
        {activeTab === 'correlations' && (
          <div className="space-y-2.5">
            {correlations.length === 0 ? (
              <div className="text-center py-6">
                <GitBranch className="w-8 h-8 text-secondary-200 mx-auto mb-2" />
                <p className="text-secondary-400 text-sm">No strong correlations found between numeric columns.</p>
                <p className="text-secondary-300 text-xs mt-1">Correlations above 0.6 will appear here.</p>
              </div>
            ) : (
              correlations.map((corr, i) => (
                <div key={i} className="rounded-xl border border-secondary-200 bg-secondary-50/50 px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-secondary-800">
                      {corr.colA} ↔ {corr.colB}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${corr.r > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                      r = {corr.r.toFixed(2)}
                    </span>
                  </div>
                  {/* Correlation bar */}
                  <div className="relative h-1.5 bg-secondary-200 rounded-full overflow-hidden mt-2">
                    <div
                      className={`absolute top-0 h-full rounded-full transition-all ${corr.r > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ width: `${Math.abs(corr.r) * 100}%`, left: corr.r < 0 ? `${(1 - Math.abs(corr.r)) * 100}%` : 0 }}
                    />
                  </div>
                  <p className="text-xs text-secondary-500 mt-2">{corr.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
