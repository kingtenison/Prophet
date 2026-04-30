'use client'

import { useState, useRef, useEffect } from 'react'
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
  TrendingUp,
  AlertCircle
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }])
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const response = processQuery(userMsg.toLowerCase())
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
      setIsTyping(false)
    }, 1000)
  }

  const processQuery = (query: string): string => {
    // 1. STATISTICAL QUERIES
    if (query.includes('average') || query.includes('mean')) {
      return `The average **${yCol}** across all ${analysis.summary.count} segments is **${analysis.summary.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}**.`
    }
    if (query.includes('total') || query.includes('sum')) {
      return `The total aggregate for **${yCol}** is **${analysis.summary.total.toLocaleString()}**.`
    }
    if (query.includes('max') || query.includes('highest') || query.includes('top')) {
      const top = analysis.insights.find(i => i.id === 'top-performer')
      return `The highest value is **${analysis.summary.max.toLocaleString()}**, achieved by **${top?.title.replace('🏆 Top Performer: ', '') || 'the top segment'}**.`
    }
    if (query.includes('min') || query.includes('lowest') || query.includes('bottom')) {
      return `The lowest recorded value for **${yCol}** is **${analysis.summary.min.toLocaleString()}**.`
    }

    // 2. TREND & FORECAST
    if (query.includes('trend') || query.includes('direction') || query.includes('growth')) {
      const dir = analysis.summary.trend === 'up' ? 'upward' : analysis.summary.trend === 'down' ? 'downward' : 'stable'
      return `I detect a **${dir}** trend with a growth velocity of **${analysis.summary.growthRate.toFixed(1)}%**. Our model shows a confidence rating of **${(analysis.summary.trendStrength * 100).toFixed(0)}%** for this trajectory.`
    }
    if (query.includes('forecast') || query.includes('predict') || query.includes('future')) {
      const f = analysis.insights.find(i => i.category === 'forecast')
      return f ? f.description : "Based on the current variance, I predict the next period will align with the existing mean, but I recommend gathering 2-3 more data points for a high-confidence forecast."
    }

    // 3. RISK & ANOMALIES
    if (query.includes('risk') || query.includes('problem') || query.includes('issue') || query.includes('outlier')) {
      const outlier = analysis.insights.find(i => i.category === 'outlier')
      if (outlier) {
        return `I've identified a significant risk/outlier at **${outlier.title.replace('⚠️ Outlier Detected: ', '')}**. It deviates from the norm by ${outlier.value ? (Number(outlier.value) / analysis.summary.average).toFixed(1) : 'X'}x and should be audited for data integrity.`
      }
      return "I haven't detected any significant statistical anomalies or 'black swan' events in this specific slice of data. Operations appear stable."
    }

    // 4. COLUMN DISCOVERY
    if (query.includes('columns') || query.includes('data') || query.includes('fields')) {
      const cols = Object.keys(rawRows[0] || {}).join(', ')
      return `This dataset contains the following dimensions: **${cols}**. I am currently optimized to analyze **${yCol}** against **${xCol}**.`
    }

    // 5. SEGMENT LOOKUP (Keyword matching)
    for (const row of rawRows) {
      const label = String(row[xCol]).toLowerCase()
      if (query.includes(label)) {
        return `Analyzing **${row[xCol]}**: The recorded ${yCol} is **${Number(row[yCol]).toLocaleString()}**. Compared to the average, this segment is performing **${Number(row[yCol]) > analysis.summary.average ? 'above' : 'below'}** the mean by **${Math.abs((Number(row[yCol]) / analysis.summary.average - 1) * 100).toFixed(1)}%**.`
      }
    }

    // 6. DEFAULT
    return "I'm not sure I understand that specific question. You can ask me about **averages**, **trends**, **top performers**, **forecasts**, or even specific categories like '" + (rawRows[0]?.[xCol] || 'segment name') + "'."
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
                  <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>') }} />
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
               {['Trend?', 'Average?', 'Top Segment?'].map(chip => (
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
