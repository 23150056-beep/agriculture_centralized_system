import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Package, ShoppingBag, LogOut, LayoutDashboard, Users, Briefcase } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const isFarmer = user?.role === 'farmer';

  // Dynamic navigation based on role
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'officer', 'farmer'] },
    { to: '/farmers', label: 'Farmers', icon: Users, roles: ['admin', 'officer'] },
    { to: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'officer'] },
    { to: '/distributions', label: 'Distributions', icon: ShoppingBag, roles: ['admin', 'officer', 'farmer'] },
    { to: '/programs', label: 'Programs', icon: Briefcase, roles: ['admin', 'officer'] },
  ].filter(item => item.roles.includes(user?.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2 text-green-700 font-bold text-lg">
            <Sprout size={24} /> AgriDistro
          </Link>
          <p className="text-xs text-gray-500 mt-1">Intervention Distribution</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === to
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-800 font-medium mb-1">{user?.name}</div>
          <div className="text-xs text-gray-500 capitalize mb-3">
            {user?.role} {isFarmer && user?.eligibility_status && `• ${user.eligibility_status}`}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 cursor-pointer"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
