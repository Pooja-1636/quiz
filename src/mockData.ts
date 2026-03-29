import { User, Course, Question, QuizAttempt } from './types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
};

export const mockAdmin: User = {
  id: '2',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
};

export const mockCourses: Course[] = [
  {
    _id: 'c1',
    title: 'React Fundamentals',
    description: 'Master the basics of React including components, hooks, and state management.',
    questionCount: 10,
    duration: 15,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'c2',
    title: 'Advanced TypeScript',
    description: 'Deep dive into advanced types, generics, and utility types in TypeScript.',
    questionCount: 8,
    duration: 12,
    category: 'Programming',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'c3',
    title: 'Tailwind CSS Mastery',
    description: 'Learn how to build modern, responsive layouts with Tailwind CSS utility classes.',
    questionCount: 12,
    duration: 20,
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'c4',
    title: 'Python for Data Science',
    description: 'Learn Python libraries like Pandas, NumPy, and Matplotlib for data analysis.',
    questionCount: 15,
    duration: 25,
    category: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  }
];

export const mockQuestions: Question[] = [
  {
    _id: 'q1',
    courseId: 'c1',
    text: 'What is the purpose of the useState hook?',
    options: [
      'To perform side effects',
      'To manage state in functional components',
      'To access context',
      'To optimize performance'
    ],
    correctAnswer: 'To manage state in functional components',
    difficulty: 'basic'
  },
  {
    _id: 'q2',
    courseId: 'c1',
    text: 'Which hook is used for side effects in React?',
    options: [
      'useState',
      'useContext',
      'useEffect',
      'useReducer'
    ],
    correctAnswer: 'useEffect',
    difficulty: 'basic'
  }
];

export const mockAttempts: QuizAttempt[] = [
  {
    _id: 'a1',
    userId: '1',
    courseId: 'c1',
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    attemptDate: '2024-03-01',
    answers: []
  },
  {
    _id: 'a2',
    userId: '1',
    courseId: 'c2',
    score: 90,
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    attemptDate: '2024-03-05',
    answers: []
  }
];
