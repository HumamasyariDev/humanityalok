import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiTruck } from 'react-icons/fi'

export default function Kendaraan() {
  const [kendaraans, setKendaraans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ plat_nomor: '', jenis_kendaraan: '', merk: '', warna: '', pemilik: '' })
  const [pagination, setPagination] = useState({})

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

  const handleDelete = async (k) => {
    if (!confirm(`Hapus kendaraan "${k.plat_nomor}"?`)) return
    try {
      await api.delete(`/kendaraan/${k.id}`)
      toast.success('Kendaraan berhasil dihapus')
      fetchKendaraans()
    } catch (err) {
      toast.error('Gagal menghapus kendaraan')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Kendaraan</h1>
          <p className="text-gray-500 mt-1">Kelola data kendaraan terdaftar</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FiPlus size={18} /> Tambah Kendaraan</button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari plat nomor, merk, pemilik..." className="input-field pl-10" />
        </div>
        <button type="submit" className="btn-primary">Cari</button>
      </form>

      <div className="card p-0">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Plat Nomor</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Merk</th>
                <th className="px-4 py-3">Warna</th>
                <th className="px-4 py-3">Pemilik</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kendaraans.map((k, i) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{(pagination.current_page - 1) * 10 + i + 1}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-700">{k.plat_nomor}</td>
                  <td className="px-4 py-3 text-sm">{k.jenis_kendaraan}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{k.merk || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{k.warna || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{k.pemilik || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(k)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(k)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {kendaraans.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => fetchKendaraans(page)} className={`px-3 py-1 rounded-lg text-sm ${page === pagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{page}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editing ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Plat Nomor</label>
                <input type="text" value={form.plat_nomor} onChange={(e) => setForm({...form, plat_nomor: e.target.value.toUpperCase()})} className="input-field" placeholder="B 1234 ABC" required />
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
              <div>
                <label className="label-field">Merk</label>
                <input type="text" value={form.merk} onChange={(e) => setForm({...form, merk: e.target.value})} className="input-field" placeholder="Honda, Toyota..." />
              </div>
              <div>
                <label className="label-field">Warna</label>
                <input type="text" value={form.warna} onChange={(e) => setForm({...form, warna: e.target.value})} className="input-field" placeholder="Hitam, Putih..." />
              </div>
              <div>
                <label className="label-field">Pemilik</label>
                <input type="text" value={form.pemilik} onChange={(e) => setForm({...form, pemilik: e.target.value})} className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
