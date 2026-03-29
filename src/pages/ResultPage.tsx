import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Home,
  Share2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
  
  const { result, questions, selectedAnswers, courseName } = location.state || {
    result: { score: 0, totalQuestions: 0, correctAnswers: 0, wrongAnswers: 0 },
    questions: [],
    selectedAnswers: {},
    courseName: 'Unknown Quiz'
  };

  const score = Math.round(result.score);
  const totalQuestions = result.totalQuestions;
  const correctAnswers = result.correctAnswers;
  const wrongAnswers = result.wrongAnswers;
  const correctBasic = result.correctBasic || 0;
  const correctAdvanced = result.correctAdvanced || 0;
  const violations = result.violations || 0;
  const isDisqualified = result.isDisqualified || false;
  const isPassed = score >= 70 && !isDisqualified;

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in zoom-in duration-500 space-y-8">
      <div className="card p-10 text-center space-y-8 shadow-xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className={cn(
          "absolute top-0 left-0 w-full h-2",
          isPassed ? "bg-emerald-500" : "bg-red-500"
        )} />

        <div className="space-y-4">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg",
            isDisqualified ? "bg-red-600 text-white" : isPassed ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          )}>
            {isDisqualified ? <ShieldAlert size={48} /> : isPassed ? <Trophy size={48} /> : <XCircle size={48} />}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isDisqualified ? 'Disqualified' : isPassed ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isDisqualified 
                ? "Your attempt was flagged for multiple tab switches." 
                : <>You completed the <span className="font-bold text-gray-800">{courseName}</span> quiz.</>}
            </p>
          </div>
        </div>

        {violations > 0 && (
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-3 text-sm font-medium",
            isDisqualified ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"
          )}>
            <AlertTriangle size={20} />
            <p>
              {isDisqualified 
                ? `Disqualified due to ${violations} violations.` 
                : `Warning: ${violations} tab switch violations recorded.`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-50">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</p>
            <p className={cn(
              "text-3xl font-black",
              isPassed ? "text-emerald-600" : "text-red-600"
            )}>{score}%</p>
          </div>
          <div className="space-y-1 border-x border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correct</p>
            <p className="text-3xl font-black text-gray-800">{correctAnswers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Qs</p>
            <p className="text-3xl font-black text-gray-800">{totalQuestions}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl text-blue-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} />
              <div className="text-left">
                <span className="font-semibold block">Basic Questions</span>
                <span className="text-[10px] opacity-70 uppercase font-bold tracking-wider">Weight: 1x</span>
              </div>
            </div>
            <span className="font-bold">{correctBasic}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl text-purple-700">
            <div className="flex items-center gap-3">
              <Trophy size={20} />
              <div className="text-left">
                <span className="font-semibold block">Advanced Questions</span>
                <span className="text-[10px] opacity-70 uppercase font-bold tracking-wider">Weight: 2x</span>
              </div>
            </div>
            <span className="font-bold">{correctAdvanced}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl text-red-700">
            <div className="flex items-center gap-3">
              <XCircle size={20} />
              <span className="font-semibold">Wrong Answers</span>
            </div>
            <span className="font-bold">{wrongAnswers}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={() => navigate('/courses')}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Try Another
          </button>
          <Link 
            to="/dashboard"
            className="flex-1 px-6 py-3 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Dashboard
          </Link>
        </div>

        <button className="text-sm font-semibold text-gray-400 hover:text-primary flex items-center gap-2 mx-auto transition-colors">
          <Share2 size={16} />
          Share your result
        </button>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setShowReview(!showReview)}
          className="w-full card p-6 bg-primary/5 border-primary/10 hover:bg-primary/10 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <RotateCcw size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-800">Review Questions</h4>
                <p className="text-xs text-gray-500">Go back and see the correct answers.</p>
              </div>
            </div>
            <div className="p-2 text-primary">
              {showReview ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
          </div>
        </button>

        {showReview && (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
            {questions.map((q: any, idx: number) => {
              const userAnswer = selectedAnswers[q._id];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={q._id} className="card p-6 space-y-4 border-l-4 border-l-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question {idx + 1}</p>
                        {q.difficulty && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                            q.difficulty === 'advanced' 
                              ? "bg-purple-100 text-purple-700 border border-purple-200" 
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          )}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{q.text}</h3>
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={24} />
                    ) : (
                      <XCircle className="text-red-500 flex-shrink-0" size={24} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((option: string, i: number) => {
                      const isSelected = userAnswer === option;
                      const isCorrectOption = q.correctAnswer === option;
                      
                      return (
                        <div 
                          key={i}
                          className={cn(
                            "p-3 rounded-lg text-sm font-medium flex items-center justify-between",
                            isCorrectOption 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : isSelected && !isCorrect
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : "bg-gray-50 text-gray-600 border border-gray-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-6 h-6 rounded flex items-center justify-center text-[10px] font-black",
                              isCorrectOption 
                                ? "bg-emerald-500 text-white" 
                                : isSelected && !isCorrect
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-200 text-gray-500"
                            )}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {option}
                          </div>
                          {isCorrectOption && <CheckCircle2 size={16} />}
                          {isSelected && !isCorrect && <XCircle size={16} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
