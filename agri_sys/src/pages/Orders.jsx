import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShoppingBag, Search, Plus, CheckCircle, Clock, FileText, AlertCircle, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  released: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    product_id: '',
    program_id: '',
    quantity: 1,
    notes: '',
  });

  // Reference data
  const [products, setProducts] = useState([]);
  const [programs, setPrograms] = useState([]);
  
  // Update state review form
  const [statusForm, setStatusForm] = useState({
    status: 'completed',
    notes: ''
  });

  const load = async () => {
    try {
      const response = await api.get('/distributions/');
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load distributions');
    }
  };

  const loadReferences = async () => {
    if (user?.role === 'admin' || user?.role === 'officer' || user?.role === 'farmer') {
      try {
        const [prodRes, progRes] = await Promise.all([
          api.get('/products/'),
          api.get('/programs/')
        ]);
        // Only allow in_stock/low_stock to be requested
        setProducts(prodRes.data.filter(p => p.status !== 'out_of_stock' && p.status !== 'expired'));
        setPrograms(progRes.data.filter(p => p.status === 'active'));
      } catch (e) { console.error('Failed to load reference metadata'); }
    }
  };

  useEffect(() => { 
    load(); 
    loadReferences();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/distributions/', formData);
      toast.success('Distribution requested successfully');
      setShowNewModal(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Request failed');
    }
  };
  
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.put(`/distributions/${selectedOrder.id}/status`, statusForm);
      toast.success(`Distribution status updated to ${statusForm.status}`);
      setShowStatusModal(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Update failed');
    }
  };

  const openStatusUpdate = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status === 'pending' ? 'approved' : 
              order.status === 'approved' ? 'released' : 
              order.status === 'released' ? 'completed' : 'completed',
      notes: ''
    });
    setShowStatusModal(true);
  };
  
  const exportCSV = async () => {
    try {
      const response = await api.get('/reports/distributions/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `distributions_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report downloaded');
    } catch (e) {
      toast.error('Failed to export distributions');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filter === 'all') return true;
      return o.status === filter;
    });
  }, [orders, filter]);

  const columns = useMemo(() => [
    {
      header: 'Reference Code',
      accessorKey: 'distribution_code',
      cell: info => <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">{info.getValue() || `DIST-${info.row.original.id.toString().padStart(4, '0')}`}</span>
    },
    {
      header: 'Beneficiary (Farmer)',
      id: 'farmer_info',
      cell: info => (
        <div>
          <p className="font-semibold text-slate-800">{info.row.original.farmer?.name || `Farmer #${info.row.original.buyer_id}`}</p>
          <p className="text-xs text-slate-500">{info.row.original.farmer?.email || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Intervention Supply',
      id: 'supply_info',
      cell: info => (
        <div>
          <p className="font-medium text-slate-700">{info.row.original.product?.name || `Item #${info.row.original.product_id}`}</p>
          <span className="text-xs text-slate-500">Qty: <b>{info.row.original.quantity}</b></span>
        </div>
      )
    },
    {
      header: 'Program',
      id: 'program_info',
      cell: info => <span className="text-sm text-slate-600">{info.row.original.program?.name || 'Standard Allocation'}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-colors ${
          info.getValue() === 'completed' ? 'bg-green-50 border-green-200 text-green-700' :
          info.getValue() === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
          info.getValue() === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Date',
      accessorFn: row => row.created_at,
      cell: info => <span className="text-xs text-slate-500">{new Date(info.getValue()).toLocaleDateString()}</span>
    },
    {
      header: 'Action',
      id: 'actions',
      cell: info => {
        const order = info.row.original;
        if ((user?.role === 'admin' || user?.role === 'officer') && order.status !== 'completed' && order.status !== 'cancelled') {
          return (
            <button
              onClick={() => openStatusUpdate(order)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors border border-purple-200"
            >
              <ShieldCheck size={14} /> Update Process
            </button>
          );
        }
        return <span className="text-xs text-slate-400 italic">No action required</span>;
      }
    }
  ], [user]);

  const isPrivileged = user?.role === 'admin' || user?.role === 'officer';

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center shadow-sm">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Distributions</h1>
            <p className="text-sm text-slate-500">Track agricultural intervention deliveries & supply claims</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isPrivileged && (
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText size={16} /> Export Reports
            </button>
          )}
          {user?.role === 'farmer' && user?.eligibility_status === 'approved' && (
            <button
              onClick={() => {
                setFormData({ product_id: '', program_id: '', quantity: 1, notes: '' });
                setShowNewModal(true);
              }}
              className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-800 transition-colors shadow-sm"
            >
              <Plus size={16} /> Request Supply
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          All ({orders.length})
        </button>
        <button onClick={() => setFilter('pending')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button onClick={() => setFilter('completed')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          Completed ({orders.filter(o => o.status === 'completed').length})
        </button>
      </div>

      {user?.role === 'farmer' && user?.eligibility_status !== 'approved' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
           <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
           <div>
             <h3 className="font-bold text-amber-900 text-sm">Action Required: Eligibility Pending</h3>
             <p className="text-amber-700 text-sm mt-1">You must upload your identity verification and land deed documents in your profile. An officer will approve your account before you can request agricultural distributions.</p>
           </div>
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={filteredOrders} 
        searchPlaceholder="Search by reference code or beneficiary..." 
      />

      {/* New Request Modal (Farmer only normally, but admin can create on behalf) */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Request Agricultural Supply</h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Government Program</label>
                <select
                  required value={formData.program_id} onChange={e => setFormData({...formData, program_id: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                >
                  <option value="">-- Select Active Program --</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Intervention Supply (Product)</label>
                <select
                  required value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                >
                  <option value="">-- Select Item --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock} {p.unit})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity Requested</label>
                <input
                  type="number" required min="1"
                  value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Justification / Notes</label>
                <textarea
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                  placeholder="E.g., Farm size expansion require extra seeds..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors shadow-sm">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Status Modal (Officer/Admin only) */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="text-purple-600"/> Process Distribution</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 bg-slate-50 border-b border-slate-100 text-sm">
               <p className="mb-2"><span className="text-slate-500">Ref Code:</span> <span className="font-mono font-bold text-slate-800">{selectedOrder.distribution_code}</span></p>
               <p className="mb-2"><span className="text-slate-500">Farmer:</span> <span className="font-medium text-slate-800">{selectedOrder.farmer?.name}</span></p>
               <p><span className="text-slate-500">Request:</span> <span className="font-medium text-slate-800">{selectedOrder.quantity}x {selectedOrder.product?.name}</span></p>
               
               <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg flex gap-3 text-xs text-slate-600">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${['pending','approved','released','completed'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <div className="w-0.5 h-6 bg-slate-200"></div>
                    <div className={`w-3 h-3 rounded-full ${['approved','released','completed'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <div className="w-0.5 h-6 bg-slate-200"></div>
                    <div className={`w-3 h-3 rounded-full ${['released','completed'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <div className="w-0.5 h-6 bg-slate-200"></div>
                    <div className={`w-3 h-3 rounded-full ${['completed'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div className="flex flex-col gap-[14px]">
                    <p className={['pending','approved','released','completed'].includes(selectedOrder.status) ? 'font-bold':''}>Pending</p>
                    <p className={['approved','released','completed'].includes(selectedOrder.status) ? 'font-bold':''}>Approved</p>
                    <p className={['released','completed'].includes(selectedOrder.status) ? 'font-bold text-indigo-600':'text-indigo-600/50'}>Released (Stock Deducted)</p>
                    <p className={['completed'].includes(selectedOrder.status) ? 'font-bold text-green-600':''}>Completed (Received)</p>
                  </div>
               </div>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-6 space-y-4 bg-white rounded-b-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Advance To Stage</label>
                <select
                  required value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                >
                  <option value="pending">Reset to Pending</option>
                  <option value="approved">Approve Request</option>
                  <option value="released">Mark as Released (Deducts Stock)</option>
                  <option value="completed">Mark as Completed</option>
                  <option value="cancelled" className="text-red-600 font-bold bg-red-50">Cancel/Reject Distribution</option>
                </select>
                {statusForm.status === 'released' && (
                  <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1"><AlertCircle size={12}/> Moving to 'Released' will permanently deduct {selectedOrder.quantity} units from inventory.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Officer Notes / Reason</label>
                <textarea
                  value={statusForm.notes} onChange={e => setStatusForm({...statusForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-16 resize-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                  placeholder="Required if cancelling..."
                  required={statusForm.status === 'cancelled'}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-black transition-colors shadow-sm">Confirm Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
