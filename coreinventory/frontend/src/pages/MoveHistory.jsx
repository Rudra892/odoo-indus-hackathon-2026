import { useState, useEffect } from 'react';
import { getMovements } from '../api/movements';
import { useToast } from '../context/ToastContext';
import { Search, Inbox, History } from 'lucide-react';

const TYPES = ['', 'Receipt', 'Delivery', 'Transfer', 'Adjustment'];

export default function MoveHistory() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const toast = useToast();

  useEffect(() => { loadData(); }, [typeFilter]);

  const loadData = async () => {
    try { setLoading(true); const params = {}; if (typeFilter) params.type = typeFilter; const res = await getMovements(params); setMovements(res.data.data || []); }
    catch (err) { toast.error('Failed to load history'); } finally { setLoading(false); }
  };

  const getTypeColor = (type) => {
    const map = { receipt: 'bg-green-100 text-green-700', delivery: 'bg-blue-100 text-blue-700', transfer: 'bg-purple-100 text-purple-700', adjustment: 'bg-orange-100 text-orange-700' };
    return map[type?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };
  const getQtyPrefix = (type) => { if (type?.toLowerCase() === 'receipt') return '+'; if (type?.toLowerCase() === 'delivery') return '-'; return ''; };
  const getQtyColor = (type) => { if (type?.toLowerCase() === 'receipt') return 'text-green-600'; if (type?.toLowerCase() === 'delivery') return 'text-red-600'; return 'text-slate-900'; };

  const filtered = movements.filter(m => { if (!search) return true; const t = search.toLowerCase(); return (m.referenceNo?.toLowerCase().includes(t) || m.product?.name?.toLowerCase().includes(t)); });

  if (loading) return (<div><div className="mb-6"><div className="skeleton h-8 w-36" /></div><div className="skeleton h-[400px] rounded-2xl" /></div>);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Movement History</h1>
        <p className="text-sm text-slate-500 mt-1">Complete audit log of all inventory movements</p>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search reference or product..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[38px] pl-10 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
          {TYPES.map(t => (<button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${typeFilter === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>{t || 'All Types'}</button>))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50">
              {['Date', 'Reference', 'Type', 'Product', 'Location', 'Qty', 'By'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(m => (
                <tr key={m._id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-6 py-3 text-slate-400 text-[13px] whitespace-nowrap">{new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-3 font-mono text-[13px] text-indigo-600 font-semibold">{m.referenceNo || '-'}</td>
                  <td className="px-6 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${getTypeColor(m.type)}`}>{m.type}</span></td>
                  <td className="px-6 py-3 text-slate-700 font-medium">{m.product?.name || m.productId?.name || 'Unknown'}</td>
                  <td className="px-6 py-3 text-slate-500">{m.location?.name || m.warehouse?.name || '-'}</td>
                  <td className="px-6 py-3"><span className={`font-bold ${getQtyColor(m.type)}`}>{getQtyPrefix(m.type)}{m.quantity}</span></td>
                  <td className="px-6 py-3 text-slate-500">{m.performedBy?.name || 'System'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (<tr><td colSpan="7" className="py-16 text-center">
                <History size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No movements found</p>
                <p className="text-slate-400 text-sm mt-1">Inventory movements will appear here as operations complete</p>
              </td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
