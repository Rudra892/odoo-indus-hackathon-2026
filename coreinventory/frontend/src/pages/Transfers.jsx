import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransfers, createTransfer } from '../api/transfers';
import { useToast } from '../context/ToastContext';
import { Plus, Search, ArrowRight, Inbox } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['', 'Draft', 'Ready', 'Done', 'Canceled'];

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, [statusFilter]);

  const loadData = async () => {
    try { setLoading(true); const params = {}; if (statusFilter) params.status = statusFilter; const res = await getTransfers(params); setTransfers(res.data.data || []); }
    catch (err) { toast.error('Failed to load transfers'); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try { const res = await createTransfer({ fromWarehouse: null, toWarehouse: null, products: [] }); if (res.data.success) navigate(`/transfers/${res.data.data._id}`); }
    catch (err) { toast.error('Failed to create transfer'); }
  };

  const filtered = transfers.filter(t => { if (!search) return true; const term = search.toLowerCase(); return (t.referenceNo?.toLowerCase().includes(term) || t.fromWarehouse?.name?.toLowerCase().includes(term) || t.toWarehouse?.name?.toLowerCase().includes(term)); });

  if (loading) return (<div><div className="flex justify-between mb-6"><div className="skeleton h-8 w-40" /><div className="skeleton h-10 w-36" /></div><div className="skeleton h-[400px] rounded-2xl" /></div>);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Internal Transfers</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all"><Plus size={16} /> New Transfer</button>
      </div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search reference or warehouse..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[38px] pl-10 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
          {STATUSES.map(s => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>{s || 'All'}</button>))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50">
              {['Reference', 'From → To', 'Items', 'Scheduled', 'Status', ''].map(h => (<th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(t => (
                <tr key={t._id} onClick={() => navigate(`/transfers/${t._id}`)} className="hover:bg-indigo-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-3 font-mono text-[13px] text-indigo-600 font-semibold">{t.referenceNo || '-'}</td>
                  <td className="px-6 py-3 text-slate-700">
                    <span className="font-medium">{t.fromWarehouse?.name || '—'}</span>
                    <span className="text-indigo-400 mx-2">→</span>
                    <span className="font-medium">{t.toWarehouse?.name || '—'}</span>
                  </td>
                  <td className="px-6 py-3 font-bold text-slate-900">{t.products?.reduce((a, p) => a + (p.quantity || 0), 0) || 0}</td>
                  <td className="px-6 py-3 text-slate-500 text-[13px]">{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-6 py-3"><ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (<tr><td colSpan="6" className="py-16 text-center"><Inbox size={48} className="mx-auto text-slate-300 mb-3" /><p className="text-slate-500 font-medium">No transfers found</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
