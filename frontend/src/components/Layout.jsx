import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FiHome, FiUsers, FiDollarSign, FiMapPin, FiTruck, 
  FiLogIn, FiLogOut, FiList, FiBarChart2, FiActivity,
  FiMenu, FiX, FiChevronDown, FiUser
} from 'react-icons/fi'

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { to: '/', icon: FiHome, label: 'Dashboard', roles: ['admin', 'petugas', 'owner'] },
    { to: '/transaksi/masuk', icon: FiLogIn, label: 'Kendaraan Masuk', roles: ['admin', 'petugas'] },
    { to: '/transaksi/keluar', icon: FiLogOut, label: 'Kendaraan Keluar', roles: ['admin', 'petugas'] },
    { to: '/transaksi', icon: FiList, label: 'Daftar Transaksi', roles: ['admin', 'petugas'] },
    { to: '/kendaraan', icon: FiTruck, label: 'Kendaraan', roles: ['admin', 'petugas'] },
    { to: '/tarif-parkir', icon: FiDollarSign, label: 'Tarif Parkir', roles: ['admin'] },
    { to: '/area-parkir', icon: FiMapPin, label: 'Area Parkir', roles: ['admin'] },
    { to: '/users', icon: FiUsers, label: 'Kelola User', roles: ['admin'] },
    { to: '/rekap', icon: FiBarChart2, label: 'Rekap Transaksi', roles: ['admin', 'owner'] },
    { to: '/log-aktivitas', icon: FiActivity, label: 'Log Aktivitas', roles: ['admin'] },
  ]

  const filteredMenu = menuItems.filter(item => item.roles.some(r => user?.role === r))

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    petugas: 'bg-blue-100 text-blue-700',
    owner: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 min-h-screen transition-all duration-300 flex flex-col fixed z-30`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-gray-800">SmartPark</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-gray-800">Smart Parking System</h2>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <FiUser className="text-white" size={16} />
              </div>
              {sidebarOpen && (
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user?.role]}`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              )}
              <FiChevronDown size={16} className="text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
      )}
    </div>
  )
}
