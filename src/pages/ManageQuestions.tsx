import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Modal from '../components/Modal';
import { cn } from '../lib/utils';
import axios from 'axios';
import { Question, Course } from '../types';

const ManageQuestions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    courseId: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const coursesRes = await axios.get('/api/courses');
      setCourses(coursesRes.data);
      
      const qUrl = selectedCourse === 'All' ? '/api/questions/all' : `/api/questions/${selectedCourse}`;
      const questionsRes = await axios.get(qUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questionsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourse]);

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setNewQuestion({ courseId: '', text: '', options: ['', '', '', ''], correctAnswer: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (question: Question) => {
    setEditingQuestion(question);
    const courseId = typeof question.courseId === 'object' ? question.courseId._id : question.courseId;
    setNewQuestion({
      courseId,
      text: question.text,
      options: [...question.options],
      correctAnswer: question.correctAnswer
    });
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!newQuestion.courseId || !newQuestion.text.trim() || newQuestion.options.some(opt => !opt.trim()) || !newQuestion.correctAnswer) {
      alert('Please fill in all fields and select a correct answer.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (editingQuestion) {
        await axios.put(`/api/questions/${editingQuestion._id}`, newQuestion, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/questions', newQuestion, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setNewQuestion({ courseId: '', text: '', options: ['', '', '', ''], correctAnswer: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to save question', err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
          <p className="text-gray-500">Add and edit questions for your quiz courses.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search questions..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <button className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div key={q._id} className="card p-6 group hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {typeof q.courseId === 'object' ? q.courseId.title : courses.find(c => c._id === q.courseId)?.title}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 leading-relaxed">
                  {q.text}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((option, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border text-sm font-medium",
                        option === q.correctAnswer 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-gray-50 border-gray-100 text-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-[10px] font-black",
                        option === q.correctAnswer ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {option === q.correctAnswer && <CheckCircle2 size={16} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleOpenEditModal(q)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteQuestion(q._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingQuestion ? "Edit Question" : "Add New Question"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Course Selection</label>
            <select 
              className="input-field"
              value={newQuestion.courseId}
              onChange={(e) => setNewQuestion({ ...newQuestion, courseId: e.target.value })}
            >
              <option value="">Select a course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Question Text</label>
            <textarea 
              className="input-field h-24" 
              placeholder="Enter your question here..."
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            ></textarea>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700">Options</label>
            {newQuestion.options.map((option, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[i] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                />
                <input 
                  type="radio" 
                  name="correct" 
                  className="w-5 h-5 text-primary focus:ring-primary"
                  checked={newQuestion.correctAnswer === option && option !== ''}
                  onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: newQuestion.options[i] })}
                />
              </div>
            ))}
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">Select the radio button for the correct answer</p>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveQuestion}
              className="flex-1 btn-primary"
            >
              {editingQuestion ? "Update Question" : "Save Question"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageQuestions;
