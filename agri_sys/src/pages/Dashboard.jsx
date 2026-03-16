import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Package, ShoppingBag, AlertTriangle, CheckCircle, Clock, Activity, TrendingUp, Leaf, BarChart3, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import StockBadge from '../components/StockBadge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function StatCard({ icon, label, value, subtext, iconBg, iconColor }) {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <IconComponent size={21} className={iconColor} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <div className="text-2xl font-bold text-slate-800 leading-tight">
          {value !== undefined ? value : <Loader2 className="animate-spin w-5 h-5 text-slate-400 mt-1" />}
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ icon, number, title, color }) {
  const IconComponent = icon;
  return (
    <div className="flex items-center gap-3 mb-4">
      {number && (
        <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <IconComponent size={14} className="text-white" />
        </div>
      )}
      {!number && IconComponent && (
        <div className={`w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <IconComponent size={14} className="text-slate-600" />
        </div>
      )}
      <div>
        {number && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Module {number}</span>}
        <h2 className="text-sm font-bold text-slate-700 leading-tight">{title}</h2>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    farmers: { total: 0, pending: 0, approved: 0 },
    inventory: { total_products: 0, low_stock: 0, out_of_stock: 0 },
    distributions: { total: 0, completed: 0, pending: 0 },
    programs: { total: 0 }
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (user?.role === 'admin' || user?.role === 'officer') {
          const [overviewRes, monthlyRes, lowStockRes] = await Promise.all([
            api.get('/analytics/overview'),
            api.get('/analytics/distributions/by-month'),
            api.get('/analytics/products/low-stock')
          ]);
          
          setStats(overviewRes.data);
          setMonthlyData(monthlyRes.data || []);
          setLowStockItems(lowStockRes.data || []);
          
        } else if (user?.role === 'farmer') {
          const dist = await api.get('/distributions/');
          setStats(s => ({
            ...s,
            distributions: {
              total: dist.data.length,
              pending: dist.data.filter(d => d.status === 'pending').length,
              completed: dist.data.filter(d => d.status === 'completed').length,
            }
          }));
        }
      } catch (e) { 
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) loadDashboardData();
  }, [user]);

  const isPrivileged = user?.role === 'admin' || user?.role === 'officer';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' } },
      x: { grid: { display: false, drawBorder: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' } }
    },
    interaction: { mode: 'index', intersect: false },
  };

  const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : [];
  const safeLowStockItems = Array.isArray(lowStockItems) ? lowStockItems : [];

  const chartData = {
    labels: safeMonthlyData.map(d => d.month || ''),
    datasets: [
      {
        label: 'Distributions',
        data: safeMonthlyData.map(d => d.count || 0),
        borderColor: '#15803d',
        backgroundColor: 'rgba(21, 128, 61, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#15803d',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-md shadow-green-900/10">
          <Activity size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-sm text-slate-500 capitalize">
            {user?.role}
            {user?.role === 'farmer' && user?.eligibility_status && ` � Eligibility: ${user.eligibility_status}`}
          </p>
        </div>
      </div>

      {isPrivileged && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Farmers" value={stats.farmers.total} subtext={<><b>{stats.farmers.pending}</b> pending approval</>} iconBg="bg-blue-50" iconColor="text-blue-600" />
            <StatCard icon={Package} label="Inventory Items" value={stats.inventory.total_products} subtext={<><b>{stats.inventory.low_stock}</b> items low stock</>} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard icon={ShoppingBag} label="Distributions" value={stats.distributions.total} subtext={<><b>{stats.distributions.completed}</b> completed</>} iconBg="bg-purple-50" iconColor="text-purple-600" />
            <StatCard icon={BarChart3} label="Active Programs" value={stats.programs.total} subtext="Government initiatives" iconBg="bg-amber-50" iconColor="text-amber-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-600" />
                    <h3 className="font-bold text-slate-800">Distribution Trends</h3>
                </div>
              </div>
              <div className="p-6 flex-1 min-h-[300px] w-full relative">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : safeMonthlyData.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <BarChart3 size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">No distribution data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" />
                    <h3 className="font-bold text-slate-800">Critical Stock Alerts</h3>
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">
                  {stats.inventory.low_stock} issues
                </span>
              </div>
              
              <div className="p-0 flex-1 overflow-auto max-h-[350px]">
                {loading ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                  </div>
                  ) : safeLowStockItems.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {safeLowStockItems.map(item => (
                      <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-slate-800 text-sm truncate pr-2">{item.name}</p>
                          <StockBadge status={item.status} />
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-slate-500">Stock: <b className={`font-semibold ${item.current_stock === 0 ? 'text-red-600' : 'text-slate-700'}`}>{item.current_stock}</b> / {item.reorder_level}</span>
                          <span className="text-slate-400">{item.batch_number}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${item.current_stock === 0 ? 'bg-red-500' : 'bg-amber-400'}`} 
                            style={{ width: `${Math.min(100, (item.current_stock / item.reorder_level) * 100)}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle size={24} className="text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">All stock levels healthy</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'farmer' && (
        <div className="max-w-3xl">
          <SectionHeader icon={Leaf} title="My Distribution Summary" color="bg-green-700" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={ShoppingBag} label="Total Received" value={stats.distributions.total} iconBg="bg-green-50" iconColor="text-green-700" />
            <StatCard icon={Clock} label="Pending" value={stats.distributions.pending} iconBg="bg-amber-50" iconColor="text-amber-600" />
            <StatCard icon={CheckCircle} label="Completed" value={stats.distributions.completed} iconBg="bg-blue-50" iconColor="text-blue-600" />
          </div>
          
          {user?.eligibility_status !== 'approved' && (
            <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 shadow-sm">
              <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0 mt-0.5">
                <AlertTriangle size={20} className="text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Eligibility Pending</p>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">Your account is currently {user?.eligibility_status || "pending"}. You will not be able to receive distributions until an officer approves your submitted agricultural documents.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
