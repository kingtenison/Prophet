'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Bell, AlertTriangle, CheckCircle, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

interface AlertRule {
  id: string
  metric: string
  condition: 'above' | 'below'
  threshold: number
  isActive: boolean
}

export function AlertManager({ data, title }: { data: any[], title: string }) {
  const [alerts, setAlerts] = useState<AlertRule[]>([
    { id: '1', metric: 'Volume', condition: 'below', threshold: 100, isActive: true }
  ])
  const [triggered, setTriggered] = useState<string[]>([])
  const { addToast } = useToast()

  useEffect(() => {
    const currentVal = data.reduce((acc, d) => acc + (d.value || 0), 0)
    
    alerts.forEach(rule => {
      const isMet = rule.condition === 'above' ? currentVal > rule.threshold : currentVal < rule.threshold
      
      if (isMet && rule.isActive && !triggered.includes(rule.id)) {
        setTriggered(prev => [...prev, rule.id])
        addToast({
          type: 'error',
          title: `ALERT: ${title}`,
          description: `${rule.metric} is ${rule.condition} ${rule.threshold} (Current: ${currentVal.toFixed(0)})`
        })
      }
    })
  }, [data, alerts, title, triggered])

  if (triggered.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full animate-in slide-in-from-right-4">
      {triggered.map(id => {
        const rule = alerts.find(r => r.id === id)
        if (!rule) return null
        return (
          <Card key={id} className="p-4 bg-rose-900/90 border-rose-500/50 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Critical Threshold Met</h4>
                  <p className="text-xs text-rose-100/70 mt-1">
                    {rule.metric} dropped below strategic safety floor of {rule.threshold}.
                  </p>
                </div>
              </div>
              <button onClick={() => setTriggered(prev => prev.filter(t => t !== id))} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
