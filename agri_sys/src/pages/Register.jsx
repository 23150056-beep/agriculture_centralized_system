import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'farmer',
    phone: '', farmer_id_number: '', farm_location: '', farm_size: '', crop_types: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, farm_size: form.farm_size ? parseFloat(form.farm_size) : undefined };
      Object.keys(payload).forEach(k => (payload[k] === '' || payload[k] === undefined) && delete payload[k]);
      await register(payload);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition';

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
            <Sprout size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-tight">AgriDistro</p>
            <p className="text-xs text-slate-500">Gov. Intervention System</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Create Farmer Account</h2>
            <p className="text-sm text-slate-500 mt-1">Register to apply for agricultural intervention programs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Basic Information</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                    <input required type="text" value={form.name} onChange={set('name')} placeholder="Juan dela Cruz" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+63 912 345 6789" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                  <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password * (min. 6 characters)</label>
                  <input required type="password" minLength={6} value={form.password} onChange={set('password')} placeholder="••••••••" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Farm Details */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Farm Information</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Government Farmer ID</label>
                  <input type="text" value={form.farmer_id_number} onChange={set('farmer_id_number')} placeholder="e.g. FID-2026-001" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Farm Location</label>
                    <input type="text" value={form.farm_location} onChange={set('farm_location')} placeholder="Municipality, Province" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Farm Size (hectares)</label>
                    <input type="number" step="0.01" value={form.farm_size} onChange={set('farm_size')} placeholder="e.g. 2.5" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Crop Types</label>
                  <input type="text" value={form.crop_types} onChange={set('crop_types')} placeholder="e.g. Rice, Corn, Vegetables" className={inputCls} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
