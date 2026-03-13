import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiSearch, FiActivity, FiClock } from 'react-icons/fi'

export default function LogAktivitas() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modul, setModul] = useState('')
  const [pagination, setPagination] = useState({})

  useEffect(() => { fetchLogs() }, [modul])

  const fetchLogs = async (page = 1) => {
    try {
      const params = { page, per_page: 15 }
      if (search) params.search = search
      if (modul) params.modul = modul
      const res = await api.get('/log-aktivitas', { params })
      setLogs(res.data.data.data)
      setPagination(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat log aktivitas')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchLogs()
  }

  const aksiColors = {
    LOGIN: 'bg-blue-100 text-blue-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
    CREATE: 'bg-emerald-100 text-emerald-700',
    UPDATE: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
    MASUK: 'bg-indigo-100 text-indigo-700',
    KELUAR: 'bg-purple-100 text-purple-700',
  }

  const moduls = ['', 'Auth', 'User', 'Tarif Parkir', 'Area Parkir', 'Kendaraan', 'Transaksi']

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas</h1>
        <p className="text-gray-500 mt-1">Riwayat semua aktivitas pengguna sistem</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari aktivitas..." className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-primary">Cari</button>
        </form>
        <select value={modul} onChange={(e) => setModul(e.target.value)} className="input-field w-auto">
          <option value="">Semua Modul</option>
          {moduls.filter(Boolean).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Modul</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FiClock size={12} />
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{log.user?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${aksiColors[log.aksi] || 'bg-gray-100 text-gray-700'}`}>
                      {log.aksi}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.modul}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.keterangan}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ip_address}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Tidak ada log aktivitas</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(pagination.last_page, 10) }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => fetchLogs(page)} className={`px-3 py-1 rounded-lg text-sm ${page === pagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{page}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
