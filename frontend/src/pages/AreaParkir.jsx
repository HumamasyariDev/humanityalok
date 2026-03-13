import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiMapPin } from 'react-icons/fi'

export default function AreaParkir() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ kode_area: '', nama_area: '', kapasitas: '', status: 'aktif' })

  useEffect(() => { fetchAreas() }, [])

  const fetchAreas = async () => {
    try {
      const res = await api.get('/area-parkir', { params: { per_page: 50 } })
      setAreas(res.data.data.data)
    } catch (err) {
      toast.error('Gagal memuat data area')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ kode_area: '', nama_area: '', kapasitas: '', status: 'aktif' })
    setShowModal(true)
  }

  const openEdit = (area) => {
    setEditing(area)
    setForm({ kode_area: area.kode_area, nama_area: area.nama_area, kapasitas: area.kapasitas, status: area.status })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/area-parkir/${editing.id}`, form)
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

  const handleDelete = async (area) => {
    if (!confirm(`Hapus area "${area.nama_area}"?`)) return
    try {
      await api.delete(`/area-parkir/${area.id}`)
      toast.success('Area berhasil dihapus')
      fetchAreas()
    } catch (err) {
      toast.error('Gagal menghapus area')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Area Parkir</h1>
          <p className="text-gray-500 mt-1">Kelola area dan kapasitas parkir</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FiPlus size={18} /> Tambah Area</button>
      </div>

      {/* Area Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area) => {
          const percentage = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
          const color = percentage >= 90 ? 'text-red-600' : percentage >= 70 ? 'text-amber-600' : 'text-emerald-600'
          const bgColor = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
          return (
            <div key={area.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${area.status === 'aktif' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <FiMapPin className={area.status === 'aktif' ? 'text-emerald-600' : 'text-gray-400'} size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{area.kode_area}</h3>
                    <p className="text-sm text-gray-500">{area.nama_area}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(area)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(area)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Kapasitas</span>
                  <span className={`text-sm font-bold ${color}`}>{area.terisi}/{area.kapasitas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`${bgColor} h-3 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${area.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {area.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">Sisa: {area.kapasitas - area.terisi} slot</span>
                </div>
              </div>
            </div>
          )
        })}
        {areas.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">Belum ada data area</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editing ? 'Edit Area' : 'Tambah Area'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Kode Area</label>
                <input type="text" value={form.kode_area} onChange={(e) => setForm({...form, kode_area: e.target.value})} className="input-field" placeholder="A1, B2, C1..." required />
              </div>
              <div>
                <label className="label-field">Nama Area</label>
                <input type="text" value={form.nama_area} onChange={(e) => setForm({...form, nama_area: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Kapasitas</label>
                <input type="number" value={form.kapasitas} onChange={(e) => setForm({...form, kapasitas: e.target.value})} className="input-field" min="1" required />
              </div>
              <div>
                <label className="label-field">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-field">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
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
