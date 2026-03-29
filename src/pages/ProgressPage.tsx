import React, { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Calendar, 
  Filter, 
  Download,
  TrendingUp,
  Award,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { QuizAttempt, User } from '../types';

const ProgressPage: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/quiz/results/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttempts(response.data);
      } catch (err) {
        console.error('Failed to fetch attempts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const chartData = attempts.map(a => ({
    name: new Date(a.attemptDate).toLocaleDateString(),
    score: Math.round(a.score)
  })).reverse();

  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-gray-500">Track your performance and quiz history.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-primary hover:border-primary transition-all">
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-primary hover:border-primary transition-all">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-black text-gray-800">
              {attempts.length > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) : 0}%
            </p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Best Score</p>
            <p className="text-2xl font-black text-gray-800">{Math.round(bestScore)}%</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Quizzes Taken</p>
            <p className="text-2xl font-black text-gray-800">{attempts.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Performance Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Quiz History</h2>
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Correct Answers</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attempts.map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {typeof attempt.courseId === 'object' ? attempt.courseId.title : 'Course'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-sm font-bold",
                            attempt.score >= 70 ? "text-emerald-600" : "text-red-600"
                          )}>{Math.round(attempt.score)}%</span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                attempt.score >= 70 ? "bg-emerald-500" : "bg-red-500"
                              )} 
                              style={{ width: `${attempt.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {attempt.correctAnswers} / {attempt.totalQuestions}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(attempt.attemptDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                          attempt.score >= 70 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          {attempt.score >= 70 ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
