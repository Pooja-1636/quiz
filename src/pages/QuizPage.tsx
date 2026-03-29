import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  XCircle,
  Maximize,
  Lock,
  Brain,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { Course, Question } from '../types';
import { useFullscreenGuard } from '../hooks/useFullscreenGuard';
import { motion, AnimatePresence } from 'motion/react';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [currentDifficulty, setCurrentDifficulty] = useState<'basic' | 'advanced'>('basic');
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [correctBasic, setCorrectBasic] = useState(0);
  const [correctAdvanced, setCorrectAdvanced] = useState(0);
  const [endOfQuiz, setEndOfQuiz] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes default
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.get('/api/courses', config);
        const currentCourse = response.data.find((c: Course) => c._id === id);
        setCourse(currentCourse);
      } catch (err) {
        console.error('Failed to fetch course data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchNextQuestion = async (lastAnswerCorrect?: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/quiz/next-question', {
        courseId: id,
        lastAnswerCorrect,
        currentDifficulty,
        answeredQuestionIds
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.endOfQuiz) {
        setEndOfQuiz(true);
        setShowConfirmSubmit(true);
        return;
      }

      const nextQuestion = response.data;
      setQuestions(prev => [...prev, nextQuestion]);
      setCurrentDifficulty(nextQuestion.difficulty);
      setAnsweredQuestionIds(prev => [...prev, nextQuestion._id]);
      if (questions.length > 0) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to fetch next question', err);
    }
  };

  const handleSubmit = useCallback(async (disqualified = false) => {
    if (submitting) return;
    setSubmitting(true);
    
    // Exit fullscreen on submit
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    try {
      const token = localStorage.getItem('token');
      const answers = Object.entries(selectedAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));
      
      const response = await axios.post('/api/quiz/submit', {
        courseId: id,
        answers,
        violations: violationCount,
        isDisqualified: disqualified,
        correctBasic,
        correctAdvanced
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      navigate('/result', { 
        state: { 
          result: response.data,
          questions,
          selectedAnswers,
          courseName: course?.title
        } 
      });
    } catch (err) {
      console.error('Failed to submit quiz', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [id, selectedAnswers, navigate, course, questions, submitting, violationCount, correctBasic, correctAdvanced]);

  const handleViolation = (count: number, reason: string) => {
    setViolationCount(count);
    setViolationReason(reason);
    setShowWarning(true);
  };

  const handleDisqualify = (reason: string) => {
    setViolationReason(reason);
    setIsDisqualified(true);
    handleSubmit(true);
  };

  const { enterFullscreen } = useFullscreenGuard({
    maxViolations: 3,
    onViolation: handleViolation,
    onDisqualify: handleDisqualify,
    isActive: quizStarted && !loading && questions.length > 0 && !submitting && !isDisqualified
  });

  const handleStartQuiz = async () => {
    await enterFullscreen();
    setQuizStarted(true);
    await fetchNextQuestion();
  };

  useEffect(() => {
    if (loading || questions.length === 0 || !quizStarted) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit, loading, questions.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold text-gray-800">Course not found</h2>
        <button onClick={() => navigate('/courses')} className="btn-primary">Back to Courses</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / (questions.length + (endOfQuiz ? 0 : 1))) * 100 : 0;

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-500">
        <div className="card p-10 text-center space-y-8 shadow-xl">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Lock size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Ready to start?</h1>
            <p className="text-gray-500 max-w-md mx-auto">
              This exam uses <span className="font-bold text-gray-800">Secure Exam Mode</span>. 
              Once you start, the browser will enter full-screen. Switching tabs or exiting full-screen will result in disqualification.
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-left space-y-3">
            <h4 className="font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle size={18} />
              Exam Rules:
            </h4>
            <ul className="text-sm text-amber-700 space-y-2 list-disc pl-5">
              <li>Full-screen mode is mandatory.</li>
              <li>Do not switch tabs or minimize the window.</li>
              <li>Right-click and copy/paste are disabled.</li>
              <li>The timer will not pause for any reason.</li>
            </ul>
          </div>

          <button 
            onClick={handleStartQuiz}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3"
          >
            <Maximize size={24} />
            Start Exam in Full-Screen
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            {currentQuestion?.difficulty && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-300",
                currentQuestion.difficulty === 'advanced' 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : "bg-blue-50 text-blue-700 border-blue-200"
              )}>
                {currentQuestion.difficulty === 'advanced' ? (
                  <GraduationCap size={12} className="text-purple-600" />
                ) : (
                  <Brain size={12} className="text-blue-600" />
                )}
                {currentQuestion.difficulty}
              </div>
            )}
          </div>
          <p className="text-gray-500">Question {currentQuestionIndex + 1}</p>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold shadow-sm border transition-colors",
          timeLeft < 60 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-white text-gray-700 border-gray-100"
        )}>
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="card p-8 space-y-8 shadow-md">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestion._id]: option }))}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                selectedAnswers[currentQuestion._id] === option
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-100 hover:border-primary/30 hover:bg-gray-50 text-gray-700"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors",
                  selectedAnswers[currentQuestion._id] === option
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium">{option}</span>
              </div>
              {selectedAnswers[currentQuestion._id] === option && (
                <CheckCircle2 size={20} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end">
        {endOfQuiz || currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="btn-primary px-8 py-3 flex items-center gap-2"
          >
            Submit Quiz
            <Send size={18} />
          </button>
        ) : (
          <button
            onClick={async () => {
              const answer = selectedAnswers[currentQuestion._id];
              if (!answer) return;
              
              const isCorrect = answer === currentQuestion.correctAnswer;
              if (isCorrect) {
                if (currentQuestion.difficulty === 'advanced') {
                  setCorrectAdvanced(prev => prev + 1);
                } else {
                  setCorrectBasic(prev => prev + 1);
                }
              }
              
              await fetchNextQuestion(isCorrect);
            }}
            disabled={!selectedAnswers[currentQuestion._id]}
            className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50"
          >
            Next Question
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="card w-full max-w-md p-8 text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Submit Quiz?</h3>
              <p className="text-gray-500 mt-2">
                You have answered {Object.keys(selectedAnswers).length} out of {questions.length} questions. Are you sure you want to finish?
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSubmit(false)}
                className="flex-1 btn-primary"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="card w-full max-w-md p-8 text-center space-y-6 border-2 border-red-200 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-red-600 uppercase tracking-tight">Cheat Detection Warning</h3>
                <p className="text-gray-600 font-medium">
                  {violationReason || "You switched tabs or minimized the window."} This is strictly prohibited.
                </p>
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-700 font-bold">
                    Violation {violationCount} of 3
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    One more violation will result in automatic disqualification.
                  </p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setShowWarning(false);
                  await enterFullscreen();
                }}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                I Understand, Return to Full-Screen
              </button>
            </motion.div>
          </motion.div>
        )}

        {isDisqualified && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-red-600 flex items-center justify-center z-[70] p-6"
          >
            <div className="text-center text-white space-y-6 max-w-lg">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-24 h-24 bg-white text-red-600 rounded-full flex items-center justify-center mx-auto"
              >
                <XCircle size={64} />
              </motion.div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">You Are Disqualified</h2>
              <p className="text-xl opacity-90 font-medium">
                {violationReason || "Multiple tab switches detected."} Your quiz has been automatically submitted with a score of 0.
              </p>
              <div className="pt-8">
                <Loader2 className="animate-spin mx-auto" size={32} />
                <p className="mt-2 text-sm opacity-70">Redirecting to results...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
