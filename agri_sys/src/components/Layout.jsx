import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Package, ShoppingBag, LogOut, LayoutDashboard, Users, Briefcase, Building2 } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'officer', 'farmer'] },
    { to: '/farmers', label: 'Farmer Registry', icon: Users, roles: ['admin', 'officer'] },
    { to: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'officer'] },
    { to: '/distributions', label: 'Distributions', icon: ShoppingBag, roles: ['admin', 'officer', 'farmer'] },
    { to: '/programs', label: 'Programs', icon: Briefcase, roles: ['admin', 'officer'] },
  ].filter(item => item.roles.includes(user?.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleBadge = {
    admin: 'bg-red-100 text-red-700',
    officer: 'bg-blue-100 text-blue-700',
    farmer: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-green-950 flex flex-col flex-shrink-0 shadow-xl">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-green-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow">
              <Sprout size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">AgriDistro</p>
              <p className="text-green-400 text-[11px] leading-tight">Gov. Intervention System</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Navigation</p>
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-green-700 text-white shadow-sm' : 'text-green-300 hover:bg-green-800/50 hover:text-white'
                }`}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-green-400'} />
                <span className="flex-1">{label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-green-300" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 pb-5 border-t border-green-800 pt-4">
          <div className="bg-green-900/50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${roleBadge[user?.role] || 'bg-gray-100 text-gray-700'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-green-400 hover:text-red-400 hover:bg-green-900/40 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 px-8 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 size={13} className="text-green-700" />
            <span className="font-medium text-slate-700">Agricultural Intervention Distribution System</span>
          </div>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
