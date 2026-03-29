import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { User } from '../types';
import { cn } from '../lib/utils';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get('/api/health');
        if (res.data.database === 'connected') {
          setDbStatus('connected');
        } else {
          setDbStatus('error');
        }
      } catch (err) {
        setDbStatus('error');
      }
    };
    checkHealth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      onLogin(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to continue your learning journey</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              dbStatus === 'connected' ? "bg-emerald-500" : dbStatus === 'error' ? "bg-red-500" : "bg-amber-500 animate-pulse"
            )} />
            <span className="text-xs font-medium text-gray-500">
              Database: {dbStatus === 'connected' ? 'Connected' : dbStatus === 'error' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
        </div>

        <div className="card p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10" 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-4 text-xs text-gray-400">
          <button onClick={() => { setEmail('user@example.com'); setPassword('password'); }} className="hover:text-primary">Demo User</button>
          <span>•</span>
          <button onClick={() => { setEmail('admin@example.com'); setPassword('password'); }} className="hover:text-primary">Demo Admin</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
