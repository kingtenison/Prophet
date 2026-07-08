'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Palette, Globe, Save, RefreshCcw, Loader2, Upload, Image as ImageIcon, X } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function BrandingSettings() {
  const theme = useThemeStore()
  const { addToast } = useToast()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      theme.setPrimaryColor(data.primary_color)
      theme.setOrgName(data.org_name)
      theme.setReportFooter(data.report_footer)
      if (data.org_logo) theme.setOrgLogo(data.org_logo)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        user_id: user.id,
        primary_color: theme.primaryColor,
        org_name: theme.orgName,
        org_logo: theme.orgLogo,
        report_footer: theme.reportFooter,
      }

      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error
      addToast({ type: 'success', title: 'Branding saved to server' })
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to save', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">White-Label Settings</h1>
        <p className="text-white/50 mt-2">Customize the look and feel of your strategic reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Palette className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-bold text-white">Brand Identity</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Primary Brand Color</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={theme.primaryColor}
                  onChange={(e) => theme.setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                />
                <Input 
                  value={theme.primaryColor}
                  onChange={(e) => theme.setPrimaryColor(e.target.value)}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Organization Name</label>
              <Input 
                value={theme.orgName}
                onChange={(e) => theme.setOrgName(e.target.value)}
                placeholder="e.g. Acme Corp Intelligence"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Organization Logo</label>
              <div className="flex items-center gap-4">
                {theme.orgLogo ? (
                  <div className="relative w-16 h-16 rounded-xl border border-white/10 overflow-hidden bg-white/5 shrink-0">
                    <img src={theme.orgLogo} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      onClick={() => theme.setOrgLogo(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6 text-white/20" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 2 * 1024 * 1024) {
                        addToast({ type: 'error', title: 'Logo too large', message: 'Maximum size is 2 MB' })
                        return
                      }
                      setLogoUploading(true)
                      try {
                        const { data: { user } } = await supabase.auth.getUser()
                        if (!user) throw new Error('Not authenticated')
                        const ext = file.name.split('.').pop()
                        const path = `logos/${user.id}_${Date.now()}.${ext}`
                        const { error: uploadError } = await supabase.storage
                          .from('datasets')
                          .upload(path, file, { upsert: true })
                        if (uploadError) throw uploadError
                        const { data: { publicUrl } } = supabase.storage
                          .from('datasets')
                          .getPublicUrl(path)
                        theme.setOrgLogo(publicUrl)
                        addToast({ type: 'success', title: 'Logo uploaded' })
                      } catch (err: any) {
                        addToast({ type: 'error', title: 'Upload failed', message: err.message })
                      } finally {
                        setLogoUploading(false)
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    loading={logoUploading}
                    className="w-full"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {theme.orgLogo ? 'Replace Logo' : 'Upload Logo'}
                  </Button>
                  <p className="text-[10px] text-white/30 mt-1">PNG, JPG, WebP, or SVG — max 2 MB</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="font-bold text-white">Report Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Report Footer Text</label>
              <Input 
                value={theme.reportFooter}
                onChange={(e) => theme.setReportFooter(e.target.value)}
              />
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/30 uppercase font-bold mb-2">Live Preview (Primary Color)</p>
              <div 
                className="h-2 rounded-full mb-2 transition-all duration-500" 
                style={{ backgroundColor: theme.primaryColor }}
              />
              <Button 
                className="w-full h-8 text-[10px] uppercase font-bold"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Sample Action
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => window.location.reload()}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
        <Button onClick={handleSave} loading={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
          <Save className="w-4 h-4 mr-2" /> Save Branding
        </Button>
      </div>
    </div>
  )
}
