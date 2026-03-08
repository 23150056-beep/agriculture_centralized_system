import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Package, ShoppingBag, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, subtext }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}><Icon size={24} className="text-white" /></div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    farmers: 0,
    pendingFarmers: 0,
    inventory: 0,
    lowStock: 0,
    distributions: 0,
    pendingDistributions: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const isAdmin = user?.role === 'admin';
        const isOfficer = user?.role === 'officer';
        
        if (isAdmin || isOfficer) {
          // Module 1: Farmer stats
          const farmers = await api.get('/auth/farmers');
          const pendingFarmers = farmers.data.filter(f => f.eligibility_status === 'pending').length;
          
          // Module 2: Inventory stats
          const inventory = await api.get('/products/');
          const lowStock = inventory.data.filter(p => p.current_stock <= p.reorder_level).length;
          
          // Module 3: Distribution stats
          const distributions = await api.get('/distributions/');
          const pendingDist = distributions.data.filter(d => d.status === 'pending').length;
          
          setStats({
            farmers: farmers.data.length,
            pendingFarmers,
            inventory: inventory.data.length,
            lowStock,
            distributions: distributions.data.length,
            pendingDistributions: pendingDist,
          });
        } else {
          // Farmer view
          const distributions = await api.get('/distributions/');
          setStats({
            distributions: distributions.data.length,
            pendingDistributions: distributions.data.filter(d => d.status === 'pending').length,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    
    loadStats();
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const isFarmer = user?.role === 'farmer';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome, {user?.name}</h1>
      <p className="text-gray-500 mb-8">
        {isAdmin && "Admin Dashboard - Monitor all system activities"}
        {isOfficer && "Officer Dashboard - Manage distributions and farmers"}
        {isFarmer && `Farmer Dashboard - ${user.eligibility_status === 'approved' ? 'Approved for distributions' : 'Registration pending'}`}
      </p>

      {(isAdmin || isOfficer) && (
        <div className="space-y-8">
          {/* Module 1: Farmer Registration & Eligibility */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Module 1: Farmer Registration & Eligibility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={Users}
                label="Registered Farmers"
                value={stats.farmers}
                color="bg-blue-500"
              />
              <StatCard
                icon={Clock}
                label="Pending Approval"
                value={stats.pendingFarmers}
                color="bg-yellow-500"
                subtext="Awaiting eligibility review"
              />
            </div>
          </div>

          {/* Module 2: Inventory & Stock Monitoring */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Module 2: Inventory & Stock Monitoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={Package}
                label="Inventory Items"
                value={stats.inventory}
                color="bg-green-500"
              />
              <StatCard
                icon={AlertTriangle}
                label="Low Stock Alerts"
                value={stats.lowStock}
                color="bg-orange-500"
                subtext="Items below reorder level"
              />
            </div>
          </div>

          {/* Module 3: Distribution & Program Management */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Module 3: Distribution & Program Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={ShoppingBag}
                label="Total Distributions"
                value={stats.distributions}
                color="bg-purple-500"
              />
              <StatCard
                icon={Clock}
                label="Pending Distributions"
                value={stats.pendingDistributions}
                color="bg-indigo-500"
                subtext="Awaiting processing"
              />
            </div>
          </div>
        </div>
      )}

      {isFarmer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={CheckCircle}
            label="My Distributions"
            value={stats.distributions}
            color="bg-green-500"
          />
          <StatCard
            icon={Clock}
            label="Pending Distributions"
            value={stats.pendingDistributions}
            color="bg-yellow-500"
          />
        </div>
      )}
    </div>
  );
}
