import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Shield, Leaf, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-5/12 bg-green-950 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <Sprout size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">AgriDistro</p>
            <p className="text-green-400 text-xs">Gov. Intervention System</p>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white leading-snug mb-4">
            Centralized<br />Agricultural<br />Intervention<br />Distribution System
          </h1>
          <p className="text-green-300 text-sm leading-relaxed mb-8">
            A unified government platform for managing farmer registration, supply inventory, and agricultural intervention programs.
          </p>
          <div className="space-y-3">
            {[
              { icon: Leaf, label: 'Farmer Registration & Eligibility' },
              { icon: BarChart3, label: 'Inventory & Stock Monitoring' },
              { icon: Shield, label: 'Distribution & Program Management' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-800 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-green-300" />
                </div>
                <span className="text-green-200 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-green-600 text-xs">
          <Shield size={12} />
          <span>Secured Government Portal</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center">
              <Sprout size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">AgriDistro</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none bg-white transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 cursor-pointer mt-1"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-700 font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
