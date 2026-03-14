import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getWarehouses } from '../api/warehouses';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit2, Trash2, Package, Check, AlertTriangle, XCircle } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [whFilter, setWhFilter] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit: '', currentStock: 0, lowStockThreshold: 10, warehouseId: '' });
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, w] = await Promise.all([getProducts(), getWarehouses()]);
      setProducts(p.data.data || []);
      setWarehouses(w.data.data || []);
    } catch (err) { toast.error('Failed to load products'); } finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', sku: '', category: '', unit: '', currentStock: 0, lowStockThreshold: 10, warehouseId: '' }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku, category: p.category || '', unit: p.unit || '', currentStock: p.currentStock, lowStockThreshold: p.lowStockThreshold, warehouseId: p.warehouseId?._id || p.warehouseId || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateProduct(editing._id, form); toast.success('Product updated'); }
      else { await createProduct(form); toast.success('Product created'); }
      setModal(false); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await deleteProduct(id); toast.success('Product deleted'); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && p.category !== catFilter) return false;
    if (whFilter && (p.warehouseId?._id || p.warehouseId) !== whFilter) return false;
    if (lowOnly && p.currentStock > p.lowStockThreshold) return false;
    return true;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const inStock = products.filter(p => p.currentStock > p.lowStockThreshold).length;
  const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= p.lowStockThreshold).length;
  const outStock = products.filter(p => p.currentStock === 0).length;

  const stockBadge = (p) => {
    if (p.currentStock === 0) return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">Out of Stock</span>;
    if (p.currentStock <= p.lowStockThreshold) return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700">Low Stock</span>;
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">In Stock</span>;
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between mb-6"><div className="skeleton h-8 w-32" /><div className="skeleton h-10 w-36" /></div>
        <div className="grid grid-cols-4 gap-4 mb-6">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        <div className="skeleton h-[400px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: products.length, icon: Package, color: 'text-blue-600' },
          { label: 'In Stock', value: inStock, icon: Check, color: 'text-green-600' },
          { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Out of Stock', value: outStock, icon: XCircle, color: 'text-red-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..."
            className="w-full h-[38px] pl-10 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="h-[38px] px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={whFilter} onChange={e => setWhFilter(e.target.value)}
          className="h-[38px] px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15">
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <button onClick={() => setLowOnly(!lowOnly)}
          className={`h-[38px] px-3 rounded-lg text-sm font-medium transition-all border ${lowOnly ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
          Low Stock Only
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['#', 'Product', 'Category', 'Unit', 'Stock', 'Warehouse', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p, i) => (
                <tr key={p._id} className="hover:bg-indigo-50/50 transition-colors group">
                  <td className="px-6 py-3 text-slate-400 font-medium">{i + 1}</td>
                  <td className="px-6 py-3">
                    <p className="font-semibold text-slate-900 text-[13px]">{p.name}</p>
                    <p className="text-slate-400 text-[11px] font-mono">{p.sku}</p>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{p.category || '-'}</td>
                  <td className="px-6 py-3 text-slate-500">{p.unit || '-'}</td>
                  <td className="px-6 py-3">{stockBadge(p)}</td>
                  <td className="px-6 py-3 text-slate-600">{p.warehouseId?.name || '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Package size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No products found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Product Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              placeholder="Enter product name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">SKU *</label>
              <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="SKU code" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="e.g. Raw Material" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="e.g. kg, pcs" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Warehouse</label>
              <select value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all appearance-none bg-white">
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Initial Stock</label>
              <input type="number" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: parseInt(e.target.value) || 0 })} min="0"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Low Stock Threshold</label>
              <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: parseInt(e.target.value) || 0 })} min="0"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
              {editing ? 'Save Changes' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
