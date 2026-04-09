import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { FiTruck, FiDollarSign, FiMapPin, FiActivity, FiClock, FiTrendingUp, FiArrowUpRight, FiLogIn, FiLogOut, FiBarChart2 } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-400 mt-4">Memuat data...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Kendaraan Parkir',
      value: data?.kendaraan_parkir || 0,
      icon: FiTruck,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100/50',
    },
    {
      label: 'Pendapatan Hari Ini',
      value: formatRupiah(data?.pendapatan_hari_ini),
      icon: FiDollarSign,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      gradient: 'from-emerald-50 to-emerald-100/50',
    },
    {
      label: 'Transaksi Hari Ini',
      value: data?.transaksi_hari_ini || 0,
      icon: FiActivity,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      gradient: 'from-amber-50 to-amber-100/50',
    },
    {
      label: 'Kapasitas Terisi',
      value: `${data?.total_terisi || 0}/${data?.total_kapasitas || 0}`,
      icon: FiMapPin,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      gradient: 'from-purple-50 to-purple-100/50',
    },
  ]

  const quickActions = [
    { label: 'Kendaraan Masuk', desc: 'Catat kendaraan baru masuk parkir', icon: FiLogIn, to: '/transaksi/masuk', color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-600/25', roles: ['admin', 'petugas'] },
    { label: 'Kendaraan Keluar', desc: 'Proses kendaraan keluar & bayar', icon: FiLogOut, to: '/transaksi/keluar', color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-600/25', roles: ['admin', 'petugas'] },
    { label: 'Rekap Transaksi', desc: 'Lihat laporan & analisis data', icon: FiBarChart2, to: '/rekap', color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25', roles: ['admin', 'owner'] },
  ].filter(a => a.roles.includes(user?.role))

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">Dashboard</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Selamat datang, {user?.nama_lengkap || user?.name}
          </h1>
          <p className="text-gray-500 mt-1">Pantau aktivitas parkir hari ini secara real-time</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200">
          <FiClock size={14} />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className={`bg-gradient-to-r ${action.color} text-white rounded-2xl p-5 text-left hover:opacity-90 transition-all duration-200 shadow-lg ${action.shadow} group`}
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <action.icon size={20} />
                </div>
                <FiArrowUpRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-lg mt-4">{action.label}</h3>
              <p className="text-sm text-white/70 mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((stat, i) => (
          <div key={i} className={`card bg-gradient-to-br ${stat.gradient} border-0 hover:shadow-md transition-all duration-200`}>
            <div className="flex items-start justify-between">
              <div className={`${stat.iconBg} w-11 h-11 rounded-xl flex items-center justify-center`}>
                <stat.icon className={stat.iconColor} size={20} />
              </div>
              <FiArrowUpRight className="text-gray-300" size={18} />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
        {/* Bar Chart */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Transaksi 7 Hari Terakhir</h3>
              <p className="text-sm text-gray-400 mt-0.5">Grafik jumlah transaksi harian</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <FiTrendingUp size={13} />
              <span>7 Hari</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.chart_7_hari || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => [
                  name === 'pendapatan' ? formatRupiah(value) : value,
                  name === 'pendapatan' ? 'Pendapatan' : 'Jumlah'
                ]}
              />
              <Bar dataKey="jumlah" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} name="jumlah" />
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Status */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Status Area</h3>
              <p className="text-sm text-gray-400 mt-0.5">Kapasitas real-time</p>
            </div>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiMapPin className="text-blue-600" size={16} />
            </div>
          </div>
          <div className="space-y-4">
            {(data?.area_status || []).map((area) => {
              const percentage = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
              const color = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              const textColor = percentage >= 90 ? 'text-red-600' : percentage >= 70 ? 'text-amber-600' : 'text-emerald-600'
              return (
                <div key={area.id} className="p-3.5 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-semibold text-gray-800">{area.nama_area}</span>
                    <span className={`text-xs font-bold ${textColor}`}>{area.terisi}/{area.kapasitas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                </div>
              )
            })}
            {(!data?.area_status || data.area_status.length === 0) && (
              <div className="empty-state py-8">
                <FiMapPin size={32} className="mb-2" />
                <p className="text-sm">Belum ada area parkir</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-0">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Transaksi Terbaru</h3>
              <p className="text-sm text-gray-400 mt-0.5">Aktivitas parkir terkini</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3.5">Plat Nomor</th>
                <th className="px-6 py-3.5">Area</th>
                <th className="px-6 py-3.5">Waktu Masuk</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.recent_transaksi || []).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.kendaraan?.plat_nomor}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.area_parkir?.nama_area}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FiClock size={13} className="text-gray-400" />
                      {new Date(t.waktu_masuk).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      t.status === 'parkir' || t.status === 'masuk'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {t.status === 'parkir' || t.status === 'masuk' ? 'Sedang Parkir' : 'Selesai'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recent_transaksi || data.recent_transaksi.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    <FiTruck className="mx-auto mb-2" size={28} />
                    <p className="text-sm">Belum ada transaksi hari ini</p>
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
