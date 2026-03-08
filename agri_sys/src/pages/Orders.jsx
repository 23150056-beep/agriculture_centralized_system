import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, FileText, ClipboardList, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  released: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
const statuses = ['pending', 'approved', 'released', 'completed', 'cancelled'];

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';

export default function Orders() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ buyer_id: '', product_id: '', quantity: '', program_id: '', distribution_location: '', notes: '' });

  const load = async () => {
    try {
      const [distData, prodData] = await Promise.all([
        api.get('/distributions/'),
        api.get('/products/'),
      ]);
      setDistributions(distData.data);
      setProducts(prodData.data);

      if (user?.role === 'admin' || user?.role === 'officer') {
        const [farmerData, progData] = await Promise.all([
          api.get('/auth/farmers?status=approved'),
          api.get('/programs/?active_only=true'),
        ]);
        setFarmers(farmerData.data);
        setPrograms(progData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/distributions/', {
        buyer_id: parseInt(form.buyer_id),
        product_id: parseInt(form.product_id),
        quantity: parseFloat(form.quantity),
        program_id: form.program_id ? parseInt(form.program_id) : null,
        distribution_location: form.distribution_location || null,
        notes: form.notes || null,
      });
      toast.success('Distribution created!');
      setShowCreate(false);
      setForm({ buyer_id: '', product_id: '', quantity: '', program_id: '', distribution_location: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/distributions/${id}/status`, { status });
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const isAuthorized = user?.role === 'officer' || user?.role === 'admin';
  const isFarmer = user?.role === 'farmer';
  const filtered = statusFilter === 'all' ? distributions : distributions.filter(d => d.status === statusFilter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-700 rounded-xl flex items-center justify-center shadow-sm">
            <FileText size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Distribution Management</h1>
            <p className="text-sm text-slate-500">Track farmer recipients and manage item releases</p>
          </div>
        </div>
        {isAuthorized && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 text-sm font-semibold cursor-pointer shadow-sm"
          >
            <Plus size={16} /> New Distribution
          </button>
        )}
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...statuses].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer capitalize ${
              statusFilter === s
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? 'All Distributions' : s}
          </button>
        ))}
      </div>

      {/* Distributions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                {!isFarmer && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Farmer</th>}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Program</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                {isAuthorized && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Update</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(d => {
                const prod = products.find(p => p.id === d.product_id);
                const farmer = farmers.find(f => f.id === d.buyer_id);
                const program = programs.find(p => p.id === d.program_id);
                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-slate-400 shrink-0" />
                        <span className="text-slate-700 font-mono text-xs">{d.distribution_code}</span>
                      </div>
                    </td>
                    {!isFarmer && <td className="px-4 py-3 text-slate-800 font-medium">{farmer?.name || `Farmer #${d.buyer_id}`}</td>}
                    <td className="px-4 py-3 text-slate-800">{prod?.name || `Item #${d.product_id}`}</td>
                    <td className="px-4 py-3 text-right text-slate-700 tabular-nums font-medium">
                      {d.quantity} <span className="text-slate-400 font-normal text-xs">{prod?.unit || ''}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{program?.name || (d.program_id ? `Program #${d.program_id}` : '—')}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{d.distribution_location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[d.status]}`}>
                        {d.status}
                      </span>
                    </td>
                    {isAuthorized && (
                      <td className="px-4 py-3">
                        <select
                          value={d.status}
                          onChange={e => updateStatus(d.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-green-600 bg-white cursor-pointer transition-colors"
                        >
                          {statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <ClipboardList size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {statusFilter === 'all' ? 'No distributions yet' : `No ${statusFilter} distributions`}
              </p>
              <p className="text-xs text-slate-500 mb-4 max-w-xs">
                {statusFilter === 'all'
                  ? 'Begin distributing supplies to eligible farmers by creating a distribution record.'
                  : 'No records match this status. Try selecting a different filter.'}
              </p>
              {statusFilter === 'all' && isAuthorized && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors duration-200 text-sm font-semibold cursor-pointer"
                >
                  <Plus size={15} /> Create First Distribution
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Distribution Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">Create New Distribution</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label htmlFor="dist-farmer" className={labelCls}>Farmer Recipient *</label>
                <select id="dist-farmer" required value={form.buyer_id} onChange={e => setForm({ ...form, buyer_id: e.target.value })} className={inputCls + ' cursor-pointer'}>
                  <option value="">Select eligible farmer…</option>
                  {farmers.map(f => <option key={f.id} value={f.id}>{f.name} — {f.farmer_id_number || f.email}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dist-product" className={labelCls}>Supply Item *</label>
                <select id="dist-product" required value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} className={inputCls + ' cursor-pointer'}>
                  <option value="">Select supply item…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.current_stock} {p.unit} available)</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dist-qty" className={labelCls}>Quantity *</label>
                <input id="dist-qty" type="number" step="0.01" required placeholder="Enter quantity to distribute" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="dist-program" className={labelCls}>Government Program</label>
                <select id="dist-program" value={form.program_id} onChange={e => setForm({ ...form, program_id: e.target.value })} className={inputCls + ' cursor-pointer'}>
                  <option value="">No program (standalone)</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dist-location" className={labelCls}>Distribution Location</label>
                <input id="dist-location" type="text" placeholder="e.g., Barangay Hall, Municipality Center" value={form.distribution_location} onChange={e => setForm({ ...form, distribution_location: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="dist-notes" className={labelCls}>Notes</label>
                <textarea id="dist-notes" placeholder="Additional remarks or instructions" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 cursor-pointer text-sm font-semibold">
                  Create Distribution
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer text-sm text-slate-700">
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
