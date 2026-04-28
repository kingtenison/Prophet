import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardViewClient from './DashboardViewClient'
import { BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export default async function DashboardViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user (may be null for unauthenticated visitors)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the dashboard with widgets
  const { data: dashboard, error: dashError } = await supabase
    .from('dashboards')
    .select(`
      *,
      widgets:widgets(
        *,
        dataset:datasets(id, name, file_path, columns)
      )
    `)
    .eq('id', id)
    .single()

  if (dashError || !dashboard) {
    notFound()
  }

  // Authorization: allow if the dashboard is public OR if the current user owns it
  const isOwner = user?.id === dashboard.user_id
  const isPublic = dashboard.is_public

  if (!isOwner && !isPublic) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black">
      <ViewNavbar title={dashboard.title} isPublic={isPublic} isOwner={isOwner} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardViewClient
          dashboard={dashboard}
          widgets={dashboard.widgets}
        />
      </main>
    </div>
  )
}

function ViewNavbar({ title, isPublic, isOwner }: { title: string; isPublic: boolean; isOwner: boolean }) {
  return (
    <nav className="bg-[#111] border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#2563EB]" />
            <span className="font-display font-bold text-sm sm:text-lg text-white hidden sm:inline">
              Power BI Lite
            </span>
            <span className="text-white/30 mx-2 hidden sm:inline">|</span>
            <span className="text-white/60 font-medium truncate max-w-[150px] sm:max-w-none">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPublic && <Badge variant="success">Public</Badge>}
            {isOwner && !isPublic && <Badge variant="secondary">Preview</Badge>}
          </div>
        </div>
      </div>
    </nav>
  )
}
