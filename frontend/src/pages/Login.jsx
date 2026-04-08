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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl -top-20 -left-20"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl -bottom-20 -right-20"
          style={{ transform: `translateY(${scrollY * -0.3}px)` }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding with Parallax */}
        <div
          className="text-center mb-12 animate-in"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <span className="text-5xl font-bold text-white drop-shadow-lg">P</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 gradient-text">SmartPark</h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">Sistem Manajemen Parkir Terintegrasi</p>
        </div>

        {/* Login Card with Glass Effect */}
        <div className="card animate-in-delay-1">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Masuk ke Akun</h2>
            <p className="text-gray-600 text-base mt-2 font-medium">Kelola parkir dengan mudah dan efisien</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl flex items-start gap-3 animate-scale">
              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="animate-in-delay-1">
              <label className="label-field">Username</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:scale-125 transition-transform duration-300" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-12"
                  placeholder="admin"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="animate-in-delay-2">
              <label className="label-field">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:scale-125 transition-transform duration-300" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
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
              className="btn-primary w-full justify-center text-lg py-3.5 animate-in-delay-3"
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
          <div className="divider">
            <div className="divider-line"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Akun Demo</p>
            <div className="divider-line"></div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-3">
            {/* Admin */}
            <div className="group p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border-2 border-blue-200/50 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:scale-105 transform animate-in-delay-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900 text-base">Admin</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Kelola sistem keseluruhan</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t-2 border-blue-200/50">
                <p className="text-sm text-gray-700"><span className="font-bold text-blue-600">User:</span> admin</p>
                <p className="text-sm text-gray-700"><span className="font-bold text-blue-600">Pass:</span> password</p>
              </div>
            </div>

            {/* Petugas */}
            <div className="group p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl border-2 border-emerald-200/50 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:scale-105 transform animate-in-delay-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900 text-base">Petugas</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Kelola transaksi parkir</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t-2 border-emerald-200/50">
                <p className="text-sm text-gray-700"><span className="font-bold text-emerald-600">User:</span> petugas</p>
                <p className="text-sm text-gray-700"><span className="font-bold text-emerald-600">Pass:</span> password</p>
              </div>
            </div>

            {/* Owner */}
            <div className="group p-4 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl border-2 border-purple-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:scale-105 transform animate-in-delay-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900 text-base">Owner</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Lihat laporan & analitik</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t-2 border-purple-200/50">
                <p className="text-sm text-gray-700"><span className="font-bold text-purple-600">User:</span> owner</p>
                <p className="text-sm text-gray-700"><span className="font-bold text-purple-600">Pass:</span> password</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center animate-in-delay-3">
          <p className="text-sm text-gray-700 font-medium">
            <span className="block">Sistem Manajemen Parkir</span>
            <span className="text-xs text-gray-500 mt-1">UKK Rekayasa Perangkat Lunak 2025/2026</span>
          </p>
        </div>
      </div>
    </div>
  )
}
