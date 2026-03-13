import { useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiCalendar, FiSearch, FiDownload, FiDollarSign, FiTruck, FiBarChart2 } from 'react-icons/fi'
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
    const headers = ['Kode', 'Plat Nomor', 'Jenis', 'Area', 'Masuk', 'Keluar', 'Durasi (menit)', 'Biaya', 'Pembayaran']
    const rows = data.transaksis.map(t => [
      t.kode_transaksi,
      t.kendaraan?.plat_nomor,
      t.kendaraan?.jenis_kendaraan,
      t.area_parkir?.nama_area,
      t.waktu_masuk,
      t.waktu_keluar,
      t.durasi_menit,
      t.total_biaya,
      t.metode_pembayaran,
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Rekap Transaksi</h1>
        <p className="text-gray-500 mt-1">Laporan pendapatan dan transaksi parkir</p>
      </div>

      {/* Filter */}
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label-field">Tanggal Mulai</label>
            <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label-field">Tanggal Selesai</label>
            <input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary h-[42px]">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FiSearch size={16} /> Tampilkan</>}
          </button>
          {data && (
            <button type="button" onClick={handleExportCSV} className="btn-secondary h-[42px]">
              <FiDownload size={16} /> Export CSV
            </button>
          )}
        </form>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pendapatan</p>
                <p className="text-2xl font-bold text-emerald-700">{formatRupiah(data.total_pendapatan)}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiTruck className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Transaksi</p>
                <p className="text-2xl font-bold text-blue-700">{data.total_transaksi}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FiBarChart2 className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rata-rata per Transaksi</p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatRupiah(data.total_transaksi > 0 ? data.total_pendapatan / data.total_transaksi : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pendapatan per Hari</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Bar dataKey="pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} name="Pendapatan" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi per Jenis Kendaraan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan per Jenis Kendaraan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(data.per_jenis || {}).map(([jenis, val], i) => (
                <div key={jenis} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="font-semibold text-gray-800">{jenis}</span>
                  </div>
                  <p className="text-sm text-gray-500">{val.jumlah} transaksi</p>
                  <p className="text-lg font-bold text-gray-800">{formatRupiah(val.pendapatan)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Table */}
          <div className="card p-0">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Detail Transaksi ({data.transaksis?.length || 0})</h3>
            </div>
            <div className="table-container border-0">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Plat Nomor</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Masuk</th>
                    <th className="px-4 py-3">Keluar</th>
                    <th className="px-4 py-3">Durasi</th>
                    <th className="px-4 py-3">Biaya</th>
                    <th className="px-4 py-3">Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data.transaksis || []).slice(0, 50).map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-mono">{t.kode_transaksi}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-700">{t.kendaraan?.plat_nomor}</td>
                      <td className="px-4 py-3 text-sm">{t.kendaraan?.jenis_kendaraan}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(t.waktu_masuk)}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(t.waktu_keluar)}</td>
                      <td className="px-4 py-3 text-sm">{t.durasi_menit ? `${Math.floor(t.durasi_menit/60)}j ${t.durasi_menit%60}m` : '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatRupiah(t.total_biaya)}</td>
                      <td className="px-4 py-3 text-sm capitalize">{t.metode_pembayaran}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="card text-center py-16">
          <FiCalendar className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400 text-lg">Pilih rentang tanggal untuk melihat rekap transaksi</p>
        </div>
      )}
    </div>
  )
}
