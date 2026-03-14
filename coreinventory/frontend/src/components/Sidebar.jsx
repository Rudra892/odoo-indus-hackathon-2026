import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Package, PackageCheck, Truck, ArrowLeftRight, 
  ClipboardList, History, BarChart3, Settings, LogOut, Box
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/receipts', icon: PackageCheck, label: 'Receipts' },
  { to: '/deliveries', icon: Truck, label: 'Deliveries' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/adjustments', icon: ClipboardList, label: 'Adjustments' },
  { to: '/move-history', icon: History, label: 'Move History' },
  { to: '/stock', icon: BarChart3, label: 'Stock' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo Section */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-3">
          <Box size={24} className="text-white" />
          <div>
            <h1 className="text-white font-bold text-[15px] leading-tight">CoreInventory</h1>
            <span className="text-indigo-200 text-[10px] font-medium">v2.0</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-slate-400 text-[11px] truncate">{user?.role || 'Staff'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
        <p className="text-slate-600 text-[10px] text-center">© 2026 CoreInventory</p>
      </div>
    </aside>
  );
}
