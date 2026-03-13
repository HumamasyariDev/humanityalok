import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login berhasil!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-blue-600">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white">SmartPark</h1>
          <p className="text-blue-200 mt-2">Sistem Parkir Modern & Terintegrasi</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Masuk ke Akun Anda</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="email@parkir.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiLogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3 font-medium">AKUN DEMO:</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between bg-gray-50 p-2 rounded-lg">
                <span className="font-medium">Admin</span>
                <span>admin@parkir.com / password</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded-lg">
                <span className="font-medium">Petugas</span>
                <span>petugas@parkir.com / password</span>
              </div>
              <div className="flex justify-between bg-gray-50 p-2 rounded-lg">
                <span className="font-medium">Owner</span>
                <span>owner@parkir.com / password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
