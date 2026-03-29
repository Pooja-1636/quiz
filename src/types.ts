export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  questionCount?: number;
  duration?: number;
  category?: string;
}

export interface Question {
  _id: string;
  courseId: string | Course;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'basic' | 'advanced';
}

export interface QuizAttempt {
  _id: string;
  userId: string | User;
  courseId: string | Course;
  answers: { questionId: string; answer: string; isCorrect?: boolean; difficulty?: 'basic' | 'advanced' }[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  correctBasic?: number;
  correctAdvanced?: number;
  violations?: number;
  isDisqualified?: boolean;
  attemptDate: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalQuestions: number;
  totalAttempts: number;
}
