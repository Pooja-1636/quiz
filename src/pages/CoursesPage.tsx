import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { Course } from '../types';

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleStartQuiz = (id: string) => {
    navigate(`/quiz/${id}`);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-500">Choose a course and test your knowledge.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="input-field pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard 
              key={course._id} 
              course={course} 
              onStart={handleStartQuiz} 
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
