import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scrollY, setScrollY] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Login berhasil!')
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Username atau password salah'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 overflow-hidden flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" 
        style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.3}px))` }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
        style={{ transform: `translate(50%, calc(50% - ${scrollY * 0.2}px))` }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-12 transform transition-transform duration-500" 
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl hover:scale-110 transition-transform duration-300 group">
            <span className="text-white font-bold text-4xl group-hover:rotate-12 transition-transform duration-300">P</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">SmartPark</h1>
          <p className="text-gray-600 font-medium">Sistem Manajemen Parkir Terintegrasi</p>
        </div>

        {/* Login Card */}
        <div className="card backdrop-blur-md bg-white/90 border border-gray-100/50 mb-8 animate-fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Masuk ke Akun</h2>
            <p className="text-gray-600 font-medium">Kelola parkir dengan mudah dan efisien</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border-l-4 border-red-500 rounded-lg animate-shake flex items-start gap-3">
              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0 text-lg" />
              <div>
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="group">
              <label className="label-field">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors text-lg" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-12 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 focus:border-blue-500 focus:from-blue-100/50 focus:to-indigo-100/50"
                  placeholder="admin"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="label-field">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors text-lg" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 focus:border-blue-500 focus:from-blue-100/50 focus:to-indigo-100/50"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-3.5 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-r-transparent"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FiLogIn size={20} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Demo</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Demo Accounts */}
          <div className="grid grid-cols-1 gap-3">
            {/* Admin */}
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <p className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">👤 Admin</p>
              <p className="text-xs text-gray-600 mb-2">Kelola sistem keseluruhan</p>
              <div className="text-xs space-y-1 bg-white/50 p-2 rounded-lg">
                <p className="font-mono text-gray-700"><span className="text-blue-600 font-bold">User:</span> admin</p>
                <p className="font-mono text-gray-700"><span className="text-blue-600 font-bold">Pass:</span> password</p>
              </div>
            </div>

            {/* Petugas */}
            <div className="p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/50 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <p className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">🚗 Petugas</p>
              <p className="text-xs text-gray-600 mb-2">Kelola transaksi parkir</p>
              <div className="text-xs space-y-1 bg-white/50 p-2 rounded-lg">
                <p className="font-mono text-gray-700"><span className="text-emerald-600 font-bold">User:</span> petugas</p>
                <p className="font-mono text-gray-700"><span className="text-emerald-600 font-bold">Pass:</span> password</p>
              </div>
            </div>

            {/* Owner */}
            <div className="p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-50/50 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <p className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">📊 Owner</p>
              <p className="text-xs text-gray-600 mb-2">Lihat laporan & analitik</p>
              <div className="text-xs space-y-1 bg-white/50 p-2 rounded-lg">
                <p className="font-mono text-gray-700"><span className="text-purple-600 font-bold">User:</span> owner</p>
                <p className="font-mono text-gray-700"><span className="text-purple-600 font-bold">Pass:</span> password</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 font-medium">
          <p>UKK Rekayasa Perangkat Lunak 2025/2026</p>
        </div>
      </div>
    </div>
  )
}
