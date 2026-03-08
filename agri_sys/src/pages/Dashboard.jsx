import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Package, ShoppingBag, AlertTriangle, CheckCircle, Clock, Activity, TrendingUp, Leaf, BarChart3 } from 'lucide-react';

function StatCard({ icon: Icon, label, value, subtext, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={21} className={iconColor} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, number, title, color }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon size={14} className="text-white" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Module {number}</span>
        <h2 className="text-sm font-bold text-slate-700 leading-tight">{title}</h2>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    farmers: 0, pendingFarmers: 0, approvedFarmers: 0,
    inventory: 0, lowStock: 0,
    distributions: 0, pendingDistributions: 0, completedDistributions: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'admin' || user?.role === 'officer') {
          const [farmers, inventory, distributions] = await Promise.all([
            api.get('/auth/farmers'),
            api.get('/products/'),
            api.get('/distributions/'),
          ]);
          setStats({
            farmers: farmers.data.length,
            pendingFarmers: farmers.data.filter(f => f.eligibility_status === 'pending').length,
            approvedFarmers: farmers.data.filter(f => f.eligibility_status === 'approved').length,
            inventory: inventory.data.length,
            lowStock: inventory.data.filter(p => p.current_stock <= p.reorder_level).length,
            distributions: distributions.data.length,
            pendingDistributions: distributions.data.filter(d => d.status === 'pending').length,
            completedDistributions: distributions.data.filter(d => d.status === 'completed').length,
          });
        } else {
          const dist = await api.get('/distributions/');
          setStats(s => ({
            ...s,
            distributions: dist.data.length,
            pendingDistributions: dist.data.filter(d => d.status === 'pending').length,
            completedDistributions: dist.data.filter(d => d.status === 'completed').length,
          }));
        }
      } catch (e) { console.error(e); }
    };
    if (user) load();
  }, [user]);

  const isPrivileged = user?.role === 'admin' || user?.role === 'officer';

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shadow-sm">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-sm text-slate-500 capitalize">
            {user?.role}
            {user?.role === 'farmer' && user?.eligibility_status && ` · Eligibility: ${user.eligibility_status}`}
          </p>
        </div>
      </div>

      {isPrivileged && (
        <div className="space-y-8">
          <section>
            <SectionHeader icon={Users} number="1" title="Farmer Registration & Eligibility" color="bg-blue-600" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Users} label="Registered Farmers" value={stats.farmers} iconBg="bg-blue-50" iconColor="text-blue-600" />
              <StatCard icon={Clock} label="Pending Approval" value={stats.pendingFarmers} subtext="Awaiting review" iconBg="bg-amber-50" iconColor="text-amber-600" />
              <StatCard icon={CheckCircle} label="Approved Farmers" value={stats.approvedFarmers} subtext="Eligible for distribution" iconBg="bg-green-50" iconColor="text-green-600" />
            </div>
          </section>

          <section>
            <SectionHeader icon={Package} number="2" title="Inventory & Stock Monitoring" color="bg-emerald-700" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard icon={Package} label="Inventory Items" value={stats.inventory} subtext="Total supply items tracked" iconBg="bg-emerald-50" iconColor="text-emerald-700" />
              <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={stats.lowStock} subtext="Items below reorder level" iconBg="bg-red-50" iconColor="text-red-500" />
            </div>
          </section>

          <section>
            <SectionHeader icon={ShoppingBag} number="3" title="Distribution & Program Management" color="bg-purple-700" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={BarChart3} label="Total Distributions" value={stats.distributions} iconBg="bg-purple-50" iconColor="text-purple-700" />
              <StatCard icon={TrendingUp} label="Completed" value={stats.completedDistributions} subtext="Successfully released" iconBg="bg-green-50" iconColor="text-green-600" />
              <StatCard icon={Clock} label="Pending" value={stats.pendingDistributions} subtext="Awaiting processing" iconBg="bg-amber-50" iconColor="text-amber-600" />
            </div>
          </section>
        </div>
      )}

      {user?.role === 'farmer' && (
        <div>
          <SectionHeader icon={Leaf} number="" title="My Distribution Summary" color="bg-green-700" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={ShoppingBag} label="Total Received" value={stats.distributions} iconBg="bg-green-50" iconColor="text-green-700" />
            <StatCard icon={Clock} label="Pending" value={stats.pendingDistributions} iconBg="bg-amber-50" iconColor="text-amber-600" />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completedDistributions} iconBg="bg-blue-50" iconColor="text-blue-600" />
          </div>
          {user?.eligibility_status !== 'approved' && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Eligibility Pending</p>
                <p className="text-xs text-amber-700 mt-0.5">Your account is awaiting approval. You will be notified once eligible for distributions.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
