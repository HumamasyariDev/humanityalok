import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { login } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  // Handle parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setMousePos({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" ref={containerRef}>
      {/* Animated Parallax Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large blur orbs with parallax */}
        <div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 0.05}px, ${mousePos.y * 0.05}px)`
          }}
        />
        <div 
          className="absolute top-1/2 -right-32 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -0.08}px, ${mousePos.y * -0.08}px)`
          }}
        />
        <div 
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 0.03}px, ${mousePos.y * 0.03}px)`
          }}
        />
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Content Container */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo & Branding with Parallax */}
          <div 
            className="text-center mb-12 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`
            }}
          >
            {/* Animated Background */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center border border-blue-400/20">
                <span className="text-5xl font-bold text-white">P</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">SmartPark</h1>
            <p className="text-blue-200 text-lg font-medium">Sistem Manajemen Parkir Terintegrasi</p>
          </div>

          {/* Login Card with Enhanced Design */}
          <div className="relative">
            {/* Card Background Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20" />
            
            {/* Actual Card */}
            <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Masuk ke Akun</h2>
                <p className="text-slate-400 font-medium">Kelola parkir dengan mudah dan efisien</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-sm font-medium text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2.5">Username</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder-slate-500 font-medium"
                      placeholder="admin"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2.5">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder-slate-500 font-medium"
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
                  className="w-full mt-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/30 border border-blue-400/20"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
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
              <div className="my-7 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-600/30"></div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AKUN DEMO</p>
                <div className="flex-1 h-px bg-slate-600/30"></div>
              </div>

              {/* Demo Accounts */}
              <div className="space-y-3">
                {/* Admin Account */}
                <div className="group p-4 bg-gradient-to-br from-blue-600/10 to-blue-400/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-default hover:bg-gradient-to-br hover:from-blue-600/20 hover:to-blue-400/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-blue-300 text-sm">Admin</p>
                      <p className="text-xs text-slate-400 mt-1">Kelola sistem keseluruhan</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-blue-500/10">
                    <p className="text-xs text-slate-300"><span className="font-semibold text-blue-300">User:</span> admin</p>
                    <p className="text-xs text-slate-300 mt-1"><span className="font-semibold text-blue-300">Pass:</span> password</p>
                  </div>
                </div>

                {/* Petugas Account */}
                <div className="group p-4 bg-gradient-to-br from-emerald-600/10 to-teal-400/10 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 cursor-default hover:bg-gradient-to-br hover:from-emerald-600/20 hover:to-teal-400/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-emerald-300 text-sm">Petugas</p>
                      <p className="text-xs text-slate-400 mt-1">Kelola transaksi parkir</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-emerald-500/10">
                    <p className="text-xs text-slate-300"><span className="font-semibold text-emerald-300">User:</span> petugas</p>
                    <p className="text-xs text-slate-300 mt-1"><span className="font-semibold text-emerald-300">Pass:</span> password</p>
                  </div>
                </div>

                {/* Owner Account */}
                <div className="group p-4 bg-gradient-to-br from-purple-600/10 to-pink-400/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cursor-default hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-pink-400/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-purple-300 text-sm">Owner</p>
                      <p className="text-xs text-slate-400 mt-1">Lihat laporan & analitik</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-purple-500/10">
                    <p className="text-xs text-slate-300"><span className="font-semibold text-purple-300">User:</span> owner</p>
                    <p className="text-xs text-slate-300 mt-1"><span className="font-semibold text-purple-300">Pass:</span> password</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400 font-medium">
              <span className="block">Sistem Manajemen Parkir Terintegrasi</span>
              <span className="text-xs text-slate-500 mt-1">UKK Rekayasa Perangkat Lunak 2025/2026</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
