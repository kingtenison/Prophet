'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function NewDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: dashData, error } = await supabase
        .from('dashboards')
        .insert({
          user_id: user.id,
          title: title.trim(),
          is_public: false,
          layout: {}
        })
        .select()
        .single()

      if (error) throw error

      addToast({ type: 'success', title: 'Dashboard created!' })
      router.push(`/dashboards/${dashData.id}/edit`)
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Failed to create dashboard' })
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-[#2563EB]" />
          Create Dashboard
        </h1>
        <p className="text-white/50 mt-2 text-lg">
          Give your new workspace a name to get started.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Dashboard Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Sales Overview"
              required
              className="text-lg py-6"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
