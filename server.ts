import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';

dotenv.config();

// Fix BigInt serialization for JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Initialize SQLite Database
const dbPath = path.resolve(process.cwd(), 'quiz.db');
const dbDir = path.dirname(dbPath);

console.log(`[DB] Initializing database at: ${dbPath}`);

// Ensure the directory is writable
try {
  fs.accessSync(dbDir, fs.constants.W_OK);
  console.log(`[DB] Directory is writable: ${dbDir}`);
} catch (err: any) {
  console.error(`[DB] Error: Directory is not writable: ${dbDir}. ${err.message}`);
  // In some environments, we might not have write access to the root, 
  // but better-sqlite3 might still work if the file exists or if it's a specific mount.
}

let db: Database.Database;
try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // Better concurrency
  console.log('[DB] Database connected successfully');
} catch (err: any) {
  console.error('[DB] Failed to connect to database:', err.message);
  process.exit(1);
}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT DEFAULT 'https://picsum.photos/seed/quiz/800/600',
    questionCount INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseId INTEGER NOT NULL,
    text TEXT NOT NULL,
    options TEXT NOT NULL,
    correctAnswer TEXT NOT NULL,
    difficulty TEXT DEFAULT 'basic',
    FOREIGN KEY (courseId) REFERENCES courses(id)
  );

  CREATE INDEX IF NOT EXISTS idx_questions_course_diff ON questions(courseId, difficulty);

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    courseId INTEGER NOT NULL,
    answers TEXT NOT NULL,
    score REAL NOT NULL,
    totalQuestions INTEGER NOT NULL,
    correctAnswers INTEGER NOT NULL,
    wrongAnswers INTEGER NOT NULL,
    correctBasic INTEGER DEFAULT 0,
    correctAdvanced INTEGER DEFAULT 0,
    violations INTEGER DEFAULT 0,
    isDisqualified BOOLEAN DEFAULT 0,
    attemptDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (courseId) REFERENCES courses(id)
  );
