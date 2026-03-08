import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCheck, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  inactive: 'bg-gray-100 text-gray-700',
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
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to view this page</p>
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
              filter === val ? `${activeColor} text-white` : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            <tbody className="divide-y divide-gray-100">
              {filteredFarmers.map(farmer => (
                <tr key={farmer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-800">{farmer.name}</div>
                      <div className="text-xs text-gray-500">{farmer.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {farmer.farmer_id_number || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{farmer.farm_location || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {farmer.farm_size ? `${farmer.farm_size} ha` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {farmer.has_insurance ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle size={12} />
                        {farmer.insurance_validated ? 'Validated' : 'Pending'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <XCircle size={12} />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[farmer.eligibility_status]}`}>
                      {farmer.eligibility_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetail(farmer)}
                      className="text-green-700 hover:text-green-800 text-xs font-semibold bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFarmers.length === 0 && (
            <p className="text-gray-400 text-center py-12">No farmers found</p>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedFarmer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Farmer Profile Review</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Farmer Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Farmer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium text-gray-800">{selectedFarmer.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="text-gray-800">{selectedFarmer.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="text-gray-800">{selectedFarmer.phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Farmer ID:</span>
                    <p className="text-gray-800 font-mono text-xs">{selectedFarmer.farmer_id_number || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Farm Location:</span>
                    <p className="text-gray-800">{selectedFarmer.farm_location || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Farm Size:</span>
                    <p className="text-gray-800">{selectedFarmer.farm_size ? `${selectedFarmer.farm_size} hectares` : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Insurance Information</h3>
                {selectedFarmer.has_insurance ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Provider:</span>
                      <p className="text-gray-800">{selectedFarmer.insurance_provider || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Policy Number:</span>
                      <p className="text-gray-800 font-mono text-xs">{selectedFarmer.insurance_policy_number || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Validation Status:</span>
                      <p className={selectedFarmer.insurance_validated ? 'text-green-600' : 'text-yellow-600'}>
                        {selectedFarmer.insurance_validated ? 'Validated' : 'Pending Validation'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No insurance registered</p>
                )}
              </div>

              {/* Review Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Eligibility Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eligibility Status
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, eligibility_status: 'approved' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                          reviewForm.eligibility_status === 'approved'
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, eligibility_status: 'rejected' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                          reviewForm.eligibility_status === 'rejected'
                            ? 'bg-red-50 border-red-500 text-red-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
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
                      className="rounded"
                    />
                    <label htmlFor="documents_verified" className="text-sm text-gray-700">
                      Documents verified
                    </label>
                  </div>

                  {reviewForm.eligibility_status === 'rejected' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={reviewForm.rejection_reason}
                        onChange={e => setReviewForm({ ...reviewForm, rejection_reason: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Explain why the farmer is being rejected"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes (Optional)
                    </label>
                    <textarea
                      value={reviewForm.profile_notes}
                      onChange={e => setReviewForm({ ...reviewForm, profile_notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Add any additional notes about this farmer"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReview}
                  className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition cursor-pointer text-sm font-semibold"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
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
