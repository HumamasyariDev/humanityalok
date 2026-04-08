import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SmartPark</h1>
          <p className="text-gray-600 mt-2">Sistem Manajemen Parkir Terintegrasi</p>
        </div>

        {/* Login Card */}
        <div className="card shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Masuk ke Akun</h2>
            <p className="text-gray-500 text-sm mt-1">Kelola parkir dengan mudah dan efisien</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="label-field">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <p className="text-xs font-medium text-gray-500">AKUN DEMO</p>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-2">
            <div className="group p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-300 transition-all cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Admin</p>
                  <p className="text-xs text-gray-600 mt-1">Kelola sistem keseluruhan</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-100">
                <p className="text-xs text-gray-700"><span className="font-medium">User:</span> admin</p>
                <p className="text-xs text-gray-700"><span className="font-medium">Pass:</span> password</p>
              </div>
            </div>

            <div className="group p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:border-emerald-300 transition-all cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Petugas</p>
                  <p className="text-xs text-gray-600 mt-1">Kelola transaksi parkir</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-100">
                <p className="text-xs text-gray-700"><span className="font-medium">User:</span> petugas</p>
                <p className="text-xs text-gray-700"><span className="font-medium">Pass:</span> password</p>
              </div>
            </div>

            <div className="group p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-all cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Owner</p>
                  <p className="text-xs text-gray-600 mt-1">Lihat laporan & analitik</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-purple-100">
                <p className="text-xs text-gray-700"><span className="font-medium">User:</span> owner</p>
                <p className="text-xs text-gray-700"><span className="font-medium">Pass:</span> password</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <span className="block">Sistem Manajemen Parkir</span>
            <span className="text-xs text-gray-500">UKK Rekayasa Perangkat Lunak 2025/2026</span>
          </p>
        </div>
      </div>
    </div>
  )
}
