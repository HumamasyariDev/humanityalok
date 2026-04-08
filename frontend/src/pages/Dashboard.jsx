import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { FiTruck, FiDollarSign, FiMapPin, FiActivity, FiClock, FiTrendingUp } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboard()
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard')
      setData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Header Section with Parallax */}
      <div
        className="animate-in"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Dashboard</h1>
        <p className="text-lg text-gray-600 font-medium">Selamat datang, <span className="font-bold text-blue-600">{user?.nama_lengkap || user?.name}</span>! 👋</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Kendaraan Parkir */}
        <div
          className="card animate-in-delay-1 transform hover:scale-110 transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Kendaraan Parkir</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{data?.kendaraan_parkir || 0}</p>
              <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <FiTrendingUp size={14} /> Sedang aktif
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md">
              <FiTruck className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        {/* Card 2: Pendapatan */}
        <div
          className="card animate-in-delay-2 transform hover:scale-110 transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Pendapatan Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatRupiah(data?.pendapatan_hari_ini)}</p>
              <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <FiTrendingUp size={14} /> +12% dari kemarin
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-md">
              <FiDollarSign className="text-emerald-600" size={28} />
            </div>
          </div>
        </div>

        {/* Card 3: Transaksi */}
        <div
          className="card animate-in-delay-3 transform hover:scale-110 transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Transaksi Hari Ini</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{data?.transaksi_hari_ini || 0}</p>
              <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1">
                <FiActivity size={14} /> Diproses
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center shadow-md">
              <FiActivity className="text-amber-600" size={28} />
            </div>
          </div>
        </div>

        {/* Card 4: Kapasitas */}
        <div
          className="card animate-in-delay-3 transform hover:scale-110 transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Kapasitas Terisi</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {data?.total_terisi || 0}/{data?.total_kapasitas || 0}
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data?.total_kapasitas ? (data.total_terisi / data.total_kapasitas) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-md">
              <FiMapPin className="text-purple-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="card lg:col-span-2 animate-in-delay-1">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Transaksi 7 Hari Terakhir</h3>
            <p className="text-gray-600 text-sm font-medium">Grafik pergerakan transaksi harian</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.chart_7_hari || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'pendapatan' ? formatRupiah(value) : value,
                    name === 'pendapatan' ? 'Pendapatan' : 'Jumlah'
                  ]}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb' }}
                />
                <Bar dataKey="jumlah" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} name="jumlah" />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" />
                    <stop offset="95%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Status */}
        <div className="card animate-in-delay-2">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Status Area Parkir</h3>
            <p className="text-gray-600 text-sm font-medium">Kapasitas per area</p>
          </div>
          <div className="space-y-4">
            {(data?.area_status || []).map((area) => {
              const percentage = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
              const getStatusColor = () => {
                if (percentage >= 90) return { bar: 'bg-gradient-to-r from-red-500 to-red-600', badge: 'badge-red' }
                if (percentage >= 70) return { bar: 'bg-gradient-to-r from-amber-500 to-orange-600', badge: 'badge-amber' }
                return { bar: 'bg-gradient-to-r from-emerald-500 to-teal-600', badge: 'badge-green' }
              }
              const colors = getStatusColor()
              return (
                <div key={area.id} className="p-3 bg-gray-50/50 backdrop-blur-sm rounded-lg hover:bg-gray-100/50 transition-colors duration-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-800">{area.nama_area}</span>
                    <span className={`badge text-xs font-bold`}>{area.terisi}/{area.kapasitas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className={`${colors.bar} h-3 rounded-full transition-all duration-500 shadow-md`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{percentage.toFixed(0)}% terisi</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card animate-in-delay-3">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Transaksi Terbaru</h3>
          <p className="text-gray-600 text-sm font-medium">Aktivitas parkir terkini</p>
        </div>
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Plat Nomor</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Waktu Masuk</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(data?.recent_transaksi || []).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-4 text-sm font-bold text-gray-900">{t.kendaraan?.plat_nomor}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 font-medium">{t.area_parkir?.nama_area}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiClock size={16} className="text-blue-600" />
                      {new Date(t.waktu_masuk).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge text-xs font-bold ${
                      t.status === 'parkir' ? 'badge-blue' : 'badge-green'
                    }`}>
                      {t.status === 'parkir' ? 'Sedang Parkir' : 'Selesai'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recent_transaksi || data.recent_transaksi.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-400 font-medium">Belum ada transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
