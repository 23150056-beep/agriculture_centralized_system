import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, X, Briefcase, Users, TrendingUp, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const programTypes = ['emergency_relief', 'seasonal_support', 'subsidy_program', 'disaster_recovery', 'training_program', 'equipment_distribution', 'other'];
const programStatuses = ['planned', 'active', 'completed', 'suspended', 'cancelled'];

const statusColors = {
  planned: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
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

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';

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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
          <Briefcase size={22} className="text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700 mb-1">Access Restricted</p>
        <p className="text-xs text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  const beneficiaryProgress = (program) => {
    if (!program.target_beneficiaries || program.target_beneficiaries === 0) return 0;
    return Math.min(100, Math.round((program.actual_beneficiaries / program.target_beneficiaries) * 100));
  };

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
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 text-sm font-semibold cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Create Program
        </button>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map(program => (
          <div key={program.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Briefcase size={16} className="text-slate-500 shrink-0" />
                <h3 className="font-semibold text-slate-900 leading-snug truncate">{program.name}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ml-2 font-semibold ${statusColors[program.status]}`}>
                {program.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3 font-mono">{program.program_code}</p>
            
            {program.description && (
              <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">{program.description}</p>
            )}

            <div className="space-y-1.5 mb-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-700 capitalize font-medium">{program.program_type.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Beneficiary Progress */}
            {program.target_beneficiaries > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Users size={11} />
                    <span>Beneficiaries</span>
                  </div>
                  <span className="text-slate-700 font-semibold tabular-nums">
                    {program.actual_beneficiaries} <span className="text-slate-400 font-normal">/ {program.target_beneficiaries}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${beneficiaryProgress(program)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => openDetail(program)}
                className="flex-1 inline-flex items-center justify-center text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                View Details
              </button>
              <button
                onClick={() => openEdit(program)}
                className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <CalendarDays size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">No programs created yet</p>
            <p className="text-xs text-slate-500 mb-4 max-w-xs">
              Create your first intervention program to begin distributing supplies to farmers.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors duration-200 text-sm font-semibold cursor-pointer"
            >
              <Plus size={15} /> Create First Program
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">{editing ? 'Edit Program' : 'Create New Program'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prog-code" className={labelCls}>Program Code *</label>
                  <input
                    id="prog-code"
                    type="text"
                    required
                    placeholder="e.g., PROG-2026-001"
                    value={form.program_code}
                    onChange={set('program_code')}
                    disabled={!!editing}
                    className={inputCls + (editing ? ' disabled:bg-slate-50 disabled:text-slate-400 cursor-not-allowed' : '')}
                  />
                </div>
                <div>
                  <label htmlFor="prog-status" className={labelCls}>Status</label>
                  <select id="prog-status" value={form.status} onChange={set('status')} className={inputCls + ' cursor-pointer'}>
                    {programStatuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="prog-name" className={labelCls}>Program Name *</label>
                <input
                  id="prog-name"
                  type="text"
                  required
                  placeholder="Enter program name"
                  value={form.name}
                  onChange={set('name')}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="prog-desc" className={labelCls}>Description</label>
                <textarea
                  id="prog-desc"
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                  placeholder="Describe the program objectives and scope"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="prog-type" className={labelCls}>Program Type</label>
                <select id="prog-type" value={form.program_type} onChange={set('program_type')} className={inputCls + ' cursor-pointer'}>
                  {programTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prog-start" className={labelCls}>Start Date *</label>
                  <input id="prog-start" type="date" required value={form.start_date} onChange={set('start_date')} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="prog-end" className={labelCls}>End Date</label>
                  <input id="prog-end" type="date" value={form.end_date} onChange={set('end_date')} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prog-budget" className={labelCls}>Budget (USD)</label>
                  <input id="prog-budget" type="number" step="0.01" placeholder="Enter budget amount" value={form.budget} onChange={set('budget')} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="prog-target" className={labelCls}>Target Beneficiaries</label>
                  <input id="prog-target" type="number" placeholder="Number of farmers" value={form.target_beneficiaries} onChange={set('target_beneficiaries')} className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="prog-agency" className={labelCls}>Implementing Agency</label>
                <input id="prog-agency" type="text" placeholder="Agency name" value={form.implementing_agency} onChange={set('implementing_agency')} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prog-coord-name" className={labelCls}>Coordinator Name</label>
                  <input id="prog-coord-name" type="text" placeholder="Full name" value={form.coordinator_name} onChange={set('coordinator_name')} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="prog-coord-contact" className={labelCls}>Coordinator Contact</label>
                  <input id="prog-coord-contact" type="text" placeholder="Email or phone" value={form.coordinator_contact} onChange={set('coordinator_contact')} className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="prog-notes" className={labelCls}>Notes</label>
                <textarea id="prog-notes" value={form.notes} onChange={set('notes')} rows={2} placeholder="Additional notes or remarks" className={inputCls} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition-colors duration-200 cursor-pointer text-sm font-semibold"
                >
                  {editing ? 'Update Program' : 'Create Program'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer text-sm text-slate-700"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">{selectedProgram.name}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close dialog"
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
                    <span className="text-xs text-blue-600 font-semibold">Distributions</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{programStats.total_distributions}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-green-600" />
                    <span className="text-xs text-green-600 font-semibold">Beneficiaries</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{programStats.total_beneficiaries}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={16} className="text-purple-600" />
                    <span className="text-xs text-purple-600 font-semibold">Items Distributed</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{programStats.total_items_distributed.toFixed(1)}</p>
                  </div>
                </div>
              )}

              {/* Program Details */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Program Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-500">Program Code</span>
                    <p className="font-mono text-xs text-slate-800 mt-0.5">{selectedProgram.program_code}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Status</span>
                    <p className="text-slate-800 capitalize mt-0.5">{selectedProgram.status}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Type</span>
                    <p className="text-slate-800 capitalize mt-0.5">{selectedProgram.program_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Start Date</span>
                    <p className="text-slate-800 mt-0.5">{new Date(selectedProgram.start_date).toLocaleDateString()}</p>
                  </div>
                  {selectedProgram.budget && (
                    <div>
                      <span className="text-xs text-slate-500">Budget</span>
                      <p className="text-slate-800 font-semibold mt-0.5">${selectedProgram.budget.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-500">Target Beneficiaries</span>
                    <p className="text-slate-800 mt-0.5">{selectedProgram.target_beneficiaries || '—'}</p>
                  </div>
                  {selectedProgram.implementing_agency && (
                    <div className="col-span-2">
                      <span className="text-xs text-slate-500">Implementing Agency</span>
                      <p className="text-slate-800 mt-0.5">{selectedProgram.implementing_agency}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedProgram.description && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedProgram.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
