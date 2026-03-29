import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DataTable } from '../components/DataTable';
import { QuizAttempt } from '../types';
import axios from 'axios';

const UserMonitoring: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllAttempts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/progress/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttempts(response.data);
      } catch (err) {
        console.error('Failed to fetch all attempts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAttempts();
  }, []);

  const columns = [
    {
      header: 'Student',
      accessor: (attempt: QuizAttempt) => {
        const user = typeof attempt.userId === 'object' ? attempt.userId : { name: 'Unknown', email: 'N/A' };
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Course',
      accessor: (attempt: QuizAttempt) => (
        <span className="font-semibold text-gray-700">
          {typeof attempt.courseId === 'object' ? attempt.courseId.title : 'Course'}
        </span>
      )
    },
    {
      header: 'Score',
      accessor: (attempt: QuizAttempt) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-bold",
            attempt.score >= 70 ? "text-emerald-600" : "text-red-600"
          )}>{Math.round(attempt.score)}%</span>
          {attempt.score >= 70 && <ArrowUpRight size={14} className="text-emerald-500" />}
        </div>
      )
    },
    {
      header: 'Date',
      accessor: (attempt: QuizAttempt) => (
        <span className="text-sm text-gray-500">
          {new Date(attempt.attemptDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (attempt: QuizAttempt) => (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
          attempt.score >= 70 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {attempt.score >= 70 ? 'Passed' : 'Failed'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: () => (
        <div className="flex items-center justify-end gap-2">
          <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
            <Eye size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <MoreHorizontal size={18} />
          </button>
        </div>
      )
    }
  ];

  const filteredAttempts = attempts.filter(attempt => {
    const user = typeof attempt.userId === 'object' ? attempt.userId : { name: '', email: '' };
    const course = typeof attempt.courseId === 'object' ? attempt.courseId : { title: '' };
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
          <h1 className="text-2xl font-bold text-gray-900">User Progress Monitoring</h1>
          <p className="text-gray-500">Monitor all student quiz attempts and performance.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-primary hover:border-primary transition-all">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name, email or course..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-primary hover:border-primary transition-all">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredAttempts} />
    </div>
  );
};

export default UserMonitoring;
