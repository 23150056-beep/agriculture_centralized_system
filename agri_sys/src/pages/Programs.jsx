import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, X, Briefcase, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const programTypes = ['emergency_relief', 'seasonal_support', 'subsidy_program', 'disaster_recovery', 'training_program', 'equipment_distribution', 'other'];
const programStatuses = ['planned', 'active', 'completed', 'suspended', 'cancelled'];

const statusColors = {
  planned: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

const empty = {
  program_code: '',
  name: '',
  description: '',
  program_type: 'other',
  status: 'planned',
  start_date: '',
  end_date: '',
  budget: '',
  target_beneficiaries: '',
  implementing_agency: '',
  coordinator_name: '',
  coordinator_contact: '',
  notes: '',
};

export default function Programs() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [programStats, setProgramStats] = useState(null);

  const load = async () => {
    try {
      const response = await api.get('/programs/');
      setPrograms(response.data);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const openCreate = () => {
    setForm(empty);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (program) => {
    setForm({
      program_code: program.program_code,
      name: program.name,
      description: program.description || '',
      program_type: program.program_type,
      status: program.status,
      start_date: program.start_date ? program.start_date.split('T')[0] : '',
      end_date: program.end_date ? program.end_date.split('T')[0] : '',
      budget: program.budget || '',
      target_beneficiaries: program.target_beneficiaries || '',
      implementing_agency: program.implementing_agency || '',
      coordinator_name: program.coordinator_name || '',
      coordinator_contact: program.coordinator_contact || '',
      notes: program.notes || '',
    });
    setEditing(program.id);
    setShowForm(true);
  };

  const openDetail = async (program) => {
    setSelectedProgram(program);
    setShowDetail(true);
    
    try {
      const statsResponse = await api.get(`/programs/${program.id}/summary`);
      setProgramStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load program stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
      target_beneficiaries: form.target_beneficiaries ? parseInt(form.target_beneficiaries) : null,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    };

    try {
      if (editing) {
        await api.put(`/programs/${editing}`, payload);
        toast.success('Program updated');
      } else {
        await api.post('/programs/', payload);
        toast.success('Program created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed');
    }
  };

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
          <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Program Management</h1>
            <p className="text-sm text-slate-500">Manage agricultural intervention programs</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition text-sm font-medium cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Create Program
        </button>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map(program => (
          <div key={program.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-800">{program.name}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[program.status]}`}>
                {program.status}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3 font-mono">{program.program_code}</p>
            
            {program.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="text-gray-800 capitalize">{program.program_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Target Farmers:</span>
                <span className="text-gray-800">{program.target_beneficiaries || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Beneficiaries:</span>
                <span className="font-semibold text-green-600">{program.actual_beneficiaries}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => openDetail(program)}
                className="flex-1 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
              >
                View Details
              </button>
              <button
                onClick={() => openEdit(program)}
                className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-12">No programs yet</p>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{editing ? 'Edit Program' : 'Create New Program'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., PROG-2026-001"
                    value={form.program_code}
                    onChange={set('program_code')}
                    disabled={!!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={set('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {programStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter program name"
                  value={form.name}
                  onChange={set('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                  placeholder="Describe the program"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
                <select
                  value={form.program_type}
                  onChange={set('program_type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  {programTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={set('start_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={set('end_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter budget"
                    value={form.budget}
                    onChange={set('budget')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Beneficiaries</label>
                  <input
                    type="number"
                    placeholder="Number of farmers"
                    value={form.target_beneficiaries}
                    onChange={set('target_beneficiaries')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Implementing Agency</label>
                <input
                  type="text"
                  placeholder="Agency name"
                  value={form.implementing_agency}
                  onChange={set('implementing_agency')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={form.coordinator_name}
                    onChange={set('coordinator_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator Contact</label>
                  <input
                    type="text"
                    placeholder="Email or phone"
                    value={form.coordinator_contact}
                    onChange={set('coordinator_contact')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={2}
                  placeholder="Additional notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition cursor-pointer text-sm font-semibold"
                >
                  {editing ? 'Update Program' : 'Create Program'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Detail Modal */}
      {showDetail && selectedProgram && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{selectedProgram.name}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statistics */}
              {programStats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Distributions</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{programStats.total_distributions}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Beneficiaries</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{programStats.total_beneficiaries}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={16} className="text-purple-600" />
                      <span className="text-xs text-purple-600 font-medium">Items Distributed</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{programStats.total_items_distributed.toFixed(1)}</p>
                  </div>
                </div>
              )}

              {/* Program Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Program Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Program Code:</span>
                    <p className="font-mono text-xs text-gray-800">{selectedProgram.program_code}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="text-gray-800 capitalize">{selectedProgram.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="text-gray-800 capitalize">{selectedProgram.program_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <p className="text-gray-800">{new Date(selectedProgram.start_date).toLocaleDateString()}</p>
                  </div>
                  {selectedProgram.budget && (
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <p className="text-gray-800">${selectedProgram.budget.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Target Beneficiaries:</span>
                    <p className="text-gray-800">{selectedProgram.target_beneficiaries || '-'}</p>
                  </div>
                  {selectedProgram.implementing_agency && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Implementing Agency:</span>
                      <p className="text-gray-800">{selectedProgram.implementing_agency}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedProgram.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedProgram.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
