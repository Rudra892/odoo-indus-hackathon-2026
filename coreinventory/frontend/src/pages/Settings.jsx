import { useState, useEffect } from 'react';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../api/warehouses';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api/locations';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Plus, Edit2, Trash2, MapPin, Target, Settings as SettingsIcon, Warehouse, Building } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('warehouses');
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [whModal, setWhModal] = useState(false);
  const [locModal, setLocModal] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [editingLoc, setEditingLoc] = useState(null);
  const [whForm, setWhForm] = useState({ name: '', roomCode: '', address: '' });
  const [locForm, setLocForm] = useState({ name: '', shortCode: '', warehouseId: '' });
  const toast = useToast();

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'warehouses') { const res = await getWarehouses(); setWarehouses(res.data.data || []); }
      else { const [lRes, wRes] = await Promise.all([getLocations(), getWarehouses()]); setLocations(lRes.data.data || []); setWarehouses(wRes.data.data || []); }
    } catch (err) { toast.error(`Failed to load ${activeTab}`); }
  };

  const openWhCreate = () => { setEditingWh(null); setWhForm({ name: '', roomCode: '', address: '' }); setWhModal(true); };
  const openWhEdit = (w) => { setEditingWh(w); setWhForm({ name: w.name, roomCode: w.roomCode || '', address: w.address || '' }); setWhModal(true); };
  const handleWhSubmit = async (e) => { e.preventDefault(); try { if (editingWh) await updateWarehouse(editingWh._id, whForm); else await createWarehouse(whForm); setWhModal(false); toast.success(`Warehouse ${editingWh ? 'updated' : 'created'}`); loadData(); } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); } };
  const handleWhDelete = async (id) => { if (!confirm('Delete this warehouse?')) return; try { await deleteWarehouse(id); toast.success('Deleted'); loadData(); } catch (err) { toast.error(err.response?.data?.message || 'Error deleting'); } };

  const openLocCreate = () => { setEditingLoc(null); setLocForm({ name: '', shortCode: '', warehouseId: '' }); setLocModal(true); };
  const openLocEdit = (l) => { setEditingLoc(l); setLocForm({ name: l.name, shortCode: l.shortCode || '', warehouseId: l.warehouseId?._id || '' }); setLocModal(true); };
  const handleLocSubmit = async (e) => { e.preventDefault(); try { if (editingLoc) await updateLocation(editingLoc._id, locForm); else await createLocation(locForm); setLocModal(false); toast.success(`Location ${editingLoc ? 'updated' : 'created'}`); loadData(); } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); } };
  const handleLocDelete = async (id) => { if (!confirm('Delete this location?')) return; try { await deleteLocation(id); toast.success('Deleted'); loadData(); } catch (err) { toast.error(err.response?.data?.message || 'Error deleting'); } };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage warehouses and inventory locations</p>
        </div>
        {activeTab === 'warehouses' ? (
          <button onClick={openWhCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all"><Plus size={16} /> Add Warehouse</button>
        ) : (
          <button onClick={openLocCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all"><Plus size={16} /> Add Location</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-slate-200 rounded-lg p-1 gap-0.5 mb-6 w-fit">
        <button onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'warehouses' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
          <Building size={16} /> Warehouses
        </button>
        <button onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'locations' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
          <Target size={16} /> Locations
        </button>
      </div>

      {activeTab === 'warehouses' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                {['Name', 'Room Code', 'Address', 'Actions'].map(h => (<th key={h} className={`${h === 'Actions' ? 'text-right' : 'text-left'} px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider`}>{h}</th>))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map(w => (
                  <tr key={w._id} className="hover:bg-indigo-50/50 transition-colors group">
                    <td className="px-6 py-3"><div className="flex items-center gap-2.5"><MapPin size={16} className="text-indigo-400" /><span className="font-semibold text-slate-900">{w.name}</span></div></td>
                    <td className="px-6 py-3 font-mono text-[13px] text-slate-500">{w.roomCode || '-'}</td>
                    <td className="px-6 py-3 text-slate-500">{w.address || '-'}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openWhEdit(w)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => handleWhDelete(w._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {warehouses.length === 0 && (<tr><td colSpan="4" className="py-16 text-center"><Building size={48} className="mx-auto text-slate-300 mb-3" /><p className="text-slate-500 font-medium">No warehouses configured</p><p className="text-slate-400 text-sm mt-1">Add your first warehouse to get started</p></td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                {['Location', 'Short Code', 'Warehouse', 'Actions'].map(h => (<th key={h} className={`${h === 'Actions' ? 'text-right' : 'text-left'} px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider`}>{h}</th>))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map(l => (
                  <tr key={l._id} className="hover:bg-indigo-50/50 transition-colors group">
                    <td className="px-6 py-3"><div className="flex items-center gap-2.5"><Target size={16} className="text-rose-400" /><span className="font-semibold text-slate-900">{l.name}</span></div></td>
                    <td className="px-6 py-3 font-mono text-[13px] text-slate-500">{l.shortCode || '-'}</td>
                    <td className="px-6 py-3 text-slate-600">{l.warehouseId?.name || '-'}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openLocEdit(l)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => handleLocDelete(l._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {locations.length === 0 && (<tr><td colSpan="4" className="py-16 text-center"><Target size={48} className="mx-auto text-slate-300 mb-3" /><p className="text-slate-500 font-medium">No locations configured</p></td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouse Modal */}
      <Modal isOpen={whModal} onClose={() => setWhModal(false)} title={editingWh ? 'Edit Warehouse' : 'Add Warehouse'}>
        <form onSubmit={handleWhSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={whForm.name} onChange={e => setWhForm({...whForm, name: e.target.value})} required
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="e.g. Main Warehouse" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Room Code</label>
            <input type="text" value={whForm.roomCode} onChange={e => setWhForm({...whForm, roomCode: e.target.value})}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="e.g. WH-01" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={whForm.address} onChange={e => setWhForm({...whForm, address: e.target.value})}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="Full address" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setWhModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">Save</button>
          </div>
        </form>
      </Modal>

      {/* Location Modal */}
      <Modal isOpen={locModal} onClose={() => setLocModal(false)} title={editingLoc ? 'Edit Location' : 'Add Location'}>
        <form onSubmit={handleLocSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={locForm.name} onChange={e => setLocForm({...locForm, name: e.target.value})} required
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="e.g. Shelf A1" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Short Code</label>
            <input type="text" value={locForm.shortCode} onChange={e => setLocForm({...locForm, shortCode: e.target.value})}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" placeholder="e.g. A1" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Warehouse *</label>
            <select value={locForm.warehouseId} onChange={e => setLocForm({...locForm, warehouseId: e.target.value})} required
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all appearance-none bg-white">
              <option value="" disabled>Select warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setLocModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
