import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  BookOpen,
  Filter,
  Loader2
} from 'lucide-react';
import Modal from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { Course } from '../types';
import axios from 'axios';

const ManageCourses: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    thumbnail: 'https://picsum.photos/seed/course/400/300'
  });

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setNewCourse({ title: '', description: '', thumbnail: 'https://picsum.photos/seed/course/400/300' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({ 
      title: course.title, 
      description: course.description, 
      thumbnail: course.thumbnail || 'https://picsum.photos/seed/course/400/300' 
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse._id}`, newCourse, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/courses', newCourse, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error('Failed to save course', err);
    }
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/${courseToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      console.error('Failed to delete course', err);
    }
  };

  const columns = [
    {
      header: 'Course Info',
      accessor: (course: Course) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-gray-800">{course.title}</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{course.description}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Questions',
      accessor: (course: Course) => (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
          <BookOpen size={14} className="text-gray-400" />
          {course.questionCount || 0}
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (course: Course) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleOpenEditModal(course)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteClick(course)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-500">Create, edit, and organize your quiz content.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Course
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses by title or description..." 
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

      <DataTable columns={columns} data={filteredCourses} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCourse ? "Edit Course" : "Add New Course"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Course Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Intro to Python"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea 
              className="input-field h-24" 
              placeholder="Briefly describe the course..."
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            ></textarea>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Thumbnail URL</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://..."
              value={newCourse.thumbnail}
              onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
            />
          </div>
          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveCourse}
              className="flex-1 btn-primary"
            >
              {editingCourse ? "Update Course" : "Create Course"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Course"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl text-red-600">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="font-bold">Are you sure you want to delete this course?</p>
              <p className="text-sm opacity-80">This action cannot be undone and will delete all associated questions and quiz attempts.</p>
            </div>
          </div>

          {courseToDelete && (
            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course to delete</p>
              <div className="flex items-center gap-3">
                <img src={courseToDelete.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <p className="font-bold text-gray-800">{courseToDelete.title}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageCourses;
