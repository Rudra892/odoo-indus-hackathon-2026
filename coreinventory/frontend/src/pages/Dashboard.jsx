import { useState, useEffect } from 'react';
import { getKPIs } from '../api/dashboard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Package, AlertTriangle, XCircle, 
  PackageCheck, Truck, ArrowLeftRight, 
  Inbox, Loader2, Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getKPIs();
      if (!res.data.success) throw new Error(res.data.message);
      const data = res.data.data;
      setKpis(data);
      setActivity(data.recentActivity || []);
    } catch (err) { 
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const map = {
      receipt: 'bg-green-100 text-green-700',
      delivery: 'bg-blue-100 text-blue-700',
      transfer: 'bg-purple-100 text-purple-700',
      adjustment: 'bg-orange-100 text-orange-700',
    };
    return map[type?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const kpiCards = kpis ? [
    { label: 'Total Products', value: kpis.totalProducts, icon: Package, color: 'border-blue-500', iconBg: 'bg-blue-100 text-blue-600', textColor: '' },
    { label: 'Low Stock', value: kpis.lowStock, icon: AlertTriangle, color: 'border-amber-500', iconBg: 'bg-amber-100 text-amber-600', textColor: kpis.lowStock > 0 ? 'text-amber-600' : '' },
    { label: 'Out of Stock', value: kpis.outOfStock, icon: XCircle, color: 'border-red-500', iconBg: 'bg-red-100 text-red-600', textColor: kpis.outOfStock > 0 ? 'text-red-600' : '' },
    { label: 'Pending Receipts', value: kpis.pendingReceipts, icon: PackageCheck, color: 'border-emerald-500', iconBg: 'bg-emerald-100 text-emerald-600', textColor: '' },
    { label: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: Truck, color: 'border-purple-500', iconBg: 'bg-purple-100 text-purple-600', textColor: '' },
    { label: 'Total Transfers', value: kpis.totalTransfers, icon: ArrowLeftRight, color: 'border-cyan-500', iconBg: 'bg-cyan-100 text-cyan-600', textColor: '' },
  ] : [];

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8"><div className="skeleton h-8 w-48 mb-2" /><div className="skeleton h-5 w-64" /></div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-[120px] rounded-2xl" />)}
        </div>
        <div className="skeleton h-[300px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name || 'User'} 👋</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {kpiCards.map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl shadow-sm border-l-4 ${card.color} p-5 card-hover cursor-pointer`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-[13px] text-slate-500 font-medium">{card.label}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className={`text-4xl font-bold ${card.textColor || 'text-slate-900'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
          <button onClick={() => navigate('/move-history')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            View All →
          </button>
        </div>

        {activity.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No recent activity yet</p>
            <p className="text-slate-400 text-sm mt-1">Start by creating a receipt or delivery</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Done By</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activity.map((item, i) => (
                  <tr key={item._id || i} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-[13px] text-indigo-600 font-medium">{item.reference || '-'}</td>
                    <td className="px-6 py-3 text-slate-700">{item.productId?.name || 'N/A'}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900">{item.quantity || '-'}</td>
                    <td className="px-6 py-3 text-slate-500">{item.performedBy?.name || 'System'}</td>
                    <td className="px-6 py-3 text-slate-400 text-[13px]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
