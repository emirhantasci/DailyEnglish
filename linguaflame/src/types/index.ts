export interface WordExample {
  context: 'movie' | 'news' | 'tweet' | 'daily' | 'ielts';
  label: string;
  sentence: string;
  source?: string;
  videoUrl?: string;
}

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  turkishMeaning: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  examples: WordExample[];
  synonyms: string[];
  audioUrl?: string;
}

export type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'sentence-builder' | 'grammar-multiple-choice' | 'grammar-fill-blank';

export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  id: string;
  wordId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FillInBlankQuestion {
  type: 'fill-in-blank';
  id: string;
  wordId: string;
  sentence: string;
  answer: string;
  hint?: string;
  explanation: string;
}

export interface SentenceBuilderQuestion {
  type: 'sentence-builder';
  id: string;
  wordId: string;
  targetWord: string;
  prompt: string;
  explanation: string;
}

export type ExamQuestion = MultipleChoiceQuestion | FillInBlankQuestion | SentenceBuilderQuestion;

export interface ExamAnswer {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  points: number;
}

export interface ExamResult {
  date: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  answers: ExamAnswer[];
  wordIds: string[];
}

export interface DailySession {
  date: string;
  wordIds: string[];
  lessonCompleted: boolean;
  examResult?: ExamResult;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  freezesUsed: number;
  lastActiveDate: string | null;
  lastFreezeDate: string | null;
  consecutiveMissedDays: number;
  history: Record<string, 'completed' | 'freeze' | 'missed'>;
}

export interface UserProgress {
  userId: string;
  displayName: string;
  streak: StreakData;
  sessions: Record<string, DailySession>;
  learnedWordIds: string[];
  completedGrammarIds?: string[];
  totalExams: number;
  totalScore: number;
  totalMaxScore?: number;
  joinedDate: string;
  lastModified?: string;
}

export interface LessonStep {
  type: 'grammar-intro' | 'grammar-structure' | 'grammar-timeline' | 'grammar-notes' | 'grammar-examples' | 'word-card' | 'meaning' | 'examples' | 'pronunciation';
  wordIndex: number;
}

// ─── Grammar Types ───

export interface GrammarExample {
  emoji: string;
  label: string;
  english: string;
  turkish: string;
}

export interface GrammarStructure {
  positive: string;
  negative: string;
  question: string;
}

export interface StructureHelpItem {
  term: string;
  emoji: string;
  meaning: string;
  meaningTr: string;
  examples: string[];
}

export interface TimelinePoint {
  position: 'left' | 'center' | 'right';
  label: string;
  labelTr: string;
  emoji: string;
  description: string;
}

export interface GrammarNote {
  icon: string;
  title: string;
  description: string;
  examples?: string[];
}

export interface GrammarTopic {
  id: string;
  title: string;
  titleTr: string;
  slug: string;
  category: 'tenses' | 'clauses' | 'modals' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  emoji: string;
  color: string;
  description: string;
  descriptionTr: string;
  whenToUse: string[];
  structure: GrammarStructure;
  structureHelp?: StructureHelpItem[];
  timeline?: TimelinePoint[];
  signalWords: string[];
  notes: GrammarNote[];
  examples: GrammarExample[];
  commonMistakes: { wrong: string; correct: string; explanation: string }[];
  examQuestions: GrammarExamQuestion[];
}

export interface GrammarExamQuestion {
  type: 'grammar-multiple-choice' | 'grammar-fill-blank';
  question: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
  explanation: string;
}

export type ExamQuestionWithGrammar = ExamQuestion | GrammarMCQuestion | GrammarFillQuestion;

export interface GrammarMCQuestion {
  type: 'grammar-multiple-choice';
  id: string;
  wordId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GrammarFillQuestion {
  type: 'grammar-fill-blank';
  id: string;
  wordId: string;
  sentence: string;
  answer: string;
  hint?: string;
  explanation: string;
}
