'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  Loader2, 
  Database,
} from 'lucide-react'
import { AnalysisResult } from '@/lib/data/insights'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DataChatbotProps {
  datasetName: string
  analysis: AnalysisResult
  xCol: string
  yCol: string
  rawRows: any[]
}

export function DataChatbot({ datasetName, analysis, xCol, yCol, rawRows }: DataChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am the Prophet Intelligence Assistant. I've analyzed the **${datasetName}** dataset focusing on **${yCol}** vs **${xCol}**. How can I help you explore this data today?`,
      timestamp: new Date()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const topSegments = useMemo(() => {
    if (!rawRows.length || !xCol || !yCol) return []
    return [...rawRows]
      .sort((a, b) => Number(b[yCol] || 0) - Number(a[yCol] || 0))
      .slice(0, 3)
  }, [rawRows, xCol, yCol])

  const bottomSegments = useMemo(() => {
    if (!rawRows.length || !xCol || !yCol) return []
    return [...rawRows]
      .sort((a, b) => Number(a[yCol] || 0) - Number(b[yCol] || 0))
      .slice(0, 3)
  }, [rawRows, xCol, yCol])

  const allValues = useMemo(() => {
    return rawRows.map(r => Number(r[yCol])).filter(v => !isNaN(v))
  }, [rawRows, yCol])

  const median = useMemo(() => {
    if (!allValues.length) return 0
    const sorted = [...allValues].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }, [allValues])

  const stdDev = useMemo(() => {
    if (allValues.length < 2) return 0
    const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length
    return Math.sqrt(allValues.reduce((sq, v) => sq + (v - mean) ** 2, 0) / allValues.length)
  }, [allValues])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }])
    setIsTyping(true)

    setTimeout(() => {
      const response = processQuery(userMsg.toLowerCase())
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
      setIsTyping(false)
    }, 800)
  }

  const processQuery = (query: string): string => {
    const avg = analysis.summary.average
    const total = analysis.summary.total
    const max = analysis.summary.max
    const min = analysis.summary.min
    const count = analysis.summary.count

    // 1. COMPARISON queries
    if (query.includes('compare') || query.includes('versus') || query.includes(' vs ') || query.includes('difference')) {
      const parts = query.split(/compare|versus|vs|difference between|and/).filter(p => p.trim().length > 2)
      const matchedRows = parts.map(p => rawRows.find(r =>
        String(r[xCol]).toLowerCase().includes(p.trim())
      )).filter(Boolean)
      if (matchedRows.length >= 2) {
        return matchedRows.map(r =>
          `**${r[xCol]}**: ${yCol} = **${Number(r[yCol]).toLocaleString()}** (${((Number(r[yCol]) / avg - 1) * 100).toFixed(1)}% vs average)`
        ).join('\n\n')
      }
    }

    // 2. PERCENTAGE / SHARE queries
    if (query.includes('percentage') || query.includes('share') || query.includes('proportion') || query.includes('%')) {
      const matched = rawRows.find(r =>
        String(r[xCol]).toLowerCase().includes(query.split(' ').filter(w => w.length > 3)[0] || '')
      )
      if (matched) {
        const share = ((Number(matched[yCol]) / total) * 100).toFixed(1)
        return `**${matched[xCol]}** accounts for **${share}%** of total ${yCol} (${Number(matched[yCol]).toLocaleString()} out of ${total.toLocaleString()}).`
      }
      return `The total ${yCol} is **${total.toLocaleString()}**. The average across ${count} segments is **${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}** per segment.`
    }

    // 3. CORRELATION queries
    if (query.includes('correlation') || query.includes('relationship') || query.includes('relate')) {
      return `I'm analyzing **${xCol}** vs **${yCol}** across **${count}** data points. The variance is **${stdDev.toFixed(1)}** and the median value is **${median.toLocaleString(undefined, { maximumFractionDigits: 2 })}**. A ${stdDev > avg * 0.5 ? 'high' : 'low'} standard deviation suggests ${stdDev > avg * 0.5 ? 'significant variation' : 'consistent values'} across ${xCol} segments.`
    }

    // 4. DISTRIBUTION queries
    if (query.includes('distribution') || query.includes('range') || query.includes('spread') || query.includes('variance')) {
      return `**${yCol}** distribution across **${count}** segments:\n- Range: **${min.toLocaleString()}** to **${max.toLocaleString()}**\n- Average: **${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}**\n- Median: **${median.toLocaleString(undefined, { maximumFractionDigits: 2 })}**\n- Std Deviation: **${stdDev.toFixed(1)}**`
    }

    // 5. RANKING queries
    if (query.includes('rank') || query.includes('order') || query.includes('sort') || query.includes('sorted')) {
      const top3 = topSegments
      const bottom3 = bottomSegments
      let response = `**Top 3 ${xCol} by ${yCol}:**\n`
      top3.forEach((r, i) => { response += `${i + 1}. ${r[xCol]}: **${Number(r[yCol]).toLocaleString()}**\n` })
      response += `\n**Bottom 3 ${xCol}:**\n`
      bottom3.forEach((r, i) => { response += `${count - 2 + i}. ${r[xCol]}: **${Number(r[yCol]).toLocaleString()}**\n` })
      return response
    }

    // 6. STATISTICAL QUERIES
    if (query.includes('average') || query.includes('mean') || query.includes('typical')) {
      return `The average **${yCol}** across all **${count}** segments is **${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}**. The median is **${median.toLocaleString(undefined, { maximumFractionDigits: 2 })}**.`
    }
    if (query.includes('total') || query.includes('sum') || query.includes('overall')) {
      return `The total aggregate for **${yCol}** is **${total.toLocaleString()}**, spanning **${count}** ${xCol} segments.`
    }
    if (query.includes('max') || query.includes('highest') || query.includes('top') || query.includes('best')) {
      const top = topSegments[0]
      return `The highest value is **${max.toLocaleString()}**, achieved by **${top?.[xCol] || 'the top segment'}**.`
    }
    if (query.includes('min') || query.includes('lowest') || query.includes('bottom') || query.includes('worst')) {
      const bottom = bottomSegments[0]
      return `The lowest recorded value for **${yCol}** is **${min.toLocaleString()}** (**${bottom?.[xCol] || 'unknown segment'}**).`
    }

    // 7. TREND & FORECAST
    if (query.includes('trend') || query.includes('direction') || query.includes('growth') || query.includes('momentum')) {
      const dir = analysis.summary.trend === 'up' ? 'upward' : analysis.summary.trend === 'down' ? 'downward' : 'stable'
      const trendStr = analysis.summary.trendStrength ? (analysis.summary.trendStrength * 100).toFixed(0) : 'N/A'
      return `I detect a **${dir}** trend with a growth velocity of **${analysis.summary.growthRate.toFixed(1)}%**. Our model shows a confidence rating of **${trendStr}%** for this trajectory.`
    }
    if (query.includes('forecast') || query.includes('predict') || query.includes('future') || query.includes('next')) {
      const f = analysis.insights.find(i => i.category === 'forecast')
      return f ? f.description : "Based on the current variance, I predict the next period will align with the existing mean. The current average is **" + avg.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "** with a standard deviation of **" + stdDev.toFixed(1) + "**."
    }

    // 8. RISK & ANOMALIES
    if (query.includes('risk') || query.includes('problem') || query.includes('issue') || query.includes('outlier') || query.includes('anomaly')) {
      const outlier = analysis.insights.find(i => i.category === 'outlier')
      if (outlier) {
        const deviation = avg > 0 ? (Number(outlier.value) / avg).toFixed(1) : 'X'
        return `I've identified a significant outlier at **${outlier.title.replace('⚠️ Outlier Detected: ', '')}**. It deviates from the norm by **${deviation}x** (value: **${Number(outlier.value).toLocaleString()}** vs avg **${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}**).`
      }
      return "I haven't detected any significant statistical anomalies in this dataset. The values range from **" + min.toLocaleString() + "** to **" + max.toLocaleString() + "** with a standard deviation of **" + stdDev.toFixed(1) + "**."
    }

    // 9. COLUMN DISCOVERY
    if (query.includes('columns') || query.includes('data') || query.includes('fields') || query.includes('schema') || query.includes('structure')) {
      const cols = Object.keys(rawRows[0] || {}).join(', ')
      return `This dataset contains the following dimensions: **${cols}**. I am currently optimized to analyze **${yCol}** against **${xCol}**. There are **${count}** rows of data.`
    }

    // 10. SPECIFIC SEGMENT LOOKUP
    for (const row of rawRows) {
      const label = String(row[xCol]).toLowerCase()
      if (query.includes(label)) {
        const segAvg = Number(row[yCol])
        const comparison = avg > 0 ? Math.abs((segAvg / avg - 1) * 100).toFixed(1) : '0'
        const direction = segAvg > avg ? 'above' : segAvg < avg ? 'below' : 'at'
        return `Analyzing **${row[xCol]}**: The recorded ${yCol} is **${segAvg.toLocaleString()}**.\n- **${comparison}%** ${direction} the average of **${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}**\n- Represents **${total > 0 ? ((segAvg / total) * 100).toFixed(1) : '0'}%** of total ${yCol}`
      }
    }

    // 11. DEFAULT with context-aware suggestions
    return `I'm not sure I understand that specific question. Here's what I can tell you about the data:\n\n` +
      `- **Average ${yCol}**: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n` +
      `- **Total ${yCol}**: ${total.toLocaleString()}\n` +
      `- **Top segment**: ${topSegments[0]?.[xCol] || 'N/A'} (${Number(topSegments[0]?.[yCol] || 0).toLocaleString()})\n` +
      `- **Data points**: ${count} segments analyzed\n\n` +
      `Try asking about: **averages**, **trends**, **top performers**, **rankings**, ` +
      `**distribution**, **percentages**, **comparisons**, or specific segment names.`
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 animate-bounce"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col shadow-2xl border-white/10 bg-[#0d0d0d] z-50 animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Prophet Assistant</h3>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Live Data Engine</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/5 text-white/80 border border-[var(--border)] rounded-tl-none'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>').replace(/\n/g, '<br/>') }} />
                  <p className="text-[10px] opacity-30 mt-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-[var(--border)]">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] bg-[var(--bg-primary)]/40">
            <div className="relative">
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your data..."
                className="bg-white/5 border-white/10 pr-10 focus:ring-blue-500"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:opacity-50"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
               {['Trend?', 'Distribution?', 'Top Segment?', 'Rank?'].map(chip => (
                 <button 
                  key={chip}
                  type="button"
                  onClick={() => {
                    setInput(chip)
                  }}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 border border-[var(--border)] text-[10px] text-white/40 hover:bg-white/10 hover:text-white transition-all"
                 >
                   {chip}
                 </button>
               ))}
            </div>
          </form>
        </Card>
      )}
    </>
  )
}
