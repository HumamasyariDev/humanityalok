import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import TarifParkir from './pages/TarifParkir'
import AreaParkir from './pages/AreaParkir'
import Kendaraan from './pages/Kendaraan'
import TransaksiMasuk from './pages/TransaksiMasuk'
import TransaksiKeluar from './pages/TransaksiKeluar'
import TransaksiList from './pages/TransaksiList'
import Rekap from './pages/Rekap'
import LogAktivitas from './pages/LogAktivitas'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />

  return children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="tarif-parkir" element={<ProtectedRoute roles={['admin']}><TarifParkir /></ProtectedRoute>} />
        <Route path="area-parkir" element={<ProtectedRoute roles={['admin']}><AreaParkir /></ProtectedRoute>} />
        <Route path="kendaraan" element={<ProtectedRoute roles={['admin', 'petugas']}><Kendaraan /></ProtectedRoute>} />
        <Route path="transaksi/masuk" element={<ProtectedRoute roles={['admin', 'petugas']}><TransaksiMasuk /></ProtectedRoute>} />
        <Route path="transaksi/keluar" element={<ProtectedRoute roles={['admin', 'petugas']}><TransaksiKeluar /></ProtectedRoute>} />
        <Route path="transaksi" element={<ProtectedRoute roles={['admin', 'petugas']}><TransaksiList /></ProtectedRoute>} />
        <Route path="rekap" element={<ProtectedRoute roles={['admin', 'owner']}><Rekap /></ProtectedRoute>} />
        <Route path="log-aktivitas" element={<ProtectedRoute roles={['admin']}><LogAktivitas /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
