import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiDollarSign } from 'react-icons/fi'

export default function TarifParkir() {
  const [tarifs, setTarifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ jenis_kendaraan: '', tarif_per_jam: '', tarif_flat: '', denda_per_jam: '' })

  useEffect(() => { fetchTarifs() }, [])

  const fetchTarifs = async (page = 1) => {
    try {
      const res = await api.get('/tarif-parkir', { params: { page, search } })
      setTarifs(res.data.data.data)
    } catch (err) {
      toast.error('Gagal memuat data tarif')
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)

  const openCreate = () => {
    setEditing(null)
    setForm({ jenis_kendaraan: '', tarif_per_jam: '', tarif_flat: '', denda_per_jam: '' })
    setShowModal(true)
  }

  const openEdit = (tarif) => {
    setEditing(tarif)
    setForm({
      jenis_kendaraan: tarif.jenis_kendaraan,
      tarif_per_jam: tarif.tarif_per_jam,
      tarif_flat: tarif.tarif_flat || '',
      denda_per_jam: tarif.denda_per_jam || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, tarif_flat: form.tarif_flat || null, denda_per_jam: form.denda_per_jam || 0 }
      if (editing) {
        await api.put(`/tarif-parkir/${editing.id}`, payload)
        toast.success('Tarif berhasil diupdate')
      } else {
        await api.post('/tarif-parkir', payload)
        toast.success('Tarif berhasil ditambahkan')
      }
      setShowModal(false)
      fetchTarifs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan tarif')
    }
  }

  const handleDelete = async (tarif) => {
    if (!confirm(`Hapus tarif "${tarif.jenis_kendaraan}"?`)) return
    try {
      await api.delete(`/tarif-parkir/${tarif.id}`)
      toast.success('Tarif berhasil dihapus')
      fetchTarifs()
    } catch (err) {
      toast.error('Gagal menghapus tarif')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tarif Parkir</h1>
          <p className="text-gray-500 mt-1">Kelola tarif parkir berdasarkan jenis kendaraan</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FiPlus size={18} /> Tambah Tarif</button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tarifs.map((tarif) => (
          <div key={tarif.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiDollarSign className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{tarif.jenis_kendaraan}</h3>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(tarif)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(tarif)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tarif per Jam</span>
                <span className="font-semibold text-gray-800">{formatRupiah(tarif.tarif_per_jam)}</span>
              </div>
              {tarif.tarif_flat && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tarif Flat</span>
                  <span className="font-semibold text-gray-800">{formatRupiah(tarif.tarif_flat)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Denda per Jam</span>
                <span className="font-semibold text-red-600">{formatRupiah(tarif.denda_per_jam)}</span>
              </div>
            </div>
          </div>
        ))}
        {tarifs.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">Belum ada data tarif</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editing ? 'Edit Tarif' : 'Tambah Tarif'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Jenis Kendaraan</label>
                <input type="text" value={form.jenis_kendaraan} onChange={(e) => setForm({...form, jenis_kendaraan: e.target.value})} className="input-field" placeholder="Motor, Mobil, Truk..." required />
              </div>
              <div>
                <label className="label-field">Tarif per Jam (Rp)</label>
                <input type="number" value={form.tarif_per_jam} onChange={(e) => setForm({...form, tarif_per_jam: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Tarif Flat (Rp) - Opsional</label>
                <input type="number" value={form.tarif_flat} onChange={(e) => setForm({...form, tarif_flat: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-field">Denda per Jam (Rp)</label>
                <input type="number" value={form.denda_per_jam} onChange={(e) => setForm({...form, denda_per_jam: e.target.value})} className="input-field" />
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
