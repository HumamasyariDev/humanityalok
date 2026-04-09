import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiTruck } from 'react-icons/fi'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Kendaraan() {
  const [kendaraans, setKendaraans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ plat_nomor: '', jenis_kendaraan: '', merk: '', warna: '', pemilik: '' })
  const [pagination, setPagination] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchKendaraans() }, [])

  const fetchKendaraans = async (page = 1) => {
    try {
      const res = await api.get('/kendaraan', { params: { page, search, per_page: 10 } })
      setKendaraans(res.data.data.data)
      setPagination(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat data kendaraan')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchKendaraans()
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ plat_nomor: '', jenis_kendaraan: '', merk: '', warna: '', pemilik: '' })
    setShowModal(true)
  }

  const openEdit = (k) => {
    setEditing(k)
    setForm({ plat_nomor: k.plat_nomor, jenis_kendaraan: k.jenis_kendaraan, merk: k.merk || '', warna: k.warna || '', pemilik: k.pemilik || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/kendaraan/${editing.id}`, form)
        toast.success('Kendaraan berhasil diupdate')
      } else {
        await api.post('/kendaraan', form)
        toast.success('Kendaraan berhasil ditambahkan')
      }
      setShowModal(false)
      fetchKendaraans()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kendaraan')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/kendaraan/${deleteTarget.id}`)
      toast.success('Kendaraan berhasil dihapus')
      setDeleteTarget(null)
      fetchKendaraans()
    } catch (err) {
      toast.error('Gagal menghapus kendaraan')
    }
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
      <div className="page-header">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">Data Master</p>
          <h1 className="page-title">Data Kendaraan</h1>
          <p className="page-subtitle">Kelola data kendaraan yang terdaftar dalam sistem</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FiPlus size={18} /> Tambah Kendaraan</button>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari plat nomor, merk, pemilik..." className="input-field pl-11" />
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
                <th className="px-6 py-3.5">No</th>
                <th className="px-6 py-3.5">Plat Nomor</th>
                <th className="px-6 py-3.5">Jenis</th>
                <th className="px-6 py-3.5">Merk</th>
                <th className="px-6 py-3.5">Warna</th>
                <th className="px-6 py-3.5">Pemilik</th>
                <th className="px-6 py-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kendaraans.map((k, i) => (
                <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{(pagination.current_page - 1) * 10 + i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FiTruck className="text-blue-600" size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{k.plat_nomor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="badge bg-gray-100 text-gray-700">{k.jenis_kendaraan}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{k.merk || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{k.warna || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{k.pemilik || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(k)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><FiEdit2 size={15} /></button>
                      <button onClick={() => setDeleteTarget(k)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {kendaraans.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    <FiTruck className="mx-auto mb-2" size={28} />
                    <p className="text-sm">Tidak ada data kendaraan</p>
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
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => fetchKendaraans(page)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === pagination.current_page ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{page}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiTruck className="text-blue-600" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><FiX size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Plat Nomor</label>
                <input type="text" value={form.plat_nomor} onChange={(e) => setForm({...form, plat_nomor: e.target.value.toUpperCase()})} className="input-field font-bold tracking-wider" placeholder="B 1234 ABC" required />
              </div>
              <div>
                <label className="label-field">Jenis Kendaraan</label>
                <select value={form.jenis_kendaraan} onChange={(e) => setForm({...form, jenis_kendaraan: e.target.value})} className="input-field" required>
                  <option value="">Pilih Jenis</option>
                  <option value="Motor">Motor</option>
                  <option value="Mobil">Mobil</option>
                  <option value="Truk">Truk</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Merk</label>
                  <input type="text" value={form.merk} onChange={(e) => setForm({...form, merk: e.target.value})} className="input-field" placeholder="Honda, Toyota..." />
                </div>
                <div>
                  <label className="label-field">Warna</label>
                  <input type="text" value={form.warna} onChange={(e) => setForm({...form, warna: e.target.value})} className="input-field" placeholder="Hitam, Putih..." />
                </div>
              </div>
              <div>
                <label className="label-field">Pemilik</label>
                <input type="text" value={form.pemilik} onChange={(e) => setForm({...form, pemilik: e.target.value})} className="input-field" placeholder="Nama pemilik" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Kendaraan"
        message={`Apakah Anda yakin ingin menghapus kendaraan dengan plat nomor "${deleteTarget?.plat_nomor}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
