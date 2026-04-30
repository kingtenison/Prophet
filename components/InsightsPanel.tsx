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
  Volume2, Square, Play, Sparkles, MessageSquare
} from 'lucide-react'
import { DataChatbot } from './DataChatbot'

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
  info: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  critical: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
}

const SEVERITY_DOT: Record<InsightSeverity, string> = {
  info: 'bg-sky-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-rose-500/100',
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
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${insight.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
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
  const [activeTab, setActiveTab] = useState<'insights' | 'forecast' | 'correlations' | 'narrative' | 'whatif'>('narrative')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [rows, setRows] = useState<any[]>([])

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
      setRows(rows)

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
      <div className="rounded-2xl border border-white/20 bg-[var(--bg-tertiary)] p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-[#3B82F6] animate-pulse" />
          <h3 className="font-display font-bold text-lg text-white">Analyzing data...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-white/10 rounded-xl animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 shadow-soft">
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
  const trendColor = summary.trend === 'up' ? 'text-emerald-500' : summary.trend === 'down' ? 'text-rose-500' : 'text-white/40'

  return (
    <div className="rounded-2xl border border-white/20 bg-[var(--bg-tertiary)] shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-primary-50/50 to-indigo-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-royalblue-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white">Auto Insights</h3>
            <p className="text-xs text-white/50">{title || `${xCol} × ${yCol}`} · {summary.count} data points</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeak}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold ${isSpeaking ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/10 text-white/50'}`}
            title={isSpeaking ? "Stop reading" : "Listen to analysis"}
          >
            {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? "Stop" : "Listen"}
          </button>
          <button onClick={loadAndAnalyze} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Refresh analysis">
            <RefreshCw className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/5 border-b border-white/10">
        {[
          { label: 'Total Volume', value: summary.total.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: 'Aggregate Sum' },
          { label: 'Mean Average', value: summary.average.toLocaleString(undefined, { maximumFractionDigits: 1 }), sub: 'Segment Average' },
          { label: 'Peak Performance', value: summary.max.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: 'Dataset Max' },
          { label: 'Performance Floor', value: summary.min.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: 'Dataset Min' },
        ].map(stat => (
          <div key={stat.label} className="px-6 py-5 text-left hover:bg-white/[0.02] transition-colors group">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold mb-1">{stat.label}</p>
            <p className="font-display font-bold text-white text-xl lg:text-2xl tracking-tight group-hover:text-blue-400 transition-colors">{stat.value}</p>
            <p className="text-[10px] text-white/20 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Trend Badge */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${summary.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
            summary.trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
              'bg-white/10 text-white/60'
          }`}>
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          {summary.trend === 'up' ? `Growing +${summary.growthRate.toFixed(1)}%` :
            summary.trend === 'down' ? `Declining ${summary.growthRate.toFixed(1)}%` :
              'Stable Trend'}
        </div>
        <span className="text-xs text-white/40">Std Dev: {summary.stdDev.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-1 border-b border-white/10">
          {[
            { key: 'narrative', label: 'Summary', icon: Sparkles },
            { key: 'insights', label: 'Insights', icon: Eye, count: insights.length },
            { key: 'forecast', label: 'Forecast', icon: TrendingUp },
            { key: 'correlations', label: 'Correlations', icon: GitBranch, count: correlations.length },
            { key: 'whatif', label: 'What-If', icon: Play },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.key
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-white/50 hover:text-white/70'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.key ? 'bg-primary-500/20 text-primary-400' : 'bg-white/10 text-white/60'}`}>
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
            <div className="bg-primary-500/10 rounded-xl p-5 border border-primary-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-12 h-12 text-royalblue-600" />
              </div>
              <h4 className="text-sm font-bold text-primary-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Data Narrative
              </h4>
              <div className="space-y-4 text-white/70 leading-relaxed text-sm">
                {result.narrative.split('\n').map((line, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ 
                    __html: line.replace(new RegExp('\\*\\*(.*?)\\*\\*', 'g'), '<strong class="text-white font-bold">$1</strong>')
                  }} />
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSpeak}
                  className="text-xs font-bold text-[#2563EB] hover:text-primary-400 flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-tertiary)] rounded-full shadow-lg border border-primary-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Sparkles className="w-3 h-3" />}
                  {isSpeaking ? "Stop Reading" : "Read Strategic Audit"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1">Trend Strength</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${summary.trendStrength * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-white/70">{(summary.trendStrength * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/5/30">
                <p className="text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1">Consistency</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(0, 100 - (summary.stdDev / summary.average * 100))}%` }} />
                  </div>
                  <span className="text-sm font-bold text-white/70">{Math.max(0, 100 - (summary.stdDev / summary.average * 100)).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.length === 0 && (
              <p className="col-span-full text-white/40 text-sm text-center py-12 border border-dashed border-white/10 rounded-2xl">No significant patterns detected in current slice.</p>
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
              <p className="text-white/40 text-sm text-center py-4">Not enough data for forecasting (need at least 3 rows).</p>
            ) : (
              <>
                <p className="text-xs text-white/50 mb-4">
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
                    <div key={i} className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2.5 text-center">
                      <p className="text-xs text-indigo-400 font-medium">{p.name}</p>
                      <p className="text-base font-bold text-indigo-400 mt-0.5">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {correlations.length === 0 ? (
              <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-2xl">
                <GitBranch className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No strong multi-dimensional correlations found.</p>
                <p className="text-white/30 text-xs mt-1">Direct dependencies above 0.6 will be mapped here.</p>
              </div>
            ) : (
              correlations.map((corr, i) => (
                <div key={i} className="rounded-2xl border border-[var(--border)] bg-white/[0.02] px-5 py-4 hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                       <span className="text-sm font-bold text-white/80 tracking-tight group-hover:text-blue-400 transition-colors">
                        {corr.colA} <span className="text-white/20 px-1">×</span> {corr.colB}
                       </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${corr.r > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                      R = {corr.r.toFixed(2)}
                    </span>
                  </div>
                  {/* Correlation bar */}
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
                    <div
                      className={`absolute top-0 h-full rounded-full transition-all duration-1000 ${corr.r > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ width: `${Math.abs(corr.r) * 100}%`, left: corr.r < 0 ? `${(1 - Math.abs(corr.r)) * 100}%` : 0 }}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-4 leading-relaxed">{corr.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* WHAT-IF TAB */}
        {activeTab === 'whatif' && (
          <ScenarioSandbox summary={summary} yCol={yCol} />
        )}
      </div>

      {/* Prophet Chatbot Integration */}
      <DataChatbot 
        datasetName={dataset.name} 
        analysis={result} 
        xCol={xCol} 
        yCol={yCol} 
        rawRows={rows} 
      />
    </div>
  )
}
function ScenarioSandbox({ summary, yCol }: { summary: any, yCol: string }) {
  const [multiplier, setMultiplier] = useState(10) // +10%

  const simulatedTotal = summary.total * (1 + multiplier / 100)
  const simulatedAvg = summary.average * (1 + multiplier / 100)
  const impact = simulatedTotal - summary.total

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        <h4 className="font-bold text-indigo-400 flex items-center gap-2 mb-4">
          <Play className="w-4 h-4" /> Scenario Modeling Sandbox
        </h4>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Adjust {yCol} variable</span>
            <span className={`text-sm font-bold ${multiplier >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {multiplier > 0 ? '+' : ''}{multiplier}% impact
            </span>
          </div>
          <input 
            type="range" 
            min="-50" 
            max="100" 
            value={multiplier}
            onChange={(e) => setMultiplier(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-white/30 font-bold uppercase">
            <span>-50% Contraction</span>
            <span>+100% Growth</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-white/[0.02]">
          <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Simulated Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{simulatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className={`text-xs font-bold ${multiplier >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ({multiplier > 0 ? '+' : ''}{impact.toLocaleString(undefined, { maximumFractionDigits: 0 })})
            </span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-white/[0.02]">
          <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Simulated Average</p>
          <span className="text-2xl font-bold text-white">{simulatedAvg.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-white/60 leading-relaxed">
          Prophet AI predicts that a **{multiplier}%** adjustment to the **{yCol}** index would result in a {multiplier > 0 ? 'net gain' : 'net loss'} of **{Math.abs(impact).toLocaleString()} units**. 
          This would move your current {summary.trend} trend into a {multiplier > 0 ? 'accelerated growth' : 'managed contraction'} phase.
        </p>
      </div>
    </div>
  )
}
