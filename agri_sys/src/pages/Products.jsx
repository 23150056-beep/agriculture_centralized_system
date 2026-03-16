import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Package, Plus, Edit2, AlertTriangle, Archive, FileSpreadsheet, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import StockBadge from '../components/StockBadge';

export default function Products() {
  const { user } = useAuth();
  const isPrivileged = user?.role === 'admin' || user?.role === 'officer';
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'seeds',
    current_stock: 0,
    initial_stock: 0,
    reorder_level: 0,
    unit: 'kg',
    status: 'in_stock',
    supplier_name: '',
    batch_number: '',
    storage_location: ''
  });

  const load = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load inventory');
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        toast.success('Inventory item updated');
      } else {
        await api.post('/products/', { ...formData, initial_stock: formData.current_stock });
        toast.success('Inventory item added');
      }
      setShowModal(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '', description: '', category: 'seeds',
      current_stock: 0, initial_stock: 0, reorder_level: 0,
      unit: 'kg', status: 'in_stock', supplier_name: '', batch_number: '', storage_location: ''
    });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description || '', category: product.category,
      current_stock: product.current_stock, initial_stock: product.initial_stock, reorder_level: product.reorder_level,
      unit: product.unit, status: product.status, supplier_name: product.supplier_name || '', 
      batch_number: product.batch_number || '', storage_location: product.storage_location || ''
    });
    setShowModal(true);
  };

  const exportCSV = async () => {
    try {
      const response = await api.get('/reports/inventory/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to export report');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filter === 'all') return true;
      if (filter === 'low_stock') return p.current_stock <= p.reorder_level;
      return p.category === filter;
    });
  }, [products, filter]);

  const columns = useMemo(() => [
    {
      header: 'Item',
      accessorFn: row => `${row.name} ${row.batch_number}`,
      cell: info => (
        <div>
          <p className="font-semibold text-slate-800">{info.row.original.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500 capitalize">{info.row.original.category}</span>
            {info.row.original.batch_number && (
               <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                 {info.row.original.batch_number}
               </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Stock Levels',
      accessorFn: row => row.current_stock,
      cell: info => {
        const p = info.row.original;
        const percent = Math.min(100, Math.max(0, (p.current_stock / p.initial_stock) * 100)) || 0;
        const isLow = p.current_stock <= p.reorder_level;
        return (
          <div className="flex flex-col gap-1.5 w-32">
            <div className="flex items-end justify-between">
              <span className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                {p.current_stock} <span className="text-xs font-medium text-slate-500">{p.unit}</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">Reorder at {p.reorder_level} {p.unit}</span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => <StockBadge status={info.getValue()} />
    },
    {
      header: 'Location / Supplier',
      id: 'logistics',
      cell: info => (
        <div className="text-sm">
          <p className="text-slate-700">{info.row.original.storage_location || '�'}</p>
          <p className="text-xs text-slate-400">{info.row.original.supplier_name || '�'}</p>
        </div>
      )
    },
    {
      header: 'Action',
      id: 'actions',
      cell: info => (
        isPrivileged && (
          <button
            onClick={() => openEdit(info.row.original)}
            className="p-2 text-slate-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit Item"
          >
            <Edit2 size={16} />
          </button>
        )
      )
    }
  ], [isPrivileged]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-sm text-slate-500">Track and manage intervention supplies and stock levels</p>
          </div>
        </div>
        
        {isPrivileged && (
          <div className="flex items-center gap-3">
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileSpreadsheet size={16} />
              Export Options
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Supply
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 shadow-sm ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          All Items ({products.length})
        </button>
        <button
          onClick={() => setFilter('low_stock')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 shadow-sm ${filter === 'low_stock' ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          <AlertTriangle size={12} /> Low Stock ({products.filter(p => p.current_stock <= p.reorder_level).length})
        </button>
        {['seeds', 'fertilizers', 'equipment', 'other'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors duration-200 shadow-sm ${filter === cat ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <DataTable 
        columns={columns} 
        data={filteredProducts} 
        searchPlaceholder="Search inventory by name, batch, or location..." 
      />

      {/* Modal Form */}
      {showModal && isPrivileged && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-900">{editingProduct ? 'Edit Supply Item' : 'Register New Supply'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-2">Item Details</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Supply Name *</label>
                    <input
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      placeholder="e.g. Maize Seeds Hybrid HX-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                    <select
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                    >
                      <option value="seeds">Seeds</option>
                      <option value="fertilizers">Fertilizers</option>
                      <option value="pesticides">Pesticides</option>
                      <option value="equipment">Equipment</option>
                      <option value="livestock">Livestock</option>
                      <option value="feeds">Feeds</option>
                      <option value="irrigation">Irrigation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description / Notes</label>
                    <textarea
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-2">Logistics & Tracking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Supplier Name</label>
                      <input
                        type="text"
                        value={formData.supplier_name} onChange={e => setFormData({...formData, supplier_name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Batch Number</label>
                      <input
                        type="text"
                        value={formData.batch_number} onChange={e => setFormData({...formData, batch_number: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-xs font-semibold text-slate-700 mb-1.5">Storage Location</label>
                       <input
                         type="text"
                         value={formData.storage_location} onChange={e => setFormData({...formData, storage_location: e.target.value})}
                         placeholder="Warehouse A, Rack 3"
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                       />
                    </div>
                  </div>
                </div>

              </div>

              {/* Stock Management section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Archive size={14}/> Stock Levels</h3>
                 <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Stock *</label>
                      <input
                        type="number" required min="0" step="0.01"
                        value={formData.current_stock} onChange={e => setFormData({...formData, current_stock: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reorder Level *</label>
                      <input
                        type="number" required min="0" step="0.01"
                        value={formData.reorder_level} onChange={e => setFormData({...formData, reorder_level: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit *</label>
                      <input
                        type="text" required
                        value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                        placeholder="kg, bags, units"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                      <select
                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm">
                  {editingProduct ? 'Update Inventory' : 'Save Supply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
