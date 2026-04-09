import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiMapPin } from 'react-icons/fi'
import ConfirmDialog from '../components/ConfirmDialog'

export default function AreaParkir() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nama_area: '', kapasitas: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchAreas() }, [])

  const fetchAreas = async () => {
    try {
      const res = await api.get('/area-parkir', { params: { per_page: 50 } })
      setAreas(res.data.data.data || [])
    } catch (err) {
      toast.error('Gagal memuat data area')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ nama_area: '', kapasitas: '' })
    setShowModal(true)
  }

  const openEdit = (area) => {
    setEditing(area)
    setForm({ nama_area: area.nama_area, kapasitas: area.kapasitas })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/area-parkir/${editing.id_area}`, form)
        toast.success('Area berhasil diupdate')
      } else {
        await api.post('/area-parkir', form)
        toast.success('Area berhasil ditambahkan')
      }
      setShowModal(false)
      fetchAreas()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan area')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/area-parkir/${deleteTarget.id_area}`)
      toast.success('Area berhasil dihapus')
      setDeleteTarget(null)
      fetchAreas()
    } catch (err) {
      toast.error('Gagal menghapus area')
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
          <h1 className="page-title">Area Parkir</h1>
          <p className="page-subtitle">Kelola area dan kapasitas parkir</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FiPlus size={18} /> Tambah Area</button>
      </div>

      {/* Area Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {areas.map((area) => {
          const percentage = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
          const color = percentage >= 90 ? 'text-red-600' : percentage >= 70 ? 'text-amber-600' : 'text-emerald-600'
          const bgColor = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
          return (
            <div key={area.id_area} className="card hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-100">
                    <FiMapPin className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{area.nama_area}</h3>
                    <p className="text-sm text-gray-500">Kapasitas: {area.kapasitas} slot</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(area)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><FiEdit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(area)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">Kapasitas Terisi</span>
                  <span className={`text-sm font-bold ${color}`}>{area.terisi}/{area.kapasitas}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${bgColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <div className="flex justify-between mt-3">
                  <span className={`badge ${percentage >= 100 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {percentage >= 100 ? 'PENUH' : 'TERSEDIA'}
                  </span>
                  <span className="text-xs text-gray-400">Sisa: {area.kapasitas - area.terisi} slot</span>
                </div>
              </div>
            </div>
          )
        })}
        {areas.length === 0 && (
          <div className="col-span-full empty-state">
            <FiMapPin size={36} className="mb-3" />
            <p className="text-sm">Belum ada data area parkir</p>
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
                  <FiMapPin className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Area' : 'Tambah Area Baru'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><FiX size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Nama Area</label>
                <input type="text" value={form.nama_area} onChange={(e) => setForm({...form, nama_area: e.target.value})} className="input-field" placeholder="Nama area parkir" required />
              </div>
              <div>
                <label className="label-field">Kapasitas</label>
                <input type="number" value={form.kapasitas} onChange={(e) => setForm({...form, kapasitas: e.target.value})} className="input-field" placeholder="Jumlah maksimal kendaraan" min="1" required />
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
        title="Hapus Area"
        message={`Apakah Anda yakin ingin menghapus area "${deleteTarget?.nama_area}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
