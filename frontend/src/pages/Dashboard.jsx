import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { FiTruck, FiDollarSign, FiMapPin, FiActivity, FiClock, FiTrendingUp, FiArrowUp } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboard()
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
          <div className="inline-block">
            <div className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Memuat data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600 font-medium">
          Selamat datang, <span className="font-bold text-blue-600">{user?.nama_lengkap || user?.name}</span>! 👋
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="card group hover:scale-105 transform transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Kendaraan Parkir</p>
              <p className="text-3xl font-bold text-gray-900">{data?.kendaraan_parkir || 0}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <FiTrendingUp size={14} /> Sedang aktif
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiTruck className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card group hover:scale-105 transform transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Pendapatan Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{formatRupiah(data?.pendapatan_hari_ini)}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <FiArrowUp size={14} /> +12% kemarin
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiDollarSign className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card group hover:scale-105 transform transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Transaksi Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900">{data?.transaksi_hari_ini || 0}</p>
              <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
                <FiActivity size={14} /> Diproses
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiActivity className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card group hover:scale-105 transform transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Kapasitas Terisi</p>
              <p className="text-3xl font-bold text-gray-900">{data?.total_terisi}/{data?.total_kapasitas}</p>
              <div className="mt-3 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${data?.total_kapasitas ? (data.total_terisi / data.total_kapasitas) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiMapPin className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Transaksi 7 Hari Terakhir</h3>
          <div className="bg-white/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.chart_7_hari || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => value}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Status */}
        <div className="card bg-gradient-to-br from-white to-emerald-50/30 border-emerald-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Status Area Parkir</h3>
          <div className="space-y-4">
            {(data?.area_status || []).map((area) => {
              const percentage = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
              let gradientColor = 'from-emerald-500 to-teal-600'
              let textColor = 'text-emerald-700'
              let bgColor = 'bg-emerald-100'
              
              if (percentage >= 90) {
                gradientColor = 'from-red-500 to-red-600'
                textColor = 'text-red-700'
                bgColor = 'bg-red-100'
              } else if (percentage >= 70) {
                gradientColor = 'from-amber-500 to-orange-600'
                textColor = 'text-amber-700'
                bgColor = 'bg-amber-100'
              }

              return (
                <div key={area.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-800">{area.nama_area}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
                      {area.terisi}/{area.kapasitas}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradientColor} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card bg-gradient-to-br from-white to-slate-50/30 border-slate-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Transaksi Terbaru</h3>
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Plat Nomor</th>
                <th className="px-6 py-3">Area</th>
                <th className="px-6 py-3">Waktu Masuk</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.recent_transaksi || []).map((t) => (
                <tr key={t.id} className="hover:bg-blue-50/30 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.kendaraan?.plat_nomor}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{t.area_parkir?.nama_area}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                    <FiClock size={16} className="text-blue-500" />
                    {new Date(t.waktu_masuk).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${t.status === 'parkir' ? 'badge-blue' : 'badge-green'}`}>
                      {t.status === 'parkir' ? 'Sedang Parkir' : 'Selesai'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recent_transaksi || data.recent_transaksi.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                    Belum ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
