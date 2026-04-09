import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiSearch, FiActivity, FiClock } from 'react-icons/fi'

export default function LogAktivitas() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({})

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async (page = 1) => {
    try {
      const params = { page, per_page: 15 }
      if (search) params.search = search
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

  const getAksiFromAktivitas = (aktivitas) => {
    if (!aktivitas) return null
    const upper = aktivitas.toUpperCase()
    if (upper.startsWith('LOGIN')) return 'LOGIN'
    if (upper.startsWith('LOGOUT')) return 'LOGOUT'
    if (upper.startsWith('MASUK') || upper.includes('MASUK')) return 'MASUK'
    if (upper.startsWith('KELUAR') || upper.includes('KELUAR')) return 'KELUAR'
    if (upper.includes('TAMBAH') || upper.includes('CREATE') || upper.includes('MENAMBAH')) return 'CREATE'
    if (upper.includes('UBAH') || upper.includes('UPDATE') || upper.includes('MENGUBAH') || upper.includes('EDIT')) return 'UPDATE'
    if (upper.includes('HAPUS') || upper.includes('DELETE') || upper.includes('MENGHAPUS')) return 'DELETE'
    return null
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600 mb-1">Administrasi</p>
        <h1 className="page-title">Log Aktivitas</h1>
        <p className="page-subtitle">Riwayat semua aktivitas pengguna sistem</p>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari aktivitas..." className="input-field pl-11" />
          </div>
          <button type="submit" className="btn-primary">Cari</button>
        </form>
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3.5 w-[200px]">Waktu</th>
                <th className="px-6 py-3.5 w-[160px]">User</th>
                <th className="px-6 py-3.5 w-[100px]">Tipe</th>
                <th className="px-6 py-3.5">Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => {
                const aksi = getAksiFromAktivitas(log.aktivitas)
                return (
                  <tr key={log.id_log} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FiClock size={12} className="text-gray-400" />
                        {log.waktu_aktivitas ? new Date(log.waktu_aktivitas).toLocaleString('id-ID') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.user?.nama_lengkap || '-'}</td>
                    <td className="px-6 py-4">
                      {aksi ? (
                        <span className={`badge ${aksiColors[aksi] || 'bg-gray-100 text-gray-700'}`}>
                          {aksi}
                        </span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500">LOG</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.aktivitas}</td>
                  </tr>
                )
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    <FiActivity className="mx-auto mb-2" size={28} />
                    <p className="text-sm">Tidak ada log aktivitas</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(pagination.last_page, 10) }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => fetchLogs(page)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === pagination.current_page ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{page}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
