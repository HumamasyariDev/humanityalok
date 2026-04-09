import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiDollarSign } from 'react-icons/fi'
import ConfirmDialog from '../components/ConfirmDialog'

export default function TarifParkir() {
  const [tarifs, setTarifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ jenis_kendaraan: '', tarif_per_jam: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchTarifs() }, [])

  const fetchTarifs = async () => {
    try {
      const res = await api.get('/tarif-parkir', { params: { per_page: 50 } })
      setTarifs(res.data.data.data || [])
    } catch (err) {
      toast.error('Gagal memuat data tarif')
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)

  const openCreate = () => {
    setEditing(null)
    setForm({ jenis_kendaraan: '', tarif_per_jam: '' })
    setShowModal(true)
  }

  const openEdit = (tarif) => {
    setEditing(tarif)
    setForm({
      jenis_kendaraan: tarif.jenis_kendaraan,
      tarif_per_jam: tarif.tarif_per_jam,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/tarif-parkir/${editing.id_tarif}`, form)
        toast.success('Tarif berhasil diupdate')
      } else {
        await api.post('/tarif-parkir', form)
        toast.success('Tarif berhasil ditambahkan')
      }
      setShowModal(false)
      fetchTarifs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan tarif')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/tarif-parkir/${deleteTarget.id_tarif}`)
      toast.success('Tarif berhasil dihapus')
      setDeleteTarget(null)
      fetchTarifs()
    } catch (err) {
      toast.error('Gagal menghapus tarif')
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

  const tarifColors = {
    motor: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-100', icon: 'bg-blue-100 text-blue-600' },
    mobil: { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600' },
    lainnya: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-100', icon: 'bg-amber-100 text-amber-600' },
  }

  const defaultColor = { bg: 'from-purple-50 to-pink-50', border: 'border-purple-100', icon: 'bg-purple-100 text-purple-600' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">Data Master</p>
          <h1 className="page-title">Tarif Parkir</h1>
          <p className="page-subtitle">Kelola tarif parkir berdasarkan jenis kendaraan</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FiPlus size={18} /> Tambah Tarif</button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tarifs.map((tarif) => {
          const color = tarifColors[tarif.jenis_kendaraan] || defaultColor
          return (
            <div key={tarif.id_tarif} className={`card bg-gradient-to-br ${color.bg} border ${color.border} hover:shadow-md transition-all duration-200`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.icon}`}>
                    <FiDollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 capitalize">{tarif.jenis_kendaraan}</h3>
                    <p className="text-xs text-gray-500">Tarif parkir per jam</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(tarif)} className="p-2 text-blue-600 hover:bg-white/60 rounded-xl transition-colors"><FiEdit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(tarif)} className="p-2 text-red-600 hover:bg-white/60 rounded-xl transition-colors"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tarif per Jam</span>
                  <span className="text-xl font-bold text-gray-900">{formatRupiah(tarif.tarif_per_jam)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Estimasi 3 jam</span>
                    <span className="text-sm font-semibold text-gray-700">{formatRupiah(tarif.tarif_per_jam * 3)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {tarifs.length === 0 && (
          <div className="col-span-full empty-state">
            <FiDollarSign size={36} className="mb-3" />
            <p className="text-sm">Belum ada data tarif</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
                  <FiDollarSign className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Tarif' : 'Tambah Tarif Baru'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><FiX size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Jenis Kendaraan</label>
                <select value={form.jenis_kendaraan} onChange={(e) => setForm({...form, jenis_kendaraan: e.target.value})} className="input-field" required>
                  <option value="">Pilih Jenis Kendaraan</option>
                  <option value="motor">Motor</option>
                  <option value="mobil">Mobil</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="label-field">Tarif per Jam (Rp)</label>
                <input type="number" value={form.tarif_per_jam} onChange={(e) => setForm({...form, tarif_per_jam: e.target.value})} className="input-field" placeholder="5000" min="0" required />
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
        title="Hapus Tarif"
        message={`Apakah Anda yakin ingin menghapus tarif "${deleteTarget?.jenis_kendaraan}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
