import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Pencil, Package, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['seeds', 'fertilizers', 'pesticides', 'equipment', 'livestock', 'feeds', 'irrigation', 'other'];
const empty = { name: '', description: '', category: 'other', initial_stock: '', reorder_level: '', unit: 'kg', supplier_name: '', batch_number: '', storage_location: '' };

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/products/').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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
      storage_location: p.storage_location || ''
    });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      initial_stock: parseFloat(form.initial_stock),
      reorder_level: parseFloat(form.reorder_level),
    };
    try {
      if (editing) {
        await api.put(`/products/${editing}`, { name: payload.name, description: payload.description, category: payload.category, current_stock: payload.initial_stock, reorder_level: payload.reorder_level, unit: payload.unit, storage_location: payload.storage_location });
        toast.success('Inventory updated');
      } else {
        await api.post('/products/', payload);
        toast.success('Inventory item added');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed');
    }
  };

  const getStatusColor = (product) => {
    if (product.current_stock <= 0) return 'bg-red-100 text-red-700';
    if (product.current_stock <= product.reorder_level) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (product) => {
    if (product.current_stock <= 0) return 'Out of Stock';
    if (product.current_stock <= product.reorder_level) return 'Low Stock';
    return 'In Stock';
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'low_stock') return p.current_stock <= p.reorder_level && p.current_stock > 0;
    if (filter === 'out_of_stock') return p.current_stock <= 0;
    return true;
  });

  const isAuthorized = user?.role === 'officer' || user?.role === 'admin';

  return (
    <div>
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
          <button onClick={openCreate} className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition text-sm font-medium cursor-pointer shadow-sm">
            <Plus size={16} /> Add Supply
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${filter === 'all' ? 'bg-green-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>All Items</button>
        <button onClick={() => setFilter('low_stock')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${filter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>Low Stock</button>
        <button onClick={() => setFilter('out_of_stock')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${filter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>Out of Stock</button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(p)}`}>
                {getStatusText(p)}
              </span>
            </div>
            {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Current Stock:</span>
                <span className="font-semibold text-gray-800">{p.current_stock} {p.unit}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Reorder Level:</span>
                <span className="text-gray-600">{p.reorder_level} {p.unit}</span>
              </div>
              {p.batch_number && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Batch:</span>
                  <span className="text-gray-600">{p.batch_number}</span>
                </div>
              )}
              {p.storage_location && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-600">{p.storage_location}</span>
                </div>
              )}
            </div>

            {/* Stock Alert */}
            {p.current_stock <= p.reorder_level && p.current_stock > 0 && (
              <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-3">
                <AlertTriangle size={14} />
                <span>Stock below reorder level</span>
              </div>
            )}

            {isAuthorized && (
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => openEdit(p)} className="text-green-700 hover:text-green-800 text-xs font-semibold flex items-center gap-1 cursor-pointer bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition">
                  <Pencil size={13} /> Edit
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredProducts.length === 0 && <p className="text-gray-400 col-span-full text-center py-12">No inventory items</p>}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">{editing ? 'Edit Inventory Item' : 'Add New Supply'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" required placeholder="Item name" value={form.name} onChange={set('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
              <textarea placeholder="Description (optional)" value={form.description} onChange={set('description')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
              <select value={form.category} onChange={set('category')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" required placeholder="Initial Stock" value={form.initial_stock} onChange={set('initial_stock')} className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
                <input type="number" step="0.01" required placeholder="Reorder Level" value={form.reorder_level} onChange={set('reorder_level')} className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <input type="text" placeholder="Unit (e.g., kg, pcs)" value={form.unit} onChange={set('unit')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
              <input type="text" placeholder="Supplier name (optional)" value={form.supplier_name} onChange={set('supplier_name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
              <input type="text" placeholder="Batch number (optional)" value={form.batch_number} onChange={set('batch_number')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
              <input type="text" placeholder="Storage location (optional)" value={form.storage_location} onChange={set('storage_location')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
              <button type="submit" className="w-full bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition cursor-pointer text-sm font-semibold">{editing ? 'Update' : 'Add Supply'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
