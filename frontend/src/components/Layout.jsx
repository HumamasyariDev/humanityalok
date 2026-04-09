import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ChatbotWidget from './ChatbotWidget'
import { 
  FiHome, FiUsers, FiDollarSign, FiMapPin, FiTruck, 
  FiLogIn, FiLogOut, FiList, FiBarChart2, FiActivity,
  FiMenu, FiX, FiUser, FiPower, FiChevronRight
} from 'react-icons/fi'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Grouped menu sections
  const menuSections = [
    {
      label: null,
      items: [
        { to: '/', icon: FiHome, label: 'Dashboard', end: true, roles: ['admin', 'petugas', 'owner'] },
      ]
    },
    {
      label: 'Transaksi',
      roles: ['admin', 'petugas'],
      items: [
        { to: '/transaksi/masuk', icon: FiLogIn, label: 'Kendaraan Masuk', roles: ['admin', 'petugas'] },
        { to: '/transaksi/keluar', icon: FiLogOut, label: 'Kendaraan Keluar', roles: ['admin', 'petugas'] },
        { to: '/transaksi', icon: FiList, label: 'Daftar Transaksi', end: true, roles: ['admin', 'petugas'] },
      ]
    },
    {
      label: 'Data Master',
      roles: ['admin', 'petugas'],
      items: [
        { to: '/kendaraan', icon: FiTruck, label: 'Kendaraan', roles: ['admin', 'petugas'] },
        { to: '/tarif-parkir', icon: FiDollarSign, label: 'Tarif Parkir', roles: ['admin'] },
        { to: '/area-parkir', icon: FiMapPin, label: 'Area Parkir', roles: ['admin'] },
      ]
    },
    {
      label: 'Administrasi',
      roles: ['admin', 'owner'],
      items: [
        { to: '/users', icon: FiUsers, label: 'Kelola User', roles: ['admin'] },
        { to: '/rekap', icon: FiBarChart2, label: 'Rekap Transaksi', roles: ['admin', 'owner'] },
        { to: '/log-aktivitas', icon: FiActivity, label: 'Log Aktivitas', roles: ['admin'] },
      ]
    },
  ]

  const roleBadge = {
    admin: { bg: 'bg-rose-500/20 text-rose-200 ring-rose-400/30', label: 'Admin' },
    petugas: { bg: 'bg-sky-500/20 text-sky-200 ring-sky-400/30', label: 'Petugas' },
    owner: { bg: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30', label: 'Owner' },
  }

  // Find current page and its section for breadcrumb
  let currentSection = null
  let currentPage = null
  for (const section of menuSections) {
    for (const item of section.items) {
      const isMatch = item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to)
      if (isMatch) {
        currentSection = section.label
        currentPage = item
        break
      }
    }
    if (currentPage) break
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 flex-shrink-0">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
          <span className="text-lg font-extrabold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">P</span>
        </div>
        {sidebarOpen && (
          <span className="font-bold text-white text-lg tracking-tight">SmartPark</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-2 pb-4 px-3 overflow-y-auto">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => item.roles.some(r => user?.role === r))
          if (visibleItems.length === 0) return null
          if (section.roles && !section.roles.some(r => user?.role === r)) return null

          return (
            <div key={sIdx} className={sIdx > 0 ? 'mt-5' : ''}>
              {section.label && sidebarOpen && (
                <p className="px-3 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                  {section.label}
                </p>
              )}

              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end || false}
                    onClick={() => setMobileSidebar(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-blue-700 shadow-lg shadow-blue-900/25'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Card */}
      {sidebarOpen && (
        <div className="p-3 flex-shrink-0 border-t border-white/10">
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center ring-2 ring-white/20">
                <FiUser className="text-white" size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.nama_lengkap || user?.name}</p>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ring-1 mt-0.5 ${roleBadge[user?.role]?.bg || ''}`}>
                  {roleBadge[user?.role]?.label || user?.role?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-lg hover:bg-white/15 text-white/60 hover:text-white transition-colors"
              >
                <FiPower size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 min-h-screen transition-all duration-300 flex-col fixed z-30`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebar && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileSidebar(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 z-50 lg:hidden shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[72px]'} transition-all duration-300`}>
        {/* Top Bar with Breadcrumb */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setMobileSidebar(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <FiMenu size={20} />
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              {sidebarOpen ? <FiX size={17} /> : <FiMenu size={17} />}
            </button>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <span className="text-gray-400">SmartPark</span>
              {currentSection && (
                <>
                  <FiChevronRight size={12} className="text-gray-300" />
                  <span className="text-gray-400">{currentSection}</span>
                </>
              )}
              {currentPage && (
                <>
                  <FiChevronRight size={12} className="text-gray-300" />
                  <span className="font-medium text-gray-700">{currentPage.label}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}
