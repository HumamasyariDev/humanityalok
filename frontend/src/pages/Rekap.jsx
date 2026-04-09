import { useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiCalendar, FiSearch, FiDownload, FiDollarSign, FiTruck, FiBarChart2, FiTrendingUp } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Rekap() {
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.get('/rekap', {
        params: { tanggal_mulai: tanggalMulai, tanggal_selesai: tanggalSelesai }
      })
      setData(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat rekap')
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
  const formatDate = (d) => d ? new Date(d).toLocaleString('id-ID') : '-'

  const pieData = data?.per_jenis
    ? Object.entries(data.per_jenis).map(([key, val]) => ({
        name: key,
        value: val.jumlah,
        pendapatan: val.pendapatan,
      }))
    : []

  const barData = data?.per_hari
    ? Object.entries(data.per_hari).map(([key, val]) => ({
        tanggal: key,
        jumlah: val.jumlah,
        pendapatan: val.pendapatan,
      }))
    : []

  const handleExportCSV = () => {
    if (!data?.transaksis?.length) return
    const headers = ['Kode', 'Plat Nomor', 'Jenis', 'Area', 'Masuk', 'Keluar', 'Durasi (jam)', 'Biaya']
    const rows = data.transaksis.map(t => [
      `PKR-${t.id_parkir}`,
      t.kendaraan?.plat_nomor,
      t.kendaraan?.jenis_kendaraan,
      t.area_parkir?.nama_area,
      t.waktu_masuk,
      t.waktu_keluar,
      t.durasi_jam,
      t.biaya_total,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekap-parkir-${tanggalMulai}-${tanggalSelesai}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600 mb-1">Administrasi</p>
        <h1 className="page-title">Rekap Transaksi</h1>
        <p className="page-subtitle">Laporan pendapatan dan analisis transaksi parkir</p>
      </div>

      {/* Filter */}
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="label-field">Tanggal Mulai</label>
            <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="input-field" required />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="label-field">Tanggal Selesai</label>
            <input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary h-[48px]">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <><FiSearch size={16} /> Tampilkan</>}
          </button>
          {data && (
            <button type="button" onClick={handleExportCSV} className="btn-secondary h-[48px]">
              <FiDownload size={16} /> Export CSV
            </button>
          )}
        </form>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-0">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FiDollarSign className="text-emerald-600" size={20} />
                </div>
                <FiTrendingUp className="text-emerald-300" size={18} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Pendapatan</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{formatRupiah(data.total_pendapatan)}</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100/50 border-0">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiTruck className="text-blue-600" size={20} />
                </div>
                <FiTrendingUp className="text-blue-300" size={18} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Transaksi</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{data.total_transaksi}</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-0">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FiBarChart2 className="text-amber-600" size={20} />
                </div>
                <FiTrendingUp className="text-amber-300" size={18} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Rata-rata per Transaksi</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {formatRupiah(data.total_transaksi > 0 ? data.total_pendapatan / data.total_transaksi : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Pendapatan per Hari</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Grafik pendapatan harian</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(value) => formatRupiah(value)} />
                  <Bar dataKey="pendapatan" fill="url(#greenGradient)" radius={[8, 8, 0, 0]} name="Pendapatan" />
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Distribusi Kendaraan</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Per jenis kendaraan</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value + ' transaksi', props.payload.name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per Jenis Summary */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Ringkasan per Jenis Kendaraan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.per_jenis || {}).map(([jenis, val], i) => (
                <div key={jenis} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="font-bold text-gray-900">{jenis}</span>
                  </div>
                  <p className="text-sm text-gray-500">{val.jumlah} transaksi</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatRupiah(val.pendapatan)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Table */}
          <div className="card p-0">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Detail Transaksi ({data.transaksis?.length || 0})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-6 py-3.5">Kode</th>
                    <th className="px-6 py-3.5">Plat Nomor</th>
                    <th className="px-6 py-3.5">Jenis</th>
                    <th className="px-6 py-3.5">Area</th>
                    <th className="px-6 py-3.5">Masuk</th>
                    <th className="px-6 py-3.5">Keluar</th>
                    <th className="px-6 py-3.5">Durasi</th>
                    <th className="px-6 py-3.5">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data.transaksis || []).slice(0, 50).map((t) => (
                    <tr key={t.id_parkir} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">PKR-{t.id_parkir}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.kendaraan?.plat_nomor}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.kendaraan?.jenis_kendaraan}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.area_parkir?.nama_area}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(t.waktu_masuk)}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(t.waktu_keluar)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.durasi_jam ? `${t.durasi_jam} jam` : '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatRupiah(t.biaya_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="card text-center py-20">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="text-blue-400" size={28} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Pilih Rentang Tanggal</h3>
          <p className="text-sm text-gray-400 max-w-[280px] mx-auto">Tentukan tanggal mulai dan selesai untuk melihat rekap transaksi</p>
        </div>
      )}
    </div>
  )
}
