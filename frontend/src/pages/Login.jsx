import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiLock, FiLogIn, FiAlertCircle, FiShield, FiTruck, FiMapPin, FiBarChart2, FiEye, FiEyeOff } from 'react-icons/fi'

const demoAccounts = [
  { role: 'Admin', username: 'admin', desc: 'Kelola sistem keseluruhan', color: 'blue' },
  { role: 'Petugas', username: 'petugas', desc: 'Kelola transaksi parkir', color: 'emerald' },
  { role: 'Owner', username: 'owner', desc: 'Lihat laporan & analitik', color: 'purple' },
]

const features = [
  { icon: FiTruck, title: 'Manajemen Kendaraan', desc: 'Catat masuk & keluar kendaraan secara real-time' },
  { icon: FiMapPin, title: 'Area Parkir', desc: 'Pantau kapasitas area parkir secara langsung' },
  { icon: FiBarChart2, title: 'Laporan & Rekap', desc: 'Analisis pendapatan dan statistik lengkap' },
  { icon: FiShield, title: 'Multi Role Access', desc: 'Kontrol akses berdasarkan peran pengguna' },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const fillDemo = (acc) => {
    setUsername(acc.username)
    setPassword('password')
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero / Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold text-white">SmartPark</span>
          </div>

          {/* Center - Hero Text & Features */}
          <div className="space-y-10">
            <div className="space-y-4 max-w-lg">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Sistem Manajemen Parkir Terintegrasi
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                Kelola area parkir, pantau kendaraan, dan analisis pendapatan dalam satu platform terpadu.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {features.map((f, i) => (
                <div key={i} className="group p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-all duration-300">
                  <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="text-white" size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-blue-200 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - Footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-200">UKK RPL 2025/2026</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-200">Sistem Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 p-6 bg-white border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="font-bold text-gray-800">SmartPark</span>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Heading */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-gray-500 mt-2">Masuk ke akun untuk mengelola sistem parkir</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-[fadeIn_0.2s_ease-out]">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle className="text-red-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Login Gagal</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FiUser size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                    placeholder="Masukkan username"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FiLock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                    placeholder="Masukkan password"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn size={18} />
                    <span>Masuk ke Sistem</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Akun Demo</p>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {demoAccounts.map((acc) => {
                  const isActive = username === acc.username
                  const colorMap = {
                    blue: {
                      bg: isActive ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50',
                      icon: 'bg-blue-100 text-blue-600',
                      dot: 'bg-blue-500',
                    },
                    emerald: {
                      bg: isActive ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100' : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50',
                      icon: 'bg-emerald-100 text-emerald-600',
                      dot: 'bg-emerald-500',
                    },
                    purple: {
                      bg: isActive ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-100' : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/50',
                      icon: 'bg-purple-100 text-purple-600',
                      dot: 'bg-purple-500',
                    },
                  }
                  const c = colorMap[acc.color]

                  return (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => fillDemo(acc)}
                      className={`relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${c.bg}`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`}></div>
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.icon}`}>
                        <FiUser size={16} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{acc.role}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{acc.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 pt-2">
              Sistem Manajemen Parkir &middot; UKK RPL 2025/2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
