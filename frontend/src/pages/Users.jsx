import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nama_lengkap: '', username: '', password: '', role: 'petugas', status_aktif: true })
  const [pagination, setPagination] = useState({})

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

  const handleDelete = async (user) => {
    if (!confirm(`Hapus user "${user.nama_lengkap}"?`)) return
    try {
      await api.delete(`/users/${user.id}`)
      toast.success('User berhasil dihapus')
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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
          <p className="text-gray-500 mt-1">Manajemen pengguna sistem</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus size={18} /> Tambah User
        </button>
      </div>

       {/* Search */}
       <form onSubmit={handleSearch} className="flex gap-2">
         <div className="relative flex-1 max-w-md">
           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input
             type="text"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Cari nama atau username..."
             className="input-field pl-10"
           />
         </div>
         <button type="submit" className="btn-primary">Cari</button>
       </form>

      {/* Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="w-full">
             <thead>
               <tr className="table-header">
                 <th className="px-4 py-3">No</th>
                 <th className="px-4 py-3">Nama Lengkap</th>
                 <th className="px-4 py-3">Username</th>
                 <th className="px-4 py-3">Role</th>
                 <th className="px-4 py-3">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {users.map((user, i) => (
                 <tr key={user.id} className="hover:bg-gray-50">
                   <td className="px-4 py-3 text-sm">{(pagination.current_page - 1) * 10 + i + 1}</td>
                   <td className="px-4 py-3 text-sm font-medium">{user.nama_lengkap}</td>
                   <td className="px-4 py-3 text-sm text-gray-600">{user.username}</td>
                   <td className="px-4 py-3">
                     <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[user.role]}`}>
                       {user.role.toUpperCase()}
                     </span>
                   </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => fetchUsers(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${page === pagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editing ? 'Edit User' : 'Tambah User'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="label-field">Nama Lengkap</label>
                 <input type="text" value={form.nama_lengkap} onChange={(e) => setForm({...form, nama_lengkap: e.target.value})} className="input-field" required />
               </div>
               <div>
                 <label className="label-field">Username</label>
                 <input type="text" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="input-field" required />
               </div>
               <div>
                 <label className="label-field">Password {editing && '(kosongkan jika tidak diubah)'}</label>
                 <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field" {...(!editing && { required: true })} />
               </div>
               <div>
                 <label className="label-field">Role</label>
                 <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input-field">
                   <option value="admin">Admin</option>
                   <option value="petugas">Petugas</option>
                   <option value="owner">Owner</option>
                 </select>
               </div>
               <div>
                 <label className="label-field">Status Aktif</label>
                 <select value={form.status_aktif ? '1' : '0'} onChange={(e) => setForm({...form, status_aktif: e.target.value === '1'})} className="input-field">
                   <option value="1">Aktif</option>
                   <option value="0">Tidak Aktif</option>
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
