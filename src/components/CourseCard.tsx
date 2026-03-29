import React from 'react';
import { BookOpen, Clock, Play } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onStart: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onStart }) => {
  return (
    <div className="card overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${course._id}/400/250`} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6">
          {course.description}
        </p>
        
        <button 
          onClick={() => onStart(course._id)}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Play size={16} fill="currentColor" />
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
