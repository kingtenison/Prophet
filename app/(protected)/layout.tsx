import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import Providers from '@/components/Providers'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      {/* Offset main content by sidebar width — 232px expanded */}
      <main className="md:ml-[232px] min-h-screen transition-all duration-300" style={{ color: 'var(--text-primary)' }}>
        {/* Top bar spacer for mobile */}
        <div className="h-14 md:hidden" />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Providers>{children}</Providers>
        </div>
        {/* Bottom nav spacer for mobile */}
        <div className="h-20 md:hidden" />
      </main>
    </div>
  )
}
