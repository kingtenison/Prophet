'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Globe, Link2, Loader2, ArrowRight } from 'lucide-react'

export function GoogleSheetsConnect({ onDataLoaded }: { onDataLoaded: (data: string) => void }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    
    try {
      // Import dynamically to avoid SSR issues
      const { fetchGoogleSheetData } = await import('@/lib/data/google')
      const data = await fetchGoogleSheetData(url)
      onDataLoaded(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 border-dashed border-2 border-white/10 bg-white/[0.02]">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-4 bg-emerald-500/10 rounded-2xl">
          <Globe className="w-10 h-10 text-emerald-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Connect Live Google Sheet</h2>
          <p className="text-sm text-white/50 max-w-sm">
            Paste your public Google Sheets URL below. We'll automatically fetch the data for analysis.
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              placeholder="https://docs.google.com/spreadsheets/d/..." 
              className="pl-10"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
          
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={handleConnect}
            disabled={loading || !url}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            Connect Live Stream
          </Button>
        </div>

        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
          Sheet must be shared with "Anyone with the link"
        </p>
      </div>
    </Card>
  )
}
