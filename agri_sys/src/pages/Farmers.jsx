import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCheck, X, CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const filteredFarmers = farmers.filter(f => {
    if (filter === 'all') return true;
    return f.eligibility_status === filter;
  });

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shadow-sm">
            <UserCheck size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Farmer Registry</h1>
            <p className="text-sm text-slate-500">Manage farmer profiles and eligibility approvals</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <UserCheck size={15} className="text-green-700" />
          <span className="text-sm font-medium text-slate-700">{farmers.length} Farmers</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', 'All', farmers.length, 'bg-green-700'], ['pending', 'Pending', farmers.filter(f => f.eligibility_status === 'pending').length, 'bg-amber-600'], ['approved', 'Approved', farmers.filter(f => f.eligibility_status === 'approved').length, 'bg-emerald-700'], ['rejected', 'Rejected', farmers.filter(f => f.eligibility_status === 'rejected').length, 'bg-red-600']].map(([val, label, count, activeColor]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer shadow-sm ${
              filter === val ? `${activeColor} text-white` : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Farmer ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Farm Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Insurance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFarmers.map(farmer => (
                <tr key={farmer.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{farmer.name}</p>
                      <p className="text-xs text-slate-500">{farmer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    {farmer.farmer_id_number || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{farmer.farm_location || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {farmer.farm_size ? `${farmer.farm_size} ha` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {farmer.has_insurance ? (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <CheckCircle size={12} />
                        {farmer.insurance_validated ? 'Validated' : 'Pending'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <XCircle size={12} />
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[farmer.eligibility_status]}`}>
                      {farmer.eligibility_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetail(farmer)}
                      className="inline-flex items-center text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFarmers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <UserCheck size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {filter === 'all' ? 'No farmers registered yet' : `No ${filter} farmers`}
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                {filter === 'all'
                  ? 'Farmers will appear here once they register through the portal.'
                  : 'No farmers match this status. Try a different filter.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedFarmer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">Farmer Profile Review</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Farmer Information */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Farmer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-500">Name</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedFarmer.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Email</span>
                    <p className="text-slate-800 mt-0.5">{selectedFarmer.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Phone</span>
                    <p className="text-slate-800 mt-0.5">{selectedFarmer.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Farmer ID</span>
                    <p className="text-slate-800 font-mono text-xs mt-0.5">{selectedFarmer.farmer_id_number || '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Farm Location</span>
                    <p className="text-slate-800 mt-0.5">{selectedFarmer.farm_location || '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Farm Size</span>
                    <p className="text-slate-800 mt-0.5">{selectedFarmer.farm_size ? `${selectedFarmer.farm_size} hectares` : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Insurance Information</h3>
                {selectedFarmer.has_insurance ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500">Provider</span>
                      <p className="text-slate-800 mt-0.5">{selectedFarmer.insurance_provider || '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Policy Number</span>
                      <p className="text-slate-800 font-mono text-xs mt-0.5">{selectedFarmer.insurance_policy_number || '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Validation Status</span>
                      <p className={`font-semibold mt-0.5 ${selectedFarmer.insurance_validated ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedFarmer.insurance_validated ? 'Validated' : 'Pending Validation'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No insurance registered</p>
                )}
              </div>

              {/* Review Form */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Eligibility Review</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Decision</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, eligibility_status: 'approved' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors duration-200 cursor-pointer text-sm font-semibold ${
                          reviewForm.eligibility_status === 'approved'
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, eligibility_status: 'rejected' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors duration-200 cursor-pointer text-sm font-semibold ${
                          reviewForm.eligibility_status === 'rejected'
                            ? 'bg-red-50 border-red-500 text-red-700'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="documents_verified"
                      checked={reviewForm.documents_verified}
                      onChange={e => setReviewForm({ ...reviewForm, documents_verified: e.target.checked })}
                      className="rounded accent-green-700 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="documents_verified" className="text-sm text-slate-700 cursor-pointer">
                      Documents verified
                    </label>
                  </div>

                  {reviewForm.eligibility_status === 'rejected' && (
                    <div>
                      <label htmlFor="rejection-reason" className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Rejection Reason *
                      </label>
                      <textarea
                        id="rejection-reason"
                        value={reviewForm.rejection_reason}
                        onChange={e => setReviewForm({ ...reviewForm, rejection_reason: e.target.value })}
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition-colors"
                        placeholder="Explain the reason for rejection"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="profile-notes" className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Review Notes
                    </label>
                    <textarea
                      id="profile-notes"
                      value={reviewForm.profile_notes}
                      onChange={e => setReviewForm({ ...reviewForm, profile_notes: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition-colors"
                      placeholder="Add any notes about this farmer's profile"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={handleReview}
                  className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 cursor-pointer text-sm font-semibold"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer text-sm text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
