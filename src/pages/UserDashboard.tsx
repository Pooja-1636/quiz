import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  BookOpen, 
  Target, 
  Clock, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import axios from 'axios';
import { User, QuizAttempt, Course } from '../types';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [attemptsRes, coursesRes] = await Promise.all([
          axios.get(`/api/quiz/results/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/courses')
        ]);
        setAttempts(attemptsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const stats = {
    totalQuizzes: attempts.length,
    coursesCompleted: attempts.filter(a => a.score >= 70).length,
    averageScore: attempts.length > 0 
      ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) 
      : 0,
    latestActivity: attempts[0] 
      ? new Date(attempts[0].attemptDate).toLocaleDateString() 
      : 'No activity yet'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
        <p className="text-gray-500">Here's what's happening with your learning progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Quizzes Attempted" 
          value={stats.totalQuizzes} 
          icon={Trophy} 
          trend={{ value: 12, isPositive: true }}
          color="bg-amber-500"
        />
        <StatCard 
          title="Courses Completed" 
          value={stats.coursesCompleted} 
          icon={BookOpen} 
          trend={{ value: 5, isPositive: true }}
          color="bg-primary"
        />
        <StatCard 
          title="Average Score" 
          value={`${stats.averageScore}%`} 
          icon={Target} 
          trend={{ value: 2, isPositive: true }}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Latest Activity" 
          value={stats.latestActivity} 
          icon={Clock} 
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <Link to="/progress" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attempts.slice(0, 5).map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {typeof attempt.courseId === 'object' ? attempt.courseId.title : 'Course'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                attempt.score >= 70 ? "bg-emerald-500" : "bg-red-500"
                              )} 
                              style={{ width: `${attempt.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{Math.round(attempt.score)}%</span>
                        </div>
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

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Recommended</h2>
          <div className="space-y-4">
            {courses.slice(0, 3).map((course) => (
              <Link key={course._id} to={`/quiz/${course._id}`} className="block card p-4 group hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><BookOpen size={10} /> {course.questionCount || 0} Qs</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Link to="/courses" className="block w-full text-center py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-semibold hover:border-primary hover:text-primary transition-all">
              Explore more courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
