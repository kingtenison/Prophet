'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Palette, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
        <p className="text-white/50 mt-2">Manage your account and application preferences</p>
      </div>

      <div className="grid gap-4">
        <Link href="/settings/branding">
          <Card className="p-5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer border-white/5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20">
              <Palette className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Branding & White-Label</h3>
              <p className="text-sm text-white/50">Customize primary color, organization name, and report footer</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </Card>
        </Link>
      </div>
    </div>
  )
}
