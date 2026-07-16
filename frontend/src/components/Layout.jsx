import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import api from '../lib/api'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/residents', label: 'Penghuni', icon: '👥' },
  { to: '/houses', label: 'Rumah', icon: '🏠' },
  { to: '/payments', label: 'Pembayaran', icon: '💰' },
  { to: '/expenses', label: 'Pengeluaran', icon: '🧾' },
]

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  async function handleLogout() {
    try {
      await api.post('/logout')
    } catch {
      // token mungkin sudah tidak valid, tetap lanjut logout lokal
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-700">
          <h1 className="text-lg font-bold">Administrasi RT</h1>
          <p className="text-xs text-slate-400 mt-1">Perumahan Elite</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-700">
          <p className="text-sm font-medium truncate">{user.name || 'Admin'}</p>
          <p className="text-xs text-slate-400 truncate mb-3">{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-slate-800 hover:bg-red-600 px-3 py-2 text-sm font-medium transition"
          >
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}
