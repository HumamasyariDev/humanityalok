import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUser, FiShield } from 'react-icons/fi'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nama_lengkap: '', username: '', password: '', role: 'petugas', status_aktif: true })
  const [pagination, setPagination] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async (page = 1) => {
    try {
      const res = await api.get('/users', { params: { page, search, per_page: 10 } })
      setUsers(res.data.data.data)
      setPagination(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ nama_lengkap: '', username: '', password: '', role: 'petugas', status_aktif: true })
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({ nama_lengkap: user.nama_lengkap, username: user.username, password: '', role: user.role, status_aktif: user.status_aktif })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.put(`/users/${editing.id}`, payload)
        toast.success('User berhasil diupdate')
      } else {
        await api.post('/users', form)
        toast.success('User berhasil ditambahkan')
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan user')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      toast.success('User berhasil dihapus')
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      toast.error('Gagal menghapus user')
    }
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    petugas: 'bg-blue-100 text-blue-700',
    owner: 'bg-emerald-100 text-emerald-700',
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
          <p className="text-sm font-medium text-blue-600 mb-1">Administrasi</p>
          <h1 className="page-title">Kelola User</h1>
          <p className="page-subtitle">Manajemen pengguna sistem parkir</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus size={18} /> Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau username..."
              className="input-field pl-11"
            />
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
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Username</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{(pagination.current_page - 1) * 10 + i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-600/20">
                        <FiUser className="text-white" size={14} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{user.nama_lengkap}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">@{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${roleColors[user.role]}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.status_aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.status_aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Hapus">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <FiUser className="mx-auto mb-2" size={28} />
                    <p className="text-sm">Tidak ada data user</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
            <div className="flex gap-1.5">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => fetchUsers(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    page === pagination.current_page
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
                  <FiShield className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit User' : 'Tambah User Baru'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <FiX size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Nama Lengkap</label>
                <input type="text" value={form.nama_lengkap} onChange={(e) => setForm({...form, nama_lengkap: e.target.value})} className="input-field" placeholder="Masukkan nama lengkap" required />
              </div>
              <div>
                <label className="label-field">Username</label>
                <input type="text" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="input-field" placeholder="Masukkan username" required />
              </div>
              <div>
                <label className="label-field">Password {editing && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field" placeholder="Masukkan password" {...(!editing && { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Role</label>
                  <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input-field">
                    <option value="admin">Admin</option>
                    <option value="petugas">Petugas</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={form.status_aktif ? '1' : '0'} onChange={(e) => setForm({...form, status_aktif: e.target.value === '1'})} className="input-field">
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                  </select>
                </div>
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
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${deleteTarget?.nama_lengkap}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