`);

// Migration: Add violations and isDisqualified columns if they don't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(quiz_attempts)").all() as any[];
  const hasViolations = tableInfo.some(col => col.name === 'violations');
  const hasIsDisqualified = tableInfo.some(col => col.name === 'isDisqualified');
  const hasCorrectBasic = tableInfo.some(col => col.name === 'correctBasic');
  const hasCorrectAdvanced = tableInfo.some(col => col.name === 'correctAdvanced');

  if (!hasViolations) {
    db.prepare("ALTER TABLE quiz_attempts ADD COLUMN violations INTEGER DEFAULT 0").run();
  }
  if (!hasIsDisqualified) {
    db.prepare("ALTER TABLE quiz_attempts ADD COLUMN isDisqualified BOOLEAN DEFAULT 0").run();
  }
  if (!hasCorrectBasic) {
    db.prepare("ALTER TABLE quiz_attempts ADD COLUMN correctBasic INTEGER DEFAULT 0").run();
  }
  if (!hasCorrectAdvanced) {
    db.prepare("ALTER TABLE quiz_attempts ADD COLUMN correctAdvanced INTEGER DEFAULT 0").run();
  }

  const questionTableInfo = db.prepare("PRAGMA table_info(questions)").all() as any[];
  const hasDifficulty = questionTableInfo.some(col => col.name === 'difficulty');
  if (!hasDifficulty) {
    db.prepare("ALTER TABLE questions ADD COLUMN difficulty TEXT DEFAULT 'basic'").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_questions_course_diff ON questions(courseId, difficulty)").run();
  }
} catch (err: any) {
  console.error('[DB] Migration failed:', err.message);
}

// Seed Demo Users
const seedUsers = async () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('Seeding demo users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    const insert = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    insert.run('Demo User', 'user@example.com', hashedPassword, 'user');
    insert.run('Demo Admin', 'admin@example.com', hashedPassword, 'admin');
    console.log('Demo users seeded successfully');
  }
};

const seedCourses = () => {
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
  if (courseCount.count === 0) {
    console.log('Seeding demo courses and questions...');
    const insertCourse = db.prepare('INSERT INTO courses (title, description, thumbnail) VALUES (?, ?, ?)');
    const reactId = Number(insertCourse.run('Introduction to React', 'Learn the basics of React and modern web development.', 'https://picsum.photos/seed/react/800/600').lastInsertRowid);
    const tsId = Number(insertCourse.run('Advanced TypeScript', 'Deep dive into TypeScript features and best practices.', 'https://picsum.photos/seed/typescript/800/600').lastInsertRowid);

    const insertQuestion = db.prepare('INSERT INTO questions (courseId, text, options, correctAnswer, difficulty) VALUES (?, ?, ?, ?, ?)');
    
    // React Questions
    insertQuestion.run(reactId, 'What is React?', JSON.stringify(['A library', 'A framework', 'A language', 'A database']), 'A library', 'basic');
    insertQuestion.run(reactId, 'What is JSX?', JSON.stringify(['JavaScript XML', 'JSON XML', 'Java Syntax', 'Just Syntax']), 'JavaScript XML', 'basic');
    insertQuestion.run(reactId, 'What is the virtual DOM?', JSON.stringify(['A copy of real DOM', 'A real DOM', 'A browser API', 'A CSS engine']), 'A copy of real DOM', 'advanced');
    insertQuestion.run(reactId, 'How does React handle reconciliation?', JSON.stringify(['Diffing algorithm', 'Manual updates', 'Reloading page', 'CSS transitions']), 'Diffing algorithm', 'advanced');

    // TypeScript Questions
    insertQuestion.run(tsId, 'What is TypeScript?', JSON.stringify(['Superset of JS', 'Subset of JS', 'New language', 'CSS preprocessor']), 'Superset of JS', 'basic');
    insertQuestion.run(tsId, 'Which keyword is used for interfaces?', JSON.stringify(['interface', 'type', 'class', 'struct']), 'interface', 'basic');
    insertQuestion.run(tsId, 'What are Generics?', JSON.stringify(['Reusable components', 'Global variables', 'CSS classes', 'HTML tags']), 'Reusable components', 'advanced');
    insertQuestion.run(tsId, 'What is a mapped type?', JSON.stringify(['Type from another type', 'Array of types', 'Object type', 'Function type']), 'Type from another type', 'advanced');

    // Update counts
    db.prepare('UPDATE courses SET questionCount = (SELECT COUNT(*) FROM questions WHERE courseId = ?) WHERE id = ?').run(reactId, reactId);
    db.prepare('UPDATE courses SET questionCount = (SELECT COUNT(*) FROM questions WHERE courseId = ?) WHERE id = ?').run(tsId, tsId);

    console.log('Demo data seeded successfully');
  }
};

seedUsers();
seedCourses();

app.use(cors());
app.use(express.json());

// Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'connected',
    auth: JWT_SECRET === 'fallback_secret' ? 'using_fallback' : 'configured'
  });
});

// Auth Routes
app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const insert = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const result = insert.run(name, email, hashedPassword, role || 'user');
    const userId = Number(result.lastInsertRowid);
    const token = jwt.sign({ id: userId, role: role || 'user' }, JWT_SECRET);
    res.json({ token, user: { id: userId, name, email, role: role || 'user' } });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    console.log(`Login successful for user: ${user.email}`);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    console.error('Login error:', err.message);
    res.status(400).json({ message: 'Login failed' });
  }
});

// Course Routes
app.get('/api/courses', async (req: any, res: any) => {
  const courses = db.prepare('SELECT * FROM courses').all();
  res.json(courses.map((c: any) => ({ ...c, _id: c.id.toString() })));
});

app.post('/api/courses', authenticate, isAdmin, async (req: any, res: any) => {
  try {
    const { title, description, thumbnail } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const insert = db.prepare('INSERT INTO courses (title, description, thumbnail) VALUES (?, ?, ?)');
    const result = insert.run(title, description, thumbnail || 'https://picsum.photos/seed/quiz/800/600');
    const id = Number(result.lastInsertRowid);
    res.json({ id, _id: id.toString(), title, description, thumbnail, questionCount: 0 });
  } catch (err: any) {
    console.error('Failed to create course:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/courses/:id', authenticate, isAdmin, async (req: any, res: any) => {
  const { title, description, thumbnail } = req.body;
  const update = db.prepare('UPDATE courses SET title = ?, description = ?, thumbnail = ? WHERE id = ?');
  update.run(title, description, thumbnail, req.params.id);
  res.json({ id: req.params.id, _id: req.params.id, title, description, thumbnail });
});

app.delete('/api/courses/:id', authenticate, isAdmin, async (req: any, res: any) => {
  // Delete associated questions and attempts first to maintain integrity
  db.prepare('DELETE FROM questions WHERE courseId = ?').run(req.params.id);
  db.prepare('DELETE FROM quiz_attempts WHERE courseId = ?').run(req.params.id);
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ message: 'Course deleted successfully' });
});

// Question Routes
app.get('/api/questions/all', authenticate, isAdmin, async (req: any, res: any) => {
  const questions = db.prepare(`
    SELECT q.*, c.title as courseTitle 
    FROM questions q 
    JOIN courses c ON q.courseId = c.id
  `).all();
  res.json(questions.map((q: any) => ({ 
    ...q, 
    _id: q.id.toString(), 
    courseId: { _id: q.courseId.toString(), title: q.courseTitle },
    options: JSON.parse(q.options) 
  })));
});

app.get('/api/questions/:courseId', authenticate, async (req: any, res: any) => {
  const questions = db.prepare('SELECT * FROM questions WHERE courseId = ?').all(req.params.courseId);
  res.json(questions.map((q: any) => ({ 
    ...q, 
    _id: q.id.toString(), 
    options: JSON.parse(q.options) 
  })));
});

// Adaptive Difficulty Route
app.post('/api/quiz/next-question', authenticate, async (req: any, res: any) => {
  try {
    const { courseId, lastAnswerCorrect, currentDifficulty, answeredQuestionIds } = req.body;
    
    // Adaptive logic
    let nextDifficulty: 'basic' | 'advanced' = 'basic';
    if (answeredQuestionIds.length === 0) {
      nextDifficulty = 'basic';
    } else {
      nextDifficulty = lastAnswerCorrect ? 'advanced' : 'basic';
    }

    // Find next question
    const placeholders = answeredQuestionIds.length > 0 ? `AND id NOT IN (${answeredQuestionIds.map(() => '?').join(',')})` : '';
    
    let question = db.prepare(`
      SELECT * FROM questions 
      WHERE courseId = ? AND difficulty = ? ${placeholders}
      ORDER BY RANDOM() LIMIT 1
    `).get(courseId, nextDifficulty, ...answeredQuestionIds) as any;

    // Fallback if no questions in preferred difficulty
    if (!question) {
      const otherDifficulty = nextDifficulty === 'basic' ? 'advanced' : 'basic';
      question = db.prepare(`
        SELECT * FROM questions 
        WHERE courseId = ? AND difficulty = ? ${placeholders}
        ORDER BY RANDOM() LIMIT 1
      `).get(courseId, otherDifficulty, ...answeredQuestionIds) as any;
    }

    if (!question) {
      return res.json({ endOfQuiz: true });
    }

    res.json({
      ...question,
      _id: question.id.toString(),
      options: JSON.parse(question.options)
    });
  } catch (err: any) {
    console.error('[NEXT QUESTION ERROR]', err.message);
    res.status(500).json({ message: 'Failed to get next question' });
  }
});

app.post('/api/questions', authenticate, isAdmin, async (req: any, res: any) => {
  try {
    const { courseId, text, options, correctAnswer, difficulty = 'basic' } = req.body;
    const insert = db.prepare('INSERT INTO questions (courseId, text, options, correctAnswer, difficulty) VALUES (?, ?, ?, ?, ?)');
    const result = insert.run(courseId, text, JSON.stringify(options), correctAnswer, difficulty);
    
    // Update question count in course
    db.prepare('UPDATE courses SET questionCount = (SELECT COUNT(*) FROM questions WHERE courseId = ?) WHERE id = ?').run(courseId, courseId);
    
    const id = Number(result.lastInsertRowid);
    res.json({ id, _id: id.toString(), courseId, text, options, correctAnswer });
  } catch (err: any) {
    res.status(400).json({ message: 'Failed to create question' });
  }
});

app.put('/api/questions/:id', authenticate, isAdmin, async (req: any, res: any) => {
  const { courseId, text, options, correctAnswer } = req.body;
  const update = db.prepare('UPDATE questions SET courseId = ?, text = ?, options = ?, correctAnswer = ? WHERE id = ?');
  update.run(courseId, text, JSON.stringify(options), correctAnswer, req.params.id);
  
  // Update question counts for both old and new courses if they changed
  db.prepare('UPDATE courses SET questionCount = (SELECT COUNT(*) FROM questions WHERE courseId = ?) WHERE id = ?').run(courseId, courseId);
  
  res.json({ id: req.params.id, _id: req.params.id, courseId, text, options, correctAnswer });
});

app.delete('/api/questions/:id', authenticate, isAdmin, async (req: any, res: any) => {
  const question = db.prepare('SELECT courseId FROM questions WHERE id = ?').get(req.params.id) as any;
  if (question) {
    db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE courses SET questionCount = (SELECT COUNT(*) FROM questions WHERE courseId = ?) WHERE id = ?').run(question.courseId, question.courseId);
  }
  res.json({ message: 'Question deleted' });
});

// Quiz Routes
app.post('/api/quiz/submit', authenticate, async (req: any, res: any) => {
  try {
    const { courseId, answers, violations = 0, isDisqualified = false } = req.body;
    console.log(`[QUIZ] Submission for course ${courseId} by user ${req.user.id}. Violations: ${violations}, Disqualified: ${isDisqualified}`);
    
    // Fetch all questions for this course to validate answers and calculate score
    const questions = db.prepare('SELECT * FROM questions WHERE courseId = ?').all(courseId) as any[];
    
    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions found for this course' });
    }
    
    let correctCount = 0;
    let correctBasic = 0;
    let correctAdvanced = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;

    const processedAnswers = answers.map((ans: any) => {
      const question = questions.find(q => q.id.toString() === ans.questionId);
      const isCorrect = question?.correctAnswer === ans.answer;
      
      const weight = question?.difficulty === 'advanced' ? 2 : 1;
      maxPossibleScore += weight;

      if (isCorrect) {
        correctCount++;
        totalScore += weight;
        if (question?.difficulty === 'advanced') correctAdvanced++;
        else correctBasic++;
      }
      
      return { ...ans, isCorrect, difficulty: question?.difficulty };
    });

    const score = isDisqualified ? 0 : (maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0);

    const insert = db.prepare(`
      INSERT INTO quiz_attempts (userId, courseId, answers, score, totalQuestions, correctAnswers, wrongAnswers, correctBasic, correctAdvanced, violations, isDisqualified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      req.user.id,
      courseId,
      JSON.stringify(processedAnswers),
      score,
      answers.length,
      correctCount,
      answers.length - correctCount,
      correctBasic,
      correctAdvanced,
      violations,
      isDisqualified ? 1 : 0
    );

    const id = Number(result.lastInsertRowid);
    res.json({
      id,
      _id: id.toString(),
      userId: req.user.id,
      courseId,
      answers: processedAnswers,
      score,
      totalQuestions: answers.length,
      correctAnswers: correctCount,
      wrongAnswers: answers.length - correctCount,
      correctBasic,
      correctAdvanced,
      violations,
      isDisqualified,
      attemptDate: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[QUIZ ERROR]', err.message);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

app.get('/api/quiz/results/:userId', authenticate, async (req: any, res: any) => {
  const attempts = db.prepare(`
    SELECT qa.*, c.title as courseTitle, c.description as courseDescription
    FROM quiz_attempts qa
    JOIN courses c ON qa.courseId = c.id
    WHERE qa.userId = ?
  `).all(req.params.userId);
  
  res.json(attempts.map((a: any) => ({
    ...a,
    _id: a.id.toString(),
    courseId: { _id: a.courseId.toString(), title: a.courseTitle, description: a.courseDescription },
    answers: JSON.parse(a.answers)
  })));
});

// Progress Routes
app.get('/api/progress/all', authenticate, isAdmin, async (req: any, res: any) => {
  const attempts = db.prepare(`
    SELECT qa.*, c.title as courseTitle, u.name as userName, u.email as userEmail
    FROM quiz_attempts qa
    JOIN courses c ON qa.courseId = c.id
    JOIN users u ON qa.userId = u.id
  `).all();
  
  res.json(attempts.map((a: any) => ({
    ...a,
    _id: a.id.toString(),
    userId: { id: a.userId.toString(), name: a.userName, email: a.userEmail },
    courseId: { _id: a.courseId.toString(), title: a.courseTitle },
    answers: JSON.parse(a.answers)
  })));
});

// Stats Route
app.get('/api/stats', authenticate, isAdmin, async (req: any, res: any) => {
  const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any).count;
  const totalCourses = (db.prepare("SELECT COUNT(*) as count FROM courses").get() as any).count;
  const totalQuestions = (db.prepare("SELECT COUNT(*) as count FROM questions").get() as any).count;
  const totalAttempts = (db.prepare("SELECT COUNT(*) as count FROM quiz_attempts").get() as any).count;
  res.json({ totalUsers, totalCourses, totalQuestions, totalAttempts });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[SERVER ERROR]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ message: 'Internal server error' });
});

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    console.log(`[SERVER] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.warn('[SERVER] Dist directory not found. Please run "npm run build" first.');
    app.get('*', (req, res) => {
      res.status(404).send('Frontend not built. Please run "npm run build" first.');
    });
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
