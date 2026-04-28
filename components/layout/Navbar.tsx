'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import {
  LayoutDashboard,
  Database,
  BarChart3,
  LogOut,
  Menu,
  X,
  Compass
} from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/datasets/upload', label: 'Upload', icon: Database },
    { href: '/charts/new', label: 'Create Chart', icon: BarChart3 },
    { href: '/market', label: 'Market Intelligence', icon: Compass },
  ]

  return (
    <nav className="bg-white border-b border-secondary-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary-600" />
              <span className="font-display font-bold text-xl text-secondary-900">
                Power BI Lite
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 rounded-lg hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-secondary-200">
              <Avatar name="User" size="sm" />
              <div className="text-sm">
                <p className="font-medium text-secondary-900">Demo User</p>
                <p className="text-secondary-500 text-xs">Free tier</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-secondary-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-secondary-700 rounded-lg hover:bg-secondary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-secondary-100">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
