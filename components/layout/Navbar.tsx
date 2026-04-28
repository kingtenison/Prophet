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
          fixed top-0 left-0 h-screen z-40 flex flex-col
          transition-all duration-300 ease-in-out
          border-r border-white/[0.07]
          bg-[#0d0f14]/90 backdrop-blur-2xl
          ${collapsed ? 'w-[68px]' : 'w-[232px]'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 pt-6 pb-5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0 w-9 h-9">
            {/* Glowing icon */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] opacity-80 blur-sm" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="block font-display font-800 text-[15px] text-white tracking-tight leading-none">PROPHET</span>
              <span className="block text-[10px] text-[#8b91a7] mt-0.5 tracking-widest uppercase">Intelligence</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 mb-4 h-px bg-white/[0.07]" />

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
                  transition-all duration-150 group
                  ${isActive
                    ? 'bg-[rgba(79,142,247,0.14)] text-[#4f8ef7]'
                    : 'text-[#8b91a7] hover:bg-white/[0.06] hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-[#4f8ef7]' : 'text-[#4b5162] group-hover:text-white'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4f8ef7]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-2 pb-4 space-y-0.5">
          <div className="mx-1 mb-3 h-px bg-white/[0.07]" />

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8b91a7] hover:bg-white/[0.06] hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0 text-[#4b5162]" />
            {!collapsed && <span>Settings</span>}
          </button>

          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8b91a7] hover:bg-rose-500/10 hover:text-rose-400 transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#16191f] border border-white/[0.12] flex items-center justify-center text-[#8b91a7] hover:text-white hover:border-white/30 transition-all shadow-md z-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── Top bar (mobile) ────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/[0.07] bg-[#0d0f14]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">PROPHET</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-[#8b91a7] hover:text-white hover:bg-white/[0.06]">
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-[#8b91a7] hover:text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/[0.07] bg-[#0d0f14]/95 backdrop-blur-xl px-2 pb-safe">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${isActive ? 'text-[#4f8ef7]' : 'text-[#4b5162]'}`}
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
