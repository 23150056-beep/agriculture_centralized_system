import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Pencil, Package, AlertTriangle, X, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['seeds', 'fertilizers', 'pesticides', 'equipment', 'livestock', 'feeds', 'irrigation', 'other'];
const empty = { name: '', description: '', category: 'other', initial_stock: '', reorder_level: '', unit: 'kg', supplier_name: '', batch_number: '', storage_location: '' };

const categoryColors = {
  seeds: 'bg-emerald-100 text-emerald-700',
  fertilizers: 'bg-lime-100 text-lime-700',
  pesticides: 'bg-orange-100 text-orange-700',
  equipment: 'bg-slate-100 text-slate-600',
  livestock: 'bg-amber-100 text-amber-700',
  feeds: 'bg-yellow-100 text-yellow-700',
  irrigation: 'bg-sky-100 text-sky-700',
  other: 'bg-purple-100 text-purple-700',
};

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/products/').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const openCreate = () => { setForm(empty); setEditing(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      initial_stock: p.initial_stock,
      reorder_level: p.reorder_level,
      unit: p.unit,
      supplier_name: p.supplier_name || '',
      batch_number: p.batch_number || '',
      storage_location: p.storage_location || '',
    });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, initial_stock: parseFloat(form.initial_stock), reorder_level: parseFloat(form.reorder_level) };
    try {
      if (editing) {
        await api.put(`/products/${editing}`, { name: payload.name, description: payload.description, category: payload.category, current_stock: payload.initial_stock, reorder_level: payload.reorder_level, unit: payload.unit, storage_location: payload.storage_location });
        toast.success('Inventory updated');
      } else {
        await api.post('/products/', payload);
        toast.success('Supply item added');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed');
    }
  };

  const getStatusColor = (p) => {
    if (p.current_stock <= 0) return 'bg-red-100 text-red-700';
    if (p.current_stock <= p.reorder_level) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };
  const getStatusText = (p) => {
    if (p.current_stock <= 0) return 'Out of Stock';
    if (p.current_stock <= p.reorder_level) return 'Low Stock';
    return 'In Stock';
  };
  const stockPercent = (p) => {
    if (!p.initial_stock || p.initial_stock === 0) return 0;
    return Math.min(100, Math.round((p.current_stock / p.initial_stock) * 100));
  };
  const stockBarColor = (p) => {
    const pct = stockPercent(p);
    if (pct === 0) return 'bg-red-500';
    if (pct <= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'low_stock') return p.current_stock <= p.reorder_level && p.current_stock > 0;
    if (filter === 'out_of_stock') return p.current_stock <= 0;
    return true;
  });

  const isAuthorized = user?.role === 'officer' || user?.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
            <Package size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inventory & Stock Monitoring</h1>
            <p className="text-sm text-slate-500">Monitor intervention supplies and track stock levels</p>
          </div>
        </div>
        {isAuthorized && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 text-sm font-semibold cursor-pointer shadow-sm"
          >
            <Plus size={16} /> Add Supply
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Items', active: 'bg-green-700 text-white shadow-sm' },
          { key: 'low_stock', label: 'Low Stock', active: 'bg-amber-600 text-white shadow-sm' },
          { key: 'out_of_stock', label: 'Out of Stock', active: 'bg-red-600 text-white shadow-sm' },
        ].map(({ key, label, active }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
              filter === key ? active : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[160px]">Stock Level</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Current / Initial</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Reorder At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                {isAuthorized && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Package size={15} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900 leading-snug">{p.name}</p>
                        {p.batch_number && <p className="text-xs text-slate-400 font-mono">{p.batch_number}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${categoryColors[p.category] || 'bg-slate-100 text-slate-700'}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${stockBarColor(p)}`}
                          style={{ width: `${stockPercent(p)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right tabular-nums">{stockPercent(p)}%</span>
                    </div>
                    {p.current_stock <= p.reorder_level && p.current_stock > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                        <span className="text-[10px] text-amber-600">Below reorder level</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="font-semibold text-slate-800">{p.current_stock}</span>
                    <span className="text-slate-400 text-xs"> / {p.initial_stock} {p.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600 text-xs">{p.reorder_level} {p.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(p)}`}>
                      {getStatusText(p)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.storage_location || '—'}</td>
                  {isAuthorized && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <Layers size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {filter === 'all' ? 'No supplies added yet' : `No ${filter.replace('_', ' ')} items`}
              </p>
              <p className="text-xs text-slate-500 mb-4 max-w-xs">
                {filter === 'all'
                  ? 'Start by adding intervention supplies to monitor stock levels.'
                  : 'No items match this filter. Try selecting a different status.'}
              </p>
              {filter === 'all' && isAuthorized && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors duration-200 text-sm font-semibold cursor-pointer"
                >
                  <Plus size={15} /> Add First Supply
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">
                {editing ? 'Edit Inventory Item' : 'Add New Supply'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="supply-name" className={labelCls}>Item Name *</label>
                <input id="supply-name" type="text" required placeholder="e.g., Rice Seeds Premium" value={form.name} onChange={setField('name')} className={inputCls} />
              </div>
              <div>
                <label htmlFor="supply-desc" className={labelCls}>Description</label>
                <textarea id="supply-desc" placeholder="Brief description of this supply item" value={form.description} onChange={setField('description')} rows={2} className={inputCls} />
              </div>
              <div>
                <label htmlFor="supply-category" className={labelCls}>Category</label>
                <select id="supply-category" value={form.category} onChange={setField('category')} className={inputCls + ' cursor-pointer'}>
                  {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="supply-stock" className={labelCls}>Initial Stock *</label>
                  <input id="supply-stock" type="number" step="0.01" required placeholder="0.00" value={form.initial_stock} onChange={setField('initial_stock')} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="supply-reorder" className={labelCls}>Reorder Level *</label>
                  <input id="supply-reorder" type="number" step="0.01" required placeholder="0.00" value={form.reorder_level} onChange={setField('reorder_level')} className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="supply-unit" className={labelCls}>Unit</label>
                <input id="supply-unit" type="text" placeholder="e.g., kg, pcs, liters" value={form.unit} onChange={setField('unit')} className={inputCls} />
              </div>
              <div>
                <label htmlFor="supply-supplier" className={labelCls}>Supplier Name</label>
                <input id="supply-supplier" type="text" placeholder="Supplier or vendor name" value={form.supplier_name} onChange={setField('supplier_name')} className={inputCls} />
              </div>
              <div>
                <label htmlFor="supply-batch" className={labelCls}>Batch Number</label>
                <input id="supply-batch" type="text" placeholder="e.g., BATCH-2026-001" value={form.batch_number} onChange={setField('batch_number')} className={inputCls} />
              </div>
              <div>
                <label htmlFor="supply-location" className={labelCls}>Storage Location</label>
                <input id="supply-location" type="text" placeholder="e.g., Warehouse A, Shelf 3" value={form.storage_location} onChange={setField('storage_location')} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 cursor-pointer text-sm font-semibold">
                  {editing ? 'Update Item' : 'Add Supply'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer text-sm text-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
