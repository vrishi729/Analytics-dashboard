import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Lightbulb,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useCurrencyStore, CURRENCIES } from '../store/currency'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Data', icon: Upload },
  { path: '/forecast', label: 'Forecast', icon: BarChart3 },
  { path: '/recommendations', label: 'Insights', icon: Lightbulb },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { currency, setCurrency } = useCurrencyStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const queryClient = useQueryClient()
  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0a0b1a]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#23254a] bg-[#12132e] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#23254a] px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              DQ
            </div>
            <span className="text-lg font-bold text-white">DemandIQ</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#888bb0] hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-[#888bb0] hover:bg-[#1a1b3a] hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && (
                  <ChevronRight size={14} className="ml-auto text-indigo-400" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#23254a] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#1a1b3a] px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.full_name || 'User'}
              </p>
              <p className="truncate text-xs text-[#888bb0]">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#888bb0] transition-all hover:bg-[#1a1b3a] hover:text-red-400"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#23254a] bg-[#12132e] px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#888bb0] hover:text-white lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="hidden items-center gap-2 lg:flex">
            <div className="h-6 w-1 rounded-full bg-indigo-500" />
            <span className="text-sm font-medium text-[#888bb0]">
              {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              className="rounded-lg border border-[#23254a] bg-[#0a0b1a] px-2.5 py-1.5 text-xs text-[#c4c6db] focus:border-indigo-500 focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0a0b1a]">
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 rounded-full bg-[#1a1b3a] px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-[#888bb0]">System Online</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}