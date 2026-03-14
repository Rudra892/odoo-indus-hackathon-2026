import { useState, useEffect } from 'react';
import { getAdjustments, createAdjustment } from '../api/adjustments';
import { getProducts } from '../api/products';
import { getWarehouses } from '../api/warehouses';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Inbox, ClipboardList } from 'lucide-react';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ product: '', location: '', actualQty: '', reason: '' });
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setLoading(true); const [a, p, w] = await Promise.all([getAdjustments(), getProducts(), getWarehouses()]); setAdjustments(a.data.data || []); setProducts(p.data.data || []); setWarehouses(w.data.data || []); }
    catch (err) { toast.error('Failed to load adjustments'); } finally { setLoading(false); }
  };

  const handleProductChange = (id) => {
    const prod = products.find(p => p._id === id);
    setSelectedProduct(prod);
    setForm(f => ({ ...f, product: id, location: prod?.warehouseId?._id || prod?.warehouseId || '' }));
  };

  const diff = selectedProduct && form.actualQty !== '' ? parseInt(form.actualQty) - selectedProduct.currentStock : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await createAdjustment({ ...form, actualQty: parseInt(form.actualQty) }); setModal(false); setForm({ product: '', location: '', actualQty: '', reason: '' }); setSelectedProduct(null); toast.success('Adjustment applied'); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const filtered = adjustments.filter(a => { if (!search) return true; const t = search.toLowerCase(); return (a.referenceNo?.toLowerCase().includes(t) || a.product?.name?.toLowerCase().includes(t)); });

  if (loading) return (<div><div className="flex justify-between mb-6"><div className="skeleton h-8 w-44" /><div className="skeleton h-10 w-40" /></div><div className="skeleton h-[400px] rounded-2xl" /></div>);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Stock Adjustments</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all"><Plus size={16} /> New Adjustment</button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search reference or product..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[38px] pl-10 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50">
              {['Reference', 'Product', 'Warehouse', 'Recorded', 'Actual', 'Difference', 'Date'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(adj => (
                <tr key={adj._id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-[13px] text-indigo-600 font-semibold">{adj.referenceNo || `ADJ-${adj._id.slice(-4).toUpperCase()}`}</td>
                  <td className="px-6 py-3 text-slate-700 font-medium">{adj.product?.name || 'N/A'}</td>
                  <td className="px-6 py-3 text-slate-500">{adj.location?.name || 'N/A'}</td>
                  <td className="px-6 py-3 text-slate-500">{adj.recordedQty}</td>
                  <td className="px-6 py-3 font-bold text-slate-900">{adj.actualQty}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${adj.difference > 0 ? 'bg-green-100 text-green-700' : adj.difference < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {adj.difference > 0 ? '+' : ''}{adj.difference}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400 text-[13px]">{new Date(adj.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (<tr><td colSpan="7" className="py-16 text-center">
                <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No adjustments yet</p>
                <p className="text-slate-400 text-sm mt-1">Create one to fix stock mismatches</p>
              </td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Stock Adjustment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Product *</label>
            <select value={form.product} onChange={e => handleProductChange(e.target.value)} required
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all appearance-none bg-white">
              <option value="" disabled>Select product...</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Warehouse *</label>
            <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all appearance-none bg-white">
              <option value="" disabled>Select warehouse...</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>

          {/* Three boxes */}
          {selectedProduct && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] font-medium text-slate-500 mb-1">Recorded</p>
                <p className="text-xl font-bold text-slate-900">{selectedProduct.currentStock}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-300 text-center">
                <p className="text-[11px] font-medium text-blue-600 mb-1">Actual</p>
                <input type="number" value={form.actualQty} onChange={e => setForm({ ...form, actualQty: e.target.value })} required min="0"
                  className="w-full text-xl font-bold text-center bg-transparent focus:outline-none text-blue-700" placeholder="0" />
              </div>
              <div className={`p-3 rounded-xl border text-center ${diff !== null ? (diff > 0 ? 'bg-green-50 border-green-200' : diff < 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200') : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[11px] font-medium text-slate-500 mb-1">Difference</p>
                <p className={`text-xl font-bold ${diff !== null ? (diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-slate-400') : 'text-slate-400'}`}>
                  {diff !== null ? (diff > 0 ? '+' + diff : diff) : '—'}
                </p>
              </div>
            </div>
          )}

          {diff !== null && (
            <div className={`p-3 rounded-xl text-sm font-medium ${diff > 0 ? 'bg-green-50 text-green-700' : diff < 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              Stock will change from <strong>{selectedProduct.currentStock}</strong> to <strong>{form.actualQty}</strong> ({diff > 0 ? '+' : ''}{diff} units)
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Reason</label>
            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="e.g. Physical count mismatch" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">Apply Adjustment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
