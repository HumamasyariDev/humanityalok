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
    admin: 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 font-bold',
    petugas: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-bold',
    owner: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 font-bold',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/80 backdrop-blur-xl border-r-2 border-gray-200/50 min-h-screen transition-all duration-300 flex flex-col fixed z-30 shadow-lg`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b-2 border-gray-200/50">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">SmartPark</span>
                <p className="text-xs text-gray-600 font-medium">Parkir Terintegrasi</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200">
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gray-100/50 hover:scale-105'
                }`
              }
            >
              <item.icon size={22} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 bg-white/60 backdrop-blur-xl border-b-2 border-gray-200/50 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Smart Parking System</h2>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100/50 transition-all duration-300 hover:scale-105 transform"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <FiUser className="text-white" size={18} />
              </div>
               {sidebarOpen && (
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{user?.nama_lengkap || user?.name}</p>
                    <span className={`text-xs px-3 py-1 rounded-full ${roleColors[user?.role]} inline-block mt-0.5`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                )}
               <FiChevronDown size={18} className="text-gray-600" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-gray-200/50 py-2 z-50 animate-scale">
                <div className="px-5 py-3 border-b-2 border-gray-200/50">
                    <p className="text-sm font-bold text-gray-900">{user?.nama_lengkap || user?.name}</p>
                    <p className="text-xs text-gray-600 font-medium mt-1">{user?.username || user?.email}</p>
                  </div>
                 <button
                   onClick={handleLogout}
                   className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50/50 flex items-center gap-3 font-semibold transition-colors duration-200 group"
                 >
                   <FiLogOut size={18} className="group-hover:scale-125 transition-transform duration-300" />
                   Logout
                 </button>
               </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 min-h-[calc(100vh-64px)]">
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
