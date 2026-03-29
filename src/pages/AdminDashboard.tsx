import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  FileQuestion, 
  Activity,
  TrendingUp,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalQuestions: 0,
    totalAttempts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const barData = [
    { name: 'Mon', attempts: 400 },
    { name: 'Tue', attempts: 300 },
    { name: 'Wed', attempts: 600 },
    { name: 'Thu', attempts: 800 },
    { name: 'Fri', attempts: 500 },
    { name: 'Sat', attempts: 200 },
    { name: 'Sun', attempts: 150 },
  ];

  const pieData = [
    { name: 'Web Dev', value: 400 },
    { name: 'Design', value: 300 },
    { name: 'Programming', value: 300 },
    { name: 'Data Science', value: 200 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">Manage your platform performance and user activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend={{ value: 8, isPositive: true }}
          color="bg-primary"
        />
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon={BookOpen} 
          trend={{ value: 2, isPositive: true }}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Total Questions" 
          value={stats.totalQuestions} 
          icon={FileQuestion} 
          color="bg-amber-500"
        />
        <StatCard 
          title="Total Attempts" 
          value={stats.totalAttempts.toLocaleString()} 
          icon={Activity} 
          trend={{ value: 15, isPositive: true }}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Daily Quiz Activity</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} />
              +12.5%
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Bar 
                  dataKey="attempts" 
                  fill="#4f46e5" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-800">Category Distribution</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-8 space-y-6">
        <h2 className="text-lg font-bold text-gray-800">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Server Load</p>
              <p className="text-xl font-black text-gray-800">24%</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uptime</p>
              <p className="text-xl font-black text-gray-800">99.9%</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Users</p>
              <p className="text-xl font-black text-gray-800">142</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
