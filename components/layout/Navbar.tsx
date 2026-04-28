'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Database,
  BarChart3,
  LogOut,
  Compass,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings,
  Bell,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',      label: 'Home',                icon: LayoutDashboard },
  { href: '/datasets/upload',label: 'Upload Data',         icon: Database },
  { href: '/charts/new',     label: 'Create Chart',        icon: BarChart3 },
  { href: '/market',         label: 'Market Intelligence', icon: Compass },
]

export function Navbar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex fixed top-0 left-0 h-screen z-40 flex-col
          transition-all duration-300 ease-in-out
          border-r border-white/5
          bg-[#0a0a0a]/95 backdrop-blur-2xl
          ${collapsed ? 'w-[68px]' : 'w-[232px]'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 pt-6 pb-5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0 w-9 h-9">
            {/* Glowing icon with royal blue */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] opacity-80 blur-sm" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-[rgba(37,99,235,0.35)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="block font-display font-800 text-[15px] text-white tracking-tight leading-none">PROPHET</span>
              <span className="block text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">Intelligence</span>
            </div>
          )}
        </div>

        {/* Divider with subtle gradient */}
        <div className="mx-3 mb-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-[rgba(37,99,235,0.12)] text-[#60A5FA]'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {/* Active indicator dot */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 w-1 h-6 rounded-r-full bg-gradient-to-b from-[#60A5FA] to-[#1D4ED8]" />
                )}
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-[#60A5FA]' : 'text-white/30 group-hover:text-white/60'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-2 pb-4 space-y-0.5">
          <div className="mx-1 mb-3 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/[0.04] hover:text-white/80 transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0 text-white/30" />
            {!collapsed && <span>Settings</span>}
          </button>

          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shadow-lg z-50 backdrop-blur-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── Top bar (mobile) ────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-[rgba(37,99,235,0.3)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">PROPHET</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav - glassmorphism */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-2 pb-safe">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${isActive ? 'text-[#60A5FA]' : 'text-white/30'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate max-w-[56px] text-center leading-tight">
                {item.label.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
