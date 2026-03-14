import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReceipts, updateReceipt, confirmReceipt, validateReceipt, cancelReceipt } from '../api/receipts';
import { getProducts } from '../api/products';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, CheckCircle, XCircle, FileCheck, Loader2, Trash2, Plus, Check, Info } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const STEPS = ['Draft', 'Waiting', 'Done'];

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [receipt, setReceipt] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [lines, setLines] = useState([]);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes] = await Promise.all([getReceipts({}), getProducts()]);
      const data = rRes.data.data.find(r => r._id === id);
      if (!data) { toast.error('Receipt not found'); navigate('/receipts'); return; }
      setReceipt(data);
      setProductsList(pRes.data.data || []);
      setSupplier(data.supplier || '');
      setScheduledDate(data.scheduledDate ? new Date(data.scheduledDate).toISOString().split('T')[0] : '');
      const formattedLines = (data.products || []).map(p => ({ productId: p.productId?._id || p.productId || '', quantity: p.quantity || 1 }));
      setLines(formattedLines.length ? formattedLines : [{ productId: '', quantity: 1 }]);
    } catch (err) { toast.error('Failed to load receipt'); } finally { setLoading(false); }
  };

  const isDraft = receipt?.status === 'Draft';
  const isWaiting = receipt?.status === 'Waiting';
  const isDone = receipt?.status === 'Done';
  const isCanceled = receipt?.status === 'Canceled';
  const canEdit = isDraft;
  const currentStep = STEPS.indexOf(receipt?.status || 'Draft');

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateReceipt(id, { supplier, scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null, products: lines.filter(l => l.productId) });
      toast.success('Receipt saved'); await loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleAction = async (action) => {
    try {
      setLoading(true);
      if (canEdit && action === 'confirm') {
        await updateReceipt(id, { supplier, scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null, products: lines.filter(l => l.productId) });
      }
      if (action === 'confirm') await confirmReceipt(id);
      else if (action === 'validate') await validateReceipt(id);
      else if (action === 'cancel') await cancelReceipt(id);
      toast.success(`Receipt ${action}ed successfully`); await loadData();
    } catch (err) { toast.error(err.response?.data?.message || `Failed to ${action}`); } finally { setLoading(false); }
  };

  const updateLine = (i, field, val) => { const n = [...lines]; n[i][field] = field === 'quantity' ? (parseInt(val) || 1) : val; setLines(n); };
  const addLine = () => setLines([...lines, { productId: '', quantity: 1 }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  if (loading && !receipt) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/receipts')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-slate-500 text-sm">Receipts / {receipt?.referenceNo}</p>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            {receipt?.referenceNo || 'Draft Receipt'}
          </h1>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCanceled ? 'bg-red-100 text-red-600' :
                  i < currentStep || isDone ? 'bg-green-500 text-white' :
                  i === currentStep ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {i < currentStep || isDone ? <Check size={18} /> : i + 1}
                </div>
                <span className={`mt-2 text-xs font-medium ${i <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 rounded ${i < currentStep ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-6">
        {isDraft && (
          <>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
            </button>
            <button onClick={() => handleAction('confirm')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all">
              <FileCheck size={16} /> Confirm
            </button>
          </>
        )}
        {isWaiting && (
          <button onClick={() => handleAction('validate')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all">
            <CheckCircle size={16} /> Validate
          </button>
        )}
        {isDone && <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg"><CheckCircle size={16} /> Completed</span>}
        {isCanceled && <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg"><XCircle size={16} /> Canceled</span>}
        {(isDraft || isWaiting) && (
          <button onClick={() => handleAction('cancel')} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-sm font-medium rounded-lg transition-all">
            <XCircle size={16} /> Cancel
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Receive From</label>
            {canEdit ? (
              <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
            ) : <p className="text-slate-900 font-medium">{supplier || '-'}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Scheduled Date</label>
            {canEdit ? (
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
            ) : <p className="text-slate-900 font-medium">{scheduledDate ? new Date(scheduledDate).toLocaleDateString() : '-'}</p>}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Products <span className="text-slate-400 text-sm font-normal ml-1">({lines.length} items)</span></h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-1/2">Product</th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Demand</th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Done</th>
                {canEdit && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line, i) => (
                <tr key={i} className="group hover:bg-indigo-50/50 transition-colors">
                  <td className="px-6 py-3">
                    {canEdit ? (
                      <select value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}
                        className="w-full h-9 px-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 appearance-none bg-white">
                        <option value="" disabled>Select product...</option>
                        {productsList.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    ) : <span className="font-medium text-slate-900">{productsList.find(p => p._id === line.productId)?.name || 'Unknown'}</span>}
                  </td>
                  <td className="px-6 py-3">
                    {canEdit ? (
                      <input type="number" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} min="1"
                        className="w-24 h-9 px-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15" />
                    ) : <span className="font-bold text-slate-900">{line.quantity}</span>}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`font-bold ${isDone ? 'text-green-600' : 'text-slate-400'}`}>{isDone ? line.quantity : 0}</span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <button onClick={() => removeLine(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {canEdit && (
            <button onClick={addLine} className="m-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 inline-flex items-center gap-2 transition-all">
              <Plus size={16} /> Add product
            </button>
          )}
        </div>
      </div>

      {/* Stock Impact Banner */}
      {!isDone && !isCanceled && lines.some(l => l.productId) && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-r-xl">
          <Info size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700">Validating this receipt will <strong>increase stock</strong> by the quantities listed above.</p>
        </div>
      )}
    </div>
  );
}
