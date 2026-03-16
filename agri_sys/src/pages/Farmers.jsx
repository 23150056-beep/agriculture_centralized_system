import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCheck, X, CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import DocumentUploader from '../components/DocumentUploader';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  inactive: 'bg-slate-100 text-slate-600',
};

export default function Farmers() {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    eligibility_status: 'approved',
    documents_verified: true,
    profile_notes: '',
    rejection_reason: '',
  });

  const load = async () => {
    try {
      const response = await api.get('/auth/farmers');
      setFarmers(response.data);
    } catch (error) {
      console.error('Failed to load farmers:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const openDetail = (farmer) => {
    setSelectedFarmer(farmer);
    setReviewForm({
      eligibility_status: farmer.eligibility_status || 'pending',
      documents_verified: farmer.documents_verified || false,
      profile_notes: farmer.profile_notes || '',
      rejection_reason: farmer.rejection_reason || '',
    });
    setShowDetail(true);
  };

  const handleReview = async () => {
    if (!selectedFarmer) return;
    
    try {
      await api.put(`/auth/farmers/${selectedFarmer.id}/eligibility`, reviewForm);
      toast.success('Farmer status updated');
      setShowDetail(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update');
    }
  };

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      if (filter === 'all') return true;
      return f.eligibility_status === filter;
    });
  }, [farmers, filter]);

  const columns = useMemo(() => [
    {
      header: 'Farmer',
      accessorFn: row => `${row.name} ${row.email}`,
      cell: info => (
        <div>
          <p className="font-medium text-slate-800">{info.row.original.name}</p>
          <p className="text-xs text-slate-500">{info.row.original.email}</p>
        </div>
      ),
    },
    {
      header: 'Farmer ID',
      accessorKey: 'farmer_id_number',
      cell: info => <span className="text-slate-600 font-mono text-xs">{info.getValue() || '—'}</span>
    },
    {
      header: 'Location',
      accessorKey: 'farm_location',
      cell: info => <span className="text-slate-600">{info.getValue() || '—'}</span>
    },
    {
      header: 'Farm Size',
      accessorKey: 'farm_size',
      cell: info => <span className="text-slate-600">{info.getValue() ? `${info.getValue()} ha` : '—'}</span>
    },
    {
      header: 'Insurance',
      id: 'insurance',
      cell: info => {
        const farmer = info.row.original;
        return farmer.has_insurance ? (
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle size={12} />
            {farmer.insurance_validated ? 'Validated' : 'Pending'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <XCircle size={12} />
            None
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'eligibility_status',
      cell: info => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[info.getValue() || 'pending']}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Action',
      id: 'actions',
      cell: info => (
        <button
          onClick={() => openDetail(info.row.original)}
          className="inline-flex items-center text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          Review
        </button>
      )
    }
  ], []);

  const isAuthorized = user?.role === 'admin' || user?.role === 'officer';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
          <Users size={22} className="text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700 mb-1">Access Restricted</p>
        <p className="text-xs text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shadow-sm">
            <UserCheck size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Farmer Registry</h1>
            <p className="text-sm text-slate-500">Manage farmer profiles and eligibility approvals</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <Users size={16} className="text-green-700" />
          <span className="text-sm font-medium text-slate-700">{farmers.length} Registered</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', 'All', farmers.length, 'bg-slate-800'], 
          ['pending', 'Pending Approval', farmers.filter(f => f.eligibility_status === 'pending').length, 'bg-amber-500'], 
          ['approved', 'Approved', farmers.filter(f => f.eligibility_status === 'approved').length, 'bg-green-600'], 
          ['rejected', 'Rejected', farmers.filter(f => f.eligibility_status === 'rejected').length, 'bg-rose-600']
        ].map(([val, label, count, activeColor]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer shadow-sm ${
              filter === val ? `${activeColor} text-white border-transparent` : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {label} <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${filter === val ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
          </button>
        ))}
      </div>

      <DataTable 
        columns={columns} 
        data={filteredFarmers} 
        searchPlaceholder="Search farmers by name, email, or ID..." 
      />

      {/* Detail Modal */}
      {showDetail && selectedFarmer && (
        <div className="fixed inset-0 bg-slate-900/50 flex flex-col md:flex-row items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
            
            {/* Left Column: Farmer Details & Documents */}
            <div className="flex-1 p-6 md:p-8 md:border-r border-slate-100">
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-lg font-bold text-slate-900">Farmer Profile</h2>
                <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 hidden md:block mb-6">Farmer Profile details</h2>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Identity & Location</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div><span className="text-xs text-slate-500 block mb-0.5">Full Name</span><p className="font-semibold text-slate-800">{selectedFarmer.name}</p></div>
                  <div><span className="text-xs text-slate-500 block mb-0.5">Email</span><p className="text-slate-800">{selectedFarmer.email}</p></div>
                  <div><span className="text-xs text-slate-500 block mb-0.5">Phone Number</span><p className="text-slate-800">{selectedFarmer.phone || '—'}</p></div>
                  <div><span className="text-xs text-slate-500 block mb-0.5">Farmer ID</span><p className="text-slate-800 font-mono text-xs">{selectedFarmer.farmer_id_number || '—'}</p></div>
                  <div className="col-span-2"><span className="text-xs text-slate-500 block mb-0.5">Farm Location</span><p className="text-slate-800">{selectedFarmer.farm_location || '—'}</p></div>
                  <div><span className="text-xs text-slate-500 block mb-0.5">Farm Size</span><p className="text-slate-800">{selectedFarmer.farm_size ? `${selectedFarmer.farm_size} hectares` : '—'}</p></div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Insurance Information</h3>
                {selectedFarmer.has_insurance ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-xs text-slate-500 block mb-0.5">Provider</span><p className="text-slate-800">{selectedFarmer.insurance_provider || '—'}</p></div>
                    <div><span className="text-xs text-slate-500 block mb-0.5">Policy Number</span><p className="text-slate-800 font-mono text-xs">{selectedFarmer.insurance_policy_number || '—'}</p></div>
                    <div className="col-span-2">
                      <span className="text-xs text-slate-500 block mb-0.5">Validation</span>
                      <p className={`inline-flex items-center gap-1.5 font-semibold ${selectedFarmer.insurance_validated ? 'text-green-600' : 'text-amber-600'}`}>
                        {selectedFarmer.insurance_validated ? <><CheckCircle size={14} /> Validated</> : <><AlertTriangle size={14} /> Pending Validation</>}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center text-slate-500 text-sm">
                    <XCircle size={16} className="mr-2" /> No insurance coverage registered
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Upload Documents</h3>
                <DocumentUploader 
                  farmerId={selectedFarmer.id} 
                  onUploadSuccess={() => { toast.success("Document uploaded successfully"); load(); }} 
                />
              </div>
            </div>

            {/* Right Column: Review Tools */}
            <div className="w-full md:w-80 bg-slate-50 p-6 md:p-8 flex flex-col">
              <div className="hidden md:flex justify-end mb-6">
                <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer bg-white p-1.5 rounded-full border border-slate-200 shadow-sm"><X size={16} /></button>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">Official Review</h3>
                <div className="space-y-5">
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Eligibility Decision *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, eligibility_status: 'approved' })}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border transition-colors duration-200 cursor-pointer text-xs font-bold ${
                          reviewForm.eligibility_status === 'approved' ? 'bg-green-600 border-green-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, eligibility_status: 'rejected' })}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border transition-colors duration-200 cursor-pointer text-xs font-bold ${
                          reviewForm.eligibility_status === 'rejected' ? 'bg-rose-600 border-rose-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="documents_verified"
                        checked={reviewForm.documents_verified}
                        onChange={e => setReviewForm({ ...reviewForm, documents_verified: e.target.checked })}
                        className="rounded border-slate-300 text-green-600 focus:ring-green-600 cursor-pointer w-4 h-4"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="documents_verified" className="text-sm font-medium text-slate-800 cursor-pointer">Physical Documents Verified</label>
                      <p className="text-[11px] text-slate-500 mt-0.5">I confirm I have physically checked matching IDs and land deeds.</p>
                    </div>
                  </div>

                  {reviewForm.eligibility_status === 'rejected' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label htmlFor="rejection-reason" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Rejection Reason <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="rejection-reason"
                        value={reviewForm.rejection_reason}
                        onChange={e => setReviewForm({ ...reviewForm, rejection_reason: e.target.value })}
                        placeholder="State clear reasons (e.g. Invalid land deeds)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none h-24"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="profile-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Officer Notes <span className="text-slate-400 font-normal">(Internal)</span>
                    </label>
                    <textarea
                      id="profile-notes"
                      value={reviewForm.profile_notes}
                      onChange={e => setReviewForm({ ...reviewForm, profile_notes: e.target.value })}
                      placeholder="Add any internal contextual notes..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 resize-none h-24"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={handleReview}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  Save Evaluation
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
