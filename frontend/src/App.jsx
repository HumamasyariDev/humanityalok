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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-5">
          <span className="text-3xl font-extrabold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">P</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">SmartPark</h1>
        <p className="text-blue-200/70 text-sm mt-1">Sistem Manajemen Parkir</p>
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />

  return children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

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
