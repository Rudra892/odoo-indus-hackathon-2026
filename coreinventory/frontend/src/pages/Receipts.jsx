import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReceipts, createReceipt } from '../api/receipts';
import { useToast } from '../context/ToastContext';
import { Plus, Search, ArrowRight, PackageCheck, Inbox } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getReceipts(params);
      setReceipts(res.data.data || []);
    } catch (err) { toast.error('Failed to load receipts'); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      const res = await createReceipt({ supplier: 'New Supplier', products: [] });
      if (res.data.success) navigate(`/receipts/${res.data.data._id}`);
    } catch (err) { toast.error('Failed to create receipt'); }
  };

  const filtered = receipts.filter(r => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (r.referenceNo?.toLowerCase().includes(term) || r.supplier?.toLowerCase().includes(term));
  });

  if (loading) return (
    <div>
      <div className="flex justify-between mb-6"><div className="skeleton h-8 w-28" /><div className="skeleton h-10 w-36" /></div>
      <div className="skeleton h-12 w-full rounded-lg mb-6" />
      <div className="skeleton h-[400px] rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all">
          <Plus size={16} /> New Receipt
        </button>
      </div>

      {/* Status Tabs + Search */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search reference or supplier..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[38px] pl-10 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Reference', 'Supplier', 'Items', 'Total Qty', 'Scheduled', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r._id} onClick={() => navigate(`/receipts/${r._id}`)} className="hover:bg-indigo-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-3 font-mono text-[13px] text-indigo-600 font-semibold">{r.referenceNo || '-'}</td>
                  <td className="px-6 py-3 text-slate-700 font-medium">{r.supplier || '-'}</td>
                  <td className="px-6 py-3"><span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-medium">{r.products?.length || 0}</span></td>
                  <td className="px-6 py-3 font-bold text-slate-900">{r.products?.reduce((a, p) => a + (p.quantity || 0), 0) || 0}</td>
                  <td className="px-6 py-3 text-slate-500 text-[13px]">{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-3"><ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="py-16 text-center">
                  <Inbox size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No receipts found</p>
                  <p className="text-slate-400 text-sm mt-1">Create your first receipt to get started</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
