import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getKPIs } from '../api/dashboard';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/receipts': 'Receipts',
  '/deliveries': 'Deliveries',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Stock Adjustments',
  '/move-history': 'Movement History',
  '/stock': 'Stock Overview',
  '/settings': 'Settings',
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [lowStock, setLowStock] = useState(0);

  // Get page title from current path
  const pathBase = '/' + location.pathname.split('/')[1];
  const pageTitle = pageTitles[pathBase] || 'CoreInventory';

  useEffect(() => {
    getKPIs().then(res => {
      if (res.data?.data) {
        setLowStock((res.data.data.lowStock || 0) + (res.data.data.outOfStock || 0));
      }
    }).catch(() => {});
  }, [location.pathname]);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="navbar flex items-center justify-between px-6">
      {/* Left: Page Title */}
      <h1 className="text-lg font-bold text-slate-900">{pageTitle}</h1>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          {lowStock > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200" />

        {/* User */}
        <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-slate-700">{user?.name || 'User'}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
