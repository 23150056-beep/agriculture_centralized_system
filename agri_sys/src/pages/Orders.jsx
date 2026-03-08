import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  released: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
const statuses = ['pending', 'approved', 'released', 'completed', 'cancelled'];

export default function Orders() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ buyer_id: '', product_id: '', quantity: '', program_id: '', distribution_location: '', notes: '' });

  const load = async () => {
    try {
      const [distData, prodData] = await Promise.all([
        api.get('/distributions/'),
        api.get('/products/'),
      ]);
      setDistributions(distData.data);
      setProducts(prodData.data);

      // Load farmers and programs if admin/officer
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Distribution Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track farmer recipients and manage item releases</p>
        </div>
        {isAuthorized && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm cursor-pointer">
            <Plus size={16} /> New Distribution
          </button>
        )}
      </div>

      {/* Distributions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                {!isFarmer && <th className="px-4 py-3 font-medium">Farmer</th>}
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {isAuthorized && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {distributions.map(d => {
                const prod = products.find(p => p.id === d.product_id);
                const farmer = farmers.find(f => f.id === d.buyer_id);
                const program = programs.find(p => p.id === d.program_id);
                
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        <span className="text-gray-800 font-mono text-xs">{d.distribution_code}</span>
                      </div>
                    </td>
                    {!isFarmer && <td className="px-4 py-3 text-gray-800">{farmer?.name || `Farmer #${d.buyer_id}`}</td>}
                    <td className="px-4 py-3 text-gray-800 font-medium">{prod?.name || `Item #${d.product_id}`}</td>
                    <td className="px-4 py-3 text-gray-600">{d.quantity} {d.unit || ''}</td>
                    <td className="px-4 py-3 text-gray-600">{program?.name || (d.program_id ? `Program #${d.program_id}` : '-')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[d.status]}`}>
                        {d.status}
                      </span>
                    </td>
                    {isAuthorized && (
                      <td className="px-4 py-3">
                        <select
                          value={d.status}
                          onChange={e => updateStatus(d.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-green-500"
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {distributions.length === 0 && <p className="text-gray-400 text-center py-12">No distributions yet</p>}
        </div>
      </div>

      {/* Create Distribution Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Create New Distribution</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Farmer (Eligible Only)</label>
                <select
                  required
                  value={form.buyer_id}
                  onChange={e => setForm({ ...form, buyer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose farmer</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} - {f.farmer_id_number || f.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
                <select
                  required
                  value={form.product_id}
                  onChange={e => setForm({ ...form, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose item</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.current_stock} {p.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program (Optional)</label>
                <select
                  value={form.program_id}
                  onChange={e => setForm({ ...form, program_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No program</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distribution Location (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={form.distribution_location}
                  onChange={e => setForm({ ...form, distribution_location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="Additional notes"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition cursor-pointer"
                >
                  Create Distribution
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
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
