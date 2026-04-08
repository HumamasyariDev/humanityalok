import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { FiTruck, FiDollarSign, FiMapPin, FiActivity, FiClock } from 'react-icons/fi'
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang, {user?.nama_lengkap || user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FiTruck className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kendaraan Parkir</p>
            <p className="text-2xl font-bold text-gray-800">{data?.kendaraan_parkir || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FiDollarSign className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pendapatan Hari Ini</p>
            <p className="text-2xl font-bold text-gray-800">{formatRupiah(data?.pendapatan_hari_ini)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <FiActivity className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Transaksi Hari Ini</p>
            <p className="text-2xl font-bold text-gray-800">{data?.transaksi_hari_ini || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FiMapPin className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kapasitas Terisi</p>
            <p className="text-2xl font-bold text-gray-800">{data?.total_terisi || 0}/{data?.total_kapasitas || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaksi 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.chart_7_hari || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'pendapatan' ? formatRupiah(value) : value,
                  name === 'pendapatan' ? 'Pendapatan' : 'Jumlah'
                ]}
              />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} name="jumlah" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Area Parkir</h3>
          <div className="space-y-3">
            {(data?.area_status || []).map((area) => {
              const percentage = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
              const color = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              return (
                <div key={area.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{area.kode_area} - {area.nama_area}</span>
                    <span className="text-xs text-gray-500">{area.terisi}/{area.kapasitas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaksi Terbaru</h3>
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
            <tbody className="divide-y divide-gray-100">
              {(data?.recent_transaksi || []).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{t.kendaraan?.plat_nomor}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.area_parkir?.nama_area}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiClock size={14} />
                      {new Date(t.waktu_masuk).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === 'parkir' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {t.status === 'parkir' ? 'Sedang Parkir' : 'Selesai'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recent_transaksi || data.recent_transaksi.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-400">Belum ada transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
