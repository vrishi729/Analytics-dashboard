import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { login } from '../services/auth'
import { useAuthStore } from '../store/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token } = await login(email, password)
      localStorage.setItem('access_token', access_token)
      const user = await import('../services/auth').then((m) => m.getMe())
      setUser(user)
      queryClient.clear()
      navigate('/upload')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0b1a] px-4">
      <div className="pointer-events-none absolute -inset-40 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute -inset-40 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="animate-fade-in w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
            DQ
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-[#888bb0]">Sign in to your DemandIQ account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#c4c6db]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="block w-full rounded-xl border border-[#23254a] bg-[#0a0b1a] px-4 py-2.5 text-sm text-white placeholder-[#5a5d8a] transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#c4c6db]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-[#23254a] bg-[#0a0b1a] px-4 py-2.5 pr-10 text-sm text-white placeholder-[#5a5d8a] transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5d8a] hover:text-[#c4c6db]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-400 hover:to-purple-500 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#888bb0]">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}