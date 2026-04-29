'use client'

import { useState, useRef } from 'react'
import { 
  Building2, MapPin, Search, Target, Compass, 
  TrendingUp, ShieldCheck, Zap, Globe, BarChart3,
  Users, DollarSign, Star, ArrowRight, Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts'

export default function MarketResearchPage() {
  const [step, setStep] = useState<'input' | 'searching' | 'results'>('input')
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    location: ''
  })
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoCoords, setGeoCoords] = useState<{ lat: number, lon: number } | null>(null)

  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchingName, setSearchingName] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleUseLocation = () => {
    setGeoLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setGeoCoords({ lat: latitude, lon: longitude })
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
          setGeoLoading(false)
        },
        () => {
          alert("Could not retrieve location.")
          setGeoLoading(false)
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setGeoLoading(false)
    }
  }

  const handleNameChange = async (val: string) => {
    setFormData({ ...formData, businessName: val })
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    
    if (val.length > 1) {
      setSearchingName(true)
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/market/autocomplete?q=${encodeURIComponent(val)}`)
          if (res.ok) {
            const data = await res.json()
            setSuggestions(data || [])
            setShowSuggestions(true)
          }
        } catch (err) {
          console.error('Detection failed')
        } finally {
          setSearchingName(false)
        }
      }, 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setSearchingName(false)
    }
  }

  const selectSuggestion = (s: any) => {
    setFormData({
      businessName: s.name,
      businessType: (s.type || '').replace(/_/g, ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()),
      location: s.location
    })
    setGeoCoords({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) })
    setShowSuggestions(false)
  }

  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStep('searching')
    
    try {
      const res = await fetch('/api/market/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, coords: geoCoords })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'The market audit engine is currently busy. Please wait a moment.')
      
      setAnalysis(data)
      setStep('results')
    } catch (err: any) {
      setError(err.message)
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[black]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgba(37,99,235,0.15)] rounded-2xl mb-6 text-[#2563EB] border border-primary-500/20">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Market Intelligence</h1>
          <p className="text-white/50 mt-3 text-lg max-w-2xl mx-auto">
            Discover your competitive advantage with live, AI-driven market audits.
          </p>
        </div>

        {step === 'input' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 animate-in shake duration-500">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            <Card className="p-8 shadow-elevated border-white/10 bg-[#111]">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2563EB]" /> Organization Name
                  </label>
                  <div className="relative">
                    <Input 
                      placeholder="Search your organization..." 
                      value={formData.businessName}
                      onChange={e => handleNameChange(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      required
                      className="h-12 text-lg pr-10"
                      autoComplete="off"
                    />
                    {searchingName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                      </div>
                    )}
                  </div>
                   {showSuggestions && suggestions.length > 0 && (
                     <div className="absolute z-50 w-full mt-1 bg-[#111] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-100">
                       {suggestions.map((s) => (
                         <button
                           key={s.id || s.place_id}
                           type="button"
                           onClick={() => selectSuggestion(s)}
                           className="w-full px-4 py-3 text-left hover:bg-white/[0.02] transition-colors border-b last:border-b-0 border-white/5 group"
                         >
                           <div className="font-bold text-white group-hover:text-[#2563EB] transition-colors">{s.name}</div>
                           <div className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1">
                             <MapPin className="w-3 h-3" /> {s.location}
                           </div>
                           <div className="text-[10px] font-bold text-[#2563EB] uppercase mt-1 tracking-wider">{s.type}</div>
                         </button>
                       ))}
                     </div>
                   )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#2563EB]" /> Business Category
                    </label>
                    <Input 
                      placeholder="e.g. Coffee Shop" 
                      value={formData.businessType}
                      onChange={e => setFormData({...formData, businessType: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2563EB]" /> Location
                    </label>
                    <div className="relative group">
                      <Input 
                        placeholder="e.g. London, UK" 
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        required={!geoCoords}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={handleUseLocation}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${geoCoords ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB]' : 'hover:bg-white/[0.02] text-white/30'}`}
                        title="Use my current location"
                      >
                        {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                      </button>
                    </div>
                    {geoCoords && (
                      <p className="text-[10px] text-[#2563EB] font-semibold animate-in fade-in slide-in-from-top-1">
                        Using live GPS coordinates
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold gap-2 shadow-lg shadow-[rgba(37,99,235,0.2)]"
                  disabled={loading || geoLoading}
                >
                  <Search className="w-5 h-5" /> Start Competitive Analysis
                </Button>
              </form>
            </Card>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              {[
                { icon: Globe, label: 'Real-time Search' },
                { icon: Users, label: 'Competitor Profiling' },
                { icon: TrendingUp, label: 'Gap Analysis' }
              ].map((item, i) => (
                <div key={item.label} className="p-4 rounded-xl bg-[#111] border border-white/5 shadow-sm">
                  <item.icon className="w-5 h-5 text-white/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'searching' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="relative mb-8">
              <div className="w-32 h-32 border-4 border-primary-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-12 h-12 text-[#2563EB] animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold">Gathering Intelligence</h2>
            <p className="text-white/50 mt-2">Searching for {formData.businessType}s in {formData.location}...</p>
            
            <div className="mt-12 space-y-3 w-full max-w-md">
              <div className="flex items-center gap-3 text-sm text-white/50 px-4 py-2 bg-[#111] rounded-lg border border-white/5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Scanning local business directories...
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50 px-4 py-2 bg-[#111] rounded-lg border border-white/5 opacity-60">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                Analyzing competitor reviews and ratings...
              </div>
            </div>
          </div>
        )}

        {step === 'results' && analysis && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Summary Banner */}
            <Card className="p-6 bg-gradient-to-r from-[#111318] to-indigo-900/50 text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Target className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Badge variant="secondary" className="bg-[rgba(37,99,235,0.15)] text-[#a5adff] border-primary-500/20 mb-2">Analysis Complete</Badge>
                  <h2 className="text-2xl font-bold font-display">{formData.businessName} Market Outlook</h2>
                  <p className="text-indigo-100/80 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {analysis.location?.name || analysis.summary}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setStep('input')} className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  New Search
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Strategic Insights */}
              <div className="lg:col-span-2 space-y-8">
                {(!analysis.competitors || analysis.competitors.length === 0) ? (
                  <Card className="p-12 text-center bg-gradient-to-br from-primary-500/10 to-indigo-500/10 border border-primary-500/20 border-dashed">
                    <Globe className="w-16 h-16 text-[#2563EB]/50 mx-auto mb-6" />
                    <h3 className="text-2xl font-display font-bold text-white">National Market Gap Identified</h3>
                    <p className="text-white/50 mt-2 max-w-md mx-auto">
                      We couldn't find any direct competitors in this category across your entire country. This is a <strong className="text-white">National Blue Ocean Opportunity</strong> for {formData.businessName}.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                      <div className="bg-[#111] p-4 rounded-xl border border-primary-500/20 text-left">
                        <Zap className="w-5 h-5 text-amber-500 mb-2" />
                        <h4 className="font-bold text-sm text-white">First Mover Advantage</h4>
                        <p className="text-xs text-white/50">Be the first to establish brand authority in {formData.location}.</p>
                      </div>
                      <div className="bg-[#111] p-4 rounded-xl border border-primary-500/20 text-left">
                        <Target className="w-5 h-5 text-[#2563EB] mb-2" />
                        <h4 className="font-bold text-sm text-white">Captive Audience</h4>
                        <p className="text-xs text-white/50">Serve customers who currently have to travel far for {formData.businessType} services.</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <>
                  </>
                )}

                {/* AI Strategic Overview */}
                <Card className="p-8 border-primary-500/30 bg-gradient-to-br from-[#111] to-primary-900/10 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Compass className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-primary-500" /> Executive AI Strategic Overview
                    </h3>
                    <div className="prose prose-invert max-w-none text-white/70 text-sm md:text-base">
                      {analysis.aiOverview?.split('\n\n').map((paragraph: string, idx: number) => (
                        <p key={idx} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{__html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}} />
                      ))}
                    </div>
                  </div>
                </Card>

                {/* BCG & SPACE Matrices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-6 bg-[#111] border-white/5">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#2563EB]" /> BCG Matrix Position
                    </h3>
                    <div className="grid grid-cols-2 gap-2 h-48">
                      {['Stars', 'Question Marks', 'Cash Cows', 'Dogs'].map((cat) => (
                        <div key={cat} className={`flex items-center justify-center p-4 rounded-xl border text-center text-sm transition-all duration-500 ${analysis.matrices?.bcg?.category === cat ? 'bg-primary-500/20 border-primary-500 text-primary-400 font-bold shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/10 text-white/30'}`}>
                          {cat}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-[#111] border-white/5">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-500" /> SPACE Matrix
                    </h3>
                    <div className="flex items-center justify-center h-48">
                      <div className="relative w-40 h-40">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-white/20" /></div>
                        <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-px bg-white/20" /></div>
                        {/* Labels */}
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-[10px] text-white/50 pb-1">FS</span>
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-[10px] text-white/50 pt-1">ES</span>
                        <span className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 text-[10px] text-white/50 pl-1">IS</span>
                        <span className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 text-[10px] text-white/50 pr-1">CA</span>
                        
                        {/* Quadrant Highlights */}
                        <div className={`absolute top-0 right-0 w-1/2 h-1/2 transition-colors duration-500 ${analysis.matrices?.space?.profile === 'Aggressive' ? 'bg-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]' : ''}`} />
                        <div className={`absolute bottom-0 right-0 w-1/2 h-1/2 transition-colors duration-500 ${analysis.matrices?.space?.profile === 'Competitive' ? 'bg-blue-500/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]' : ''}`} />
                        <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 transition-colors duration-500 ${analysis.matrices?.space?.profile === 'Defensive' ? 'bg-rose-500/20 shadow-[inset_0_0_10px_rgba(244,63,94,0.2)]' : ''}`} />
                        <div className={`absolute top-0 left-0 w-1/2 h-1/2 transition-colors duration-500 ${analysis.matrices?.space?.profile === 'Conservative' ? 'bg-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]' : ''}`} />
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg animate-in zoom-in duration-500 delay-300">
                            {analysis.matrices?.space?.profile}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* IFE & EFE Matrices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-6 bg-[#111] border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" /> Internal Factor (IFE)
                      </h3>
                      <Badge variant="secondary" className="font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{analysis.matrices?.ife?.total?.toFixed(2)}</Badge>
                    </div>
                    <div className="space-y-3">
                      {analysis.matrices?.ife?.factors?.map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <span className={f.type === 'Strength' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>{f.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/30 uppercase">Score</span>
                            <span className="text-white/70 font-mono text-xs bg-[#000] px-1.5 py-0.5 rounded border border-white/10">{(f.weight * f.rating).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-[#111] border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-500" /> External Factor (EFE)
                      </h3>
                      <Badge variant="secondary" className="font-mono bg-amber-500/10 text-amber-400 border-amber-500/20">{analysis.matrices?.efe?.total?.toFixed(2)}</Badge>
                    </div>
                    <div className="space-y-3">
                      {analysis.matrices?.efe?.factors?.map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <span className={f.type === 'Opportunity' ? 'text-blue-400 font-medium' : 'text-amber-400 font-medium'}>{f.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/30 uppercase">Score</span>
                            <span className="text-white/70 font-mono text-xs bg-[#000] px-1.5 py-0.5 rounded border border-white/10">{(f.weight * f.rating).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* CPM & QSPM Matrices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6 bg-[#111] border-white/5">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" /> Competitive Profile Matrix (CPM)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="text-white/40 border-b border-white/10">
                            <th className="pb-3 font-medium text-xs uppercase tracking-wider">Critical Success Factor</th>
                            <th className="pb-3 font-medium text-center text-primary-400">You</th>
                            {analysis.matrices?.cpm?.competitors?.map((c: any, i: number) => (
                              <th key={i} className="pb-3 font-medium text-center truncate max-w-[80px]" title={c.name}>{c.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {analysis.matrices?.cpm?.factors?.map((factor: string, i: number) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 text-white/70 font-medium">{factor}</td>
                              <td className="py-3.5 text-center font-mono text-primary-400 font-bold bg-primary-500/5">{analysis.matrices?.cpm?.user[i]}</td>
                              {analysis.matrices?.cpm?.competitors?.map((c: any, j: number) => (
                                <td key={j} className="py-3.5 text-center font-mono text-white/50">{c.scores[i]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-[#111] border-white/5">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-rose-500" /> QSPM Strategy Selection
                    </h3>
                    <p className="text-xs text-white/40 mb-6">Quantitative evaluation of strategic alternatives based on internal and external factors.</p>
                    <div className="space-y-4">
                      {analysis.matrices?.qspm?.strategies?.map((strategy: string, i: number) => {
                        const score = analysis.matrices?.qspm?.scores[i];
                        const isWinner = score === Math.max(...analysis.matrices?.qspm?.scores);
                        return (
                          <div key={i} className={`p-4 rounded-xl border transition-all duration-500 ${isWinner ? 'bg-primary-500/10 border-primary-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 opacity-70 grayscale'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <span className={`font-semibold text-sm ${isWinner ? 'text-primary-400' : 'text-white/70'}`}>{strategy}</span>
                              <Badge variant={isWinner ? 'primary' : 'secondary'} className="font-mono bg-[#000] border-white/10">{score?.toFixed(2)}</Badge>
                            </div>
                            <div className="w-full h-2 bg-[#000] rounded-full overflow-hidden border border-white/5">
                              <div className={`h-full transition-all duration-1000 ease-out ${isWinner ? 'bg-gradient-to-r from-primary-600 to-primary-400' : 'bg-white/20'}`} style={{ width: `${(score / 5) * 100}%` }} />
                            </div>
                            {isWinner && (
                              <p className="text-[10px] text-primary-400/80 mt-2 font-medium flex items-center gap-1 uppercase tracking-wider">
                                <Star className="w-3 h-3" /> Recommended Strategy
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Prophet's Strategic Solutions Side Bar */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2 mb-2">
                  <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
                    <Compass className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">Prophet's Solutions</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Actionable Strategic Advice</p>
                  </div>
                </div>

                {(analysis.propheticSolutions || []).map((solution: any, idx: number) => (
                  <Card key={idx} className="p-6 border-white/10 bg-[#111] hover:border-primary-500/40 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="relative z-10">
                      <Badge variant="secondary" className="mb-3 bg-primary-500/10 text-primary-400 border-primary-500/20">{solution.category}</Badge>
                      <h4 className="font-bold text-white text-lg mb-2 group-hover:text-[#2563EB] transition-colors">{solution.title}</h4>
                      <p className="text-sm text-white/60 mb-5 leading-relaxed">{solution.description}</p>
                      
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-1">Recommended Tactics</p>
                        <ul className="space-y-2.5">
                          {solution.tactics.map((tactic: string, i: number) => (
                            <li key={i} className="text-xs text-white/70 flex items-start gap-2.5 leading-relaxed">
                              <div className="w-4 h-4 rounded bg-primary-500/10 border border-primary-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <ArrowRight className="w-2.5 h-2.5 text-primary-400" />
                              </div>
                              {tactic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
                
                 <Card className="p-6 bg-gradient-to-br from-primary-500/20 to-indigo-500/20 text-white border-none mt-8">
                   <h4 className="font-bold mb-2">Ready to execute?</h4>
                   <p className="text-xs text-white/60/70 mb-4">Export these solutions to your strategic execution team.</p>
                   <Button variant="secondary" className="w-full bg-white/10 text-white font-bold hover:bg-white/20 border-white/20 shadow-lg">
                     Export Strategy Deck
                   </Button>
                 </Card>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

