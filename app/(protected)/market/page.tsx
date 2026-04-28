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
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6 text-primary-600 shadow-sm border border-primary-200">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold text-secondary-900 tracking-tight">Market Intelligence</h1>
          <p className="text-secondary-500 mt-3 text-lg max-w-2xl mx-auto">
            Discover your competitive advantage with live, AI-driven market audits.
          </p>
        </div>

        {step === 'input' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 animate-in shake duration-500">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            <Card className="p-8 shadow-premium border-secondary-200/60 bg-white">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-secondary-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-500" /> Organization Name
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
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                      </div>
                    )}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-100">
                      {suggestions.map((s) => (
                        <button
                          key={s.id || s.place_id}
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          className="w-full px-4 py-3 text-left hover:bg-secondary-50 transition-colors border-b last:border-b-0 border-secondary-100 group"
                        >
                          <div className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">{s.name}</div>
                          <div className="text-[10px] text-secondary-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {s.location}
                          </div>
                          <div className="text-[10px] font-bold text-primary-500 uppercase mt-1 tracking-wider">{s.type}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-700 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary-500" /> Business Category
                    </label>
                    <Input 
                      placeholder="e.g. Coffee Shop" 
                      value={formData.businessType}
                      onChange={e => setFormData({...formData, businessType: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-500" /> Location
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
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${geoCoords ? 'bg-primary-100 text-primary-600' : 'hover:bg-secondary-100 text-secondary-400'}`}
                        title="Use my current location"
                      >
                        {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                      </button>
                    </div>
                    {geoCoords && (
                      <p className="text-[10px] text-primary-600 font-semibold animate-in fade-in slide-in-from-top-1">
                        Using live GPS coordinates
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold gap-2 shadow-lg shadow-primary-500/20"
                  disabled={loading || geoLoading}
                >
                  <Search className="w-5 h-5" /> Start Competitive Analysis
                </Button>
              </form>
            </Card>
            
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Globe, label: 'Real-time Search' },
                { icon: Users, label: 'Competitor Profiling' },
                { icon: TrendingUp, label: 'Gap Analysis' }
              ].map((item, i) => (
                <div key={item.label} className="p-4 rounded-xl bg-white border border-secondary-100 shadow-sm">
                  <item.icon className="w-5 h-5 text-secondary-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-secondary-600 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'searching' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="relative mb-8">
              <div className="w-32 h-32 border-4 border-primary-100 rounded-full animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-12 h-12 text-primary-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-secondary-900">Gathering Intelligence</h2>
            <p className="text-secondary-500 mt-2">Searching for {formData.businessType}s in {formData.location}...</p>
            
            <div className="mt-12 space-y-3 w-full max-w-md">
              <div className="flex items-center gap-3 text-sm text-secondary-600 px-4 py-2 bg-white rounded-lg border border-secondary-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Scanning local business directories...
              </div>
              <div className="flex items-center gap-3 text-sm text-secondary-600 px-4 py-2 bg-white rounded-lg border border-secondary-100 opacity-60">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                Analyzing competitor reviews and ratings...
              </div>
            </div>
          </div>
        )}

        {step === 'results' && analysis && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Summary Banner */}
            <Card className="p-6 bg-gradient-to-r from-secondary-900 to-indigo-900 text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Target className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Badge className="bg-primary-500 mb-2 border-none">Analysis Complete</Badge>
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
                  <Card className="p-12 text-center bg-gradient-to-br from-primary-50 to-indigo-50 border-primary-100 border-2 border-dashed">
                    <Globe className="w-16 h-16 text-primary-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-display font-bold text-secondary-900">National Market Gap Identified</h3>
                    <p className="text-secondary-600 mt-2 max-w-md mx-auto">
                      We couldn't find any direct competitors in this category across your entire country. This is a <strong>National Blue Ocean Opportunity</strong> for {formData.businessName}.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                      <div className="bg-white p-4 rounded-xl border border-primary-100 text-left">
                        <Zap className="w-5 h-5 text-amber-500 mb-2" />
                        <h4 className="font-bold text-sm">First Mover Advantage</h4>
                        <p className="text-xs text-secondary-500">Be the first to establish brand authority in {formData.location}.</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-primary-100 text-left">
                        <Target className="w-5 h-5 text-primary-500 mb-2" />
                        <h4 className="font-bold text-sm">Captive Audience</h4>
                        <p className="text-xs text-secondary-500">Serve customers who currently have to travel far for {formData.businessType} services.</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* Visual Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="p-6">
                        <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary-500" /> Price vs Rating Landscape
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis type="number" dataKey="priceIndex" name="Price" unit="$" tick={{ fontSize: 10 }} label={{ value: 'Price Level', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                              <YAxis type="number" dataKey="rating" name="Rating" domain={[0, 5]} tick={{ fontSize: 10 }} label={{ value: 'User Rating', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <ZAxis type="number" dataKey="digitalPresence" range={[50, 400]} name="Digital Reach" />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Scatter name="Competitors" data={analysis.competitors || []} fill="#6366f1">
                                {(analysis.competitors || []).map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : '#6366f1'} />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" /> Digital Visibility Index
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysis.competitors || []} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                              <XAxis type="number" domain={[0, 100]} hide />
                              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} />
                              <Tooltip />
                              <Bar dataKey="digitalPresence" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </div>
                  </>
                )}

                {/* Organization Audit & SWOT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-6 border-primary-100 bg-primary-50/10">
                    <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary-600" /> Digital Footprint Audit
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary-100">
                        <span className="text-sm text-secondary-600">Web Presence</span>
                        <Badge variant={analysis.userAudit?.website ? 'success' : 'danger'}>
                          {analysis.userAudit?.website ? 'Detected' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary-100">
                        <span className="text-sm text-secondary-600">Search Visibility</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: `${analysis.userAudit?.digitalPresence || 0}%` }} />
                          </div>
                          <span className="text-xs font-bold">{analysis.userAudit?.digitalPresence || 0}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-secondary-500 italic px-1">
                        "{(analysis.userAudit?.snippet || 'No public data found').substring(0, 120)}..."
                      </p>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Strengths', items: analysis.swot?.strengths || [], color: 'emerald', icon: Zap },
                      { label: 'Weaknesses', items: analysis.swot?.weaknesses || [], color: 'rose', icon: TrendingUp },
                      { label: 'Opportunities', items: analysis.swot?.opportunities || [], color: 'primary', icon: Target },
                      { label: 'Threats', items: analysis.swot?.threats || [], color: 'amber', icon: ShieldCheck },
                    ].map((quad) => (
                      <div key={quad.label} className={`p-4 rounded-2xl border bg-white border-secondary-100`}>
                        <div className="flex items-center gap-2 mb-2">
                          <quad.icon className={`w-3.5 h-3.5 text-secondary-600`} />
                          <h4 className="text-xs font-bold uppercase tracking-wider">{quad.label}</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {quad.items.slice(0, 2).map((item: string, i: number) => (
                            <li key={i} className="text-[10px] leading-tight text-secondary-700 flex items-start gap-1.5">
                              <div className={`w-1 h-1 rounded-full bg-secondary-400 shrink-0 mt-1`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitive Advantage Roadmap */}
                <Card className="p-8 border-emerald-100 bg-emerald-50/20">
                  <h3 className="text-xl font-display font-bold text-secondary-900 mb-6 flex items-center gap-3">
                    <Target className="w-6 h-6 text-emerald-600" /> Nationwide Strategic Roadmap
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                      <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Market Benchmark
                      </h4>
                      <p className="text-sm text-secondary-600 leading-relaxed">
                        The average digital presence in this sector is <strong>{analysis.metrics?.avgDigital || 0}%</strong>. 
                        Your current position is <strong>{analysis.metrics?.digitalGap >= 0 ? '+' : ''}{analysis.metrics?.digitalGap || 0}%</strong> relative to the benchmark.
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                      <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Competitive Pricing
                      </h4>
                      <p className="text-sm text-secondary-600 leading-relaxed">
                        The average Price Index is <strong>{analysis.metrics?.avgPrice || 0}</strong>. 
                        A <strong>{(analysis.metrics?.avgPrice || 0) > 70 ? 'Premium' : 'Value-Driven'}</strong> strategy is currently dominant in your national market.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-emerald-100">
                    <h4 className="text-sm font-bold text-secondary-900 uppercase tracking-widest mb-4">Analytical Next Steps</h4>
                    <ul className="space-y-4">
                      {(analysis.roadmap || []).map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-secondary-700 bg-white/50 p-3 rounded-xl border border-emerald-100/50">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm">{i+1}</div>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>

              {/* Competitor List Side Bar */}
              <div className="space-y-6">
                <h3 className="font-display font-bold text-secondary-900 px-2">Top Competitors</h3>
                {(analysis.competitors || []).map((comp: any) => (
                  <Card key={comp.id || comp.name} className="p-5 hover:border-primary-200 transition-colors cursor-default group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">{comp.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(comp.rating || 0) ? 'fill-current' : 'opacity-30'}`} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-secondary-500">{comp.rating || 0}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{comp.distance > 0 ? `${comp.distance}km away` : 'National Rival'}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Strengths</p>
                        <div className="flex flex-wrap gap-1">
                          {(comp.strengths || []).map((s: string) => <Badge key={s} variant="default" className="text-[9px] bg-emerald-50 border-emerald-100 text-emerald-700">{s}</Badge>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Opportunities for You</p>
                        <div className="flex flex-wrap gap-1">
                          {(comp.weaknesses || []).map((w: string) => <Badge key={w} variant="default" className="text-[9px] bg-rose-50 border-rose-100 text-rose-600">{w}</Badge>)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Card className="p-6 bg-primary-600 text-white border-none text-center">
                  <h4 className="font-bold mb-2">Ready to grow?</h4>
                  <p className="text-xs text-primary-100 mb-4">Export this analysis as a PDF report for your business plan.</p>
                  <Button variant="secondary" className="w-full bg-white text-primary-600 font-bold hover:bg-primary-50">
                    Export Analysis
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
