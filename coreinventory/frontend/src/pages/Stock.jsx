import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import { createAdjustment } from '../api/adjustments';
import { useToast } from '../context/ToastContext';
import { Search, Edit2, Inbox, BarChart3, Check, X } from 'lucide-react';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setLoading(true); const res = await getProducts(); setProducts(res.data.data || []); }
    catch (err) { toast.error('Failed to load stock'); } finally { setLoading(false); }
  };

  const startEdit = (p) => { setEditingId(p._id); setEditValue(p.currentStock.toString()); };
  const cancelEdit = () => { setEditingId(null); setEditValue(''); };
  const saveEdit = async (p) => {
    const newVal = parseInt(editValue);
    if (isNaN(newVal) || newVal < 0) return toast.error('Enter a valid positive number');
    if (newVal === p.currentStock) return cancelEdit();
    try {
      setSaving(true);
      await createAdjustment({ product: p._id, location: p.warehouseId?._id || p.warehouseId || null, actualQty: newVal, reason: 'Inline Stock Update' });
      toast.success('Stock updated'); setEditingId(null); await loadData();
    } catch (err) { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  const filtered = products.filter(p => { if (!search) return true; const t = search.toLowerCase(); return (p.name?.toLowerCase().includes(t) || p.sku?.toLowerCase().includes(t)); });

  const getStockColor = (p) => {
    if (p.currentStock === 0) return 'text-red-600 bg-red-50';
    if (p.currentStock <= p.lowStockThreshold) return 'text-orange-600 bg-orange-50';
    return 'text-slate-900';
  };

  if (loading) return (<div><div className="mb-6"><div className="skeleton h-8 w-40" /></div><div className="skeleton h-[400px] rounded-2xl" /></div>);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Stock Overview</h1>
        <p className="text-sm text-slate-500 mt-1">View current stock levels and make quick adjustments</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[38px] pl-10 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50">
              {['SKU', 'Product', 'Category', 'Warehouse', 'Stock', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-indigo-50/50 transition-colors group">
                  <td className="px-6 py-3 font-mono text-[13px] text-slate-500">{p.sku || '-'}</td>
                  <td className="px-6 py-3 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-6 py-3 text-slate-500">{p.category || '-'}</td>
                  <td className="px-6 py-3 text-slate-600">{p.warehouseId?.name || '-'}</td>
                  <td className="px-6 py-3">
                    {editingId === p._id ? (
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit(p)}
                        className="w-24 h-8 px-2 border-2 border-indigo-500 rounded-lg text-sm font-bold focus:outline-none" />
                    ) : (
                      <span className={`text-lg font-bold px-2 py-0.5 rounded ${getStockColor(p)}`}>{p.currentStock}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {editingId === p._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={cancelEdit} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={15} /></button>
                        <button onClick={() => saveEdit(p)} disabled={saving} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all"><Check size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} className="py-1 px-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-semibold">
                        <Edit2 size={13} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (<tr><td colSpan="6" className="py-16 text-center">
                <BarChart3 size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No products found</p>
              </td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
