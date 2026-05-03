import type { Word, MultipleChoiceQuestion, FillInBlankQuestion, SentenceBuilderQuestion, GrammarTopic, GrammarMCQuestion, GrammarFillQuestion, ExamQuestionWithGrammar } from '@/types';
import { EXAM_QUESTION_COUNT } from './constants';
import { scoreSentence } from '@/services/openRouterApi';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMultipleChoiceQuestions(words: Word[], allWords: Word[]): MultipleChoiceQuestion[] {
  const questions: MultipleChoiceQuestion[] = [];

  for (const word of words) {
    // Type 1: Word → Definition
    const wrongDefs = shuffle(allWords.filter(w => w.id !== word.id))
      .slice(0, 3)
      .map(w => w.definition);

    const options1 = shuffle([word.definition, ...wrongDefs]);
    questions.push({
      type: 'multiple-choice',
      id: `mc-def-${word.id}`,
      wordId: word.id,
      question: `What is the meaning of "${word.word}"?`,
      options: options1,
      correctIndex: options1.indexOf(word.definition),
      explanation: `"${word.word}" means: ${word.definition} (${word.turkishMeaning})`,
    });

    // Type 2: Definition → Word
    const wrongWords = shuffle(allWords.filter(w => w.id !== word.id))
      .slice(0, 3)
      .map(w => w.word);

    const options2 = shuffle([word.word, ...wrongWords]);
    questions.push({
      type: 'multiple-choice',
      id: `mc-word-${word.id}`,
      wordId: word.id,
      question: `Which word means "${word.turkishMeaning}"?`,
      options: options2,
      correctIndex: options2.indexOf(word.word),
      explanation: `The correct answer is "${word.word}" — ${word.definition}`,
    });
  }

  return questions;
}

function generateFillInBlankQuestions(words: Word[]): FillInBlankQuestion[] {
  const questions: FillInBlankQuestion[] = [];

  for (const word of words) {
    const examples = word.examples.filter(e => e.sentence.toLowerCase().includes(word.word.toLowerCase()));
    if (examples.length === 0) continue;

    const example = examples[Math.floor(Math.random() * examples.length)];
    const regex = new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const blanked = example.sentence.replace(regex, '_____');

    if (blanked === example.sentence) continue;

    questions.push({
      type: 'fill-in-blank',
      id: `fib-${word.id}`,
      wordId: word.id,
      sentence: blanked,
      answer: word.word.toLowerCase(),
      hint: `${word.word.charAt(0)}${'_'.repeat(word.word.length - 1)}`,
      explanation: `The correct answer is "${word.word}". Full sentence: "${example.sentence}"`,
    });
  }

  return questions;
}

function generateSentenceBuilderQuestions(words: Word[]): SentenceBuilderQuestion[] {
  return words.map(word => ({
    type: 'sentence-builder' as const,
    id: `sb-${word.id}`,
    wordId: word.id,
    targetWord: word.word,
    prompt: `Write a sentence using the word "${word.word}" (${word.turkishMeaning}).`,
    explanation: `Example: "${word.examples[0]?.sentence ?? `I learned the word ${word.word} today.`}"`,
  }));
}

export function generateExam(dailyWords: Word[], allWords: Word[], dailyGrammar?: GrammarTopic | null): ExamQuestionWithGrammar[] {
  const mcQuestions = shuffle(generateMultipleChoiceQuestions(dailyWords, allWords));
  const fibQuestions = shuffle(generateFillInBlankQuestions(dailyWords));
  const sbQuestions = shuffle(generateSentenceBuilderQuestions(dailyWords));

  // Grammar questions from today's grammar topic
  const grammarMC: GrammarMCQuestion[] = [];
  const grammarFIB: GrammarFillQuestion[] = [];
  if (dailyGrammar && dailyGrammar.examQuestions.length > 0) {
    for (const eq of dailyGrammar.examQuestions) {
      if (eq.type === 'grammar-multiple-choice' && eq.options && eq.correctIndex !== undefined) {
        grammarMC.push({
          type: 'grammar-multiple-choice',
          id: `gmc-${dailyGrammar.id}-${grammarMC.length}`,
          wordId: dailyGrammar.id,
          question: eq.question,
          options: eq.options,
          correctIndex: eq.correctIndex,
          explanation: eq.explanation,
        });
      } else if (eq.type === 'grammar-fill-blank' && eq.answer) {
        grammarFIB.push({
          type: 'grammar-fill-blank',
          id: `gfib-${dailyGrammar.id}-${grammarFIB.length}`,
          wordId: dailyGrammar.id,
          sentence: eq.question,
          answer: eq.answer,
          explanation: eq.explanation,
        });
      }
    }
  }

  const shuffledGrammarMC = shuffle(grammarMC);
  const shuffledGrammarFIB = shuffle(grammarFIB);

  // Target: 4 grammar questions (2 MC + 2 Fill) + 5 MC + 5 FIB + 6 SB = 20
  const grammarMCCount = Math.min(2, shuffledGrammarMC.length);
  const grammarFIBCount = Math.min(2, shuffledGrammarFIB.length);
  const grammarTotal = grammarMCCount + grammarFIBCount;

  const remaining = EXAM_QUESTION_COUNT - grammarTotal;
  const mcCount = Math.min(Math.ceil(remaining * 0.35), mcQuestions.length);
  const fibCount = Math.min(Math.ceil(remaining * 0.35), fibQuestions.length);
  const sbCount = Math.min(remaining - mcCount - fibCount, sbQuestions.length);

  const questions: ExamQuestionWithGrammar[] = [];
  questions.push(...shuffledGrammarMC.slice(0, grammarMCCount));
  questions.push(...shuffledGrammarFIB.slice(0, grammarFIBCount));
  questions.push(...mcQuestions.slice(0, mcCount));
  questions.push(...fibQuestions.slice(0, fibCount));
  questions.push(...sbQuestions.slice(0, sbCount));

  // Fill remaining slots with more MC if needed
  while (questions.length < EXAM_QUESTION_COUNT && mcQuestions.length > mcCount) {
    const nextIdx = questions.length - grammarTotal - fibCount - sbCount;
    if (nextIdx >= mcQuestions.length) break;
    questions.push(mcQuestions[nextIdx]);
    if (questions.length >= EXAM_QUESTION_COUNT) break;
  }

  return shuffle(questions).slice(0, EXAM_QUESTION_COUNT);
}

export function checkMultipleChoice(question: MultipleChoiceQuestion, selectedIndex: number): boolean {
  return selectedIndex === question.correctIndex;
}

export function checkFillInBlank(question: FillInBlankQuestion, userAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === question.answer.toLowerCase();
}

export function checkGrammarMC(question: GrammarMCQuestion, selectedIndex: number): boolean {
  return selectedIndex === question.correctIndex;
}

export function checkGrammarFill(question: GrammarFillQuestion, userAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === question.answer.toLowerCase();
}

export function checkSentenceBuilder(question: SentenceBuilderQuestion, userSentence: string): boolean {
  const sentence = userSentence.trim().toLowerCase();
  const word = question.targetWord.toLowerCase();

  if (sentence.length < 10) return false;

  // Direct match
  if (sentence.includes(word)) return true;

  // For phrasal verbs (e.g. "come down with"), check if all parts appear in order
  const parts = word.split(/\s+/);
  if (parts.length > 1) {
    // Check each part exists in the sentence
    const allPartsPresent = parts.every(part => {
      // Allow common verb conjugations
      const stems = getWordVariations(part);
      return stems.some(s => sentence.includes(s));
    });
    if (allPartsPresent) return true;
  }

  // Single word: check common variations
  const variations = getWordVariations(word);
  return variations.some(v => sentence.includes(v));
}

export interface SentenceCheckResult {
  isCorrect: boolean;
  feedback: string;
  usedAI: boolean;
}

export async function checkSentenceBuilderAsync(
  question: SentenceBuilderQuestion,
  userSentence: string,
): Promise<SentenceCheckResult> {
  const { score, feedback, usedAI } = await scoreSentence(question.targetWord, userSentence);
  return {
    isCorrect: score >= 60,
    feedback,
    usedAI,
  };
}

function getWordVariations(word: string): string[] {
  const variations = [word];
  // Common verb endings
  if (word.endsWith('e')) {
    variations.push(word + 'd', word + 's', word.slice(0, -1) + 'ing');
  } else if (word.endsWith('y')) {
    variations.push(word.slice(0, -1) + 'ied', word.slice(0, -1) + 'ies', word + 'ing');
  } else {
    variations.push(word + 'ed', word + 's', word + 'ing', word + word.slice(-1) + 'ed', word + word.slice(-1) + 'ing');
  }
  // Irregular common verbs
  const irregulars: Record<string, string[]> = {
    'come': ['came', 'coming', 'comes'],
    'go': ['went', 'gone', 'goes', 'going'],
    'get': ['got', 'gotten', 'gets', 'getting'],
    'take': ['took', 'taken', 'takes', 'taking'],
    'make': ['made', 'makes', 'making'],
    'give': ['gave', 'given', 'gives', 'giving'],
    'find': ['found', 'finds', 'finding'],
    'know': ['knew', 'known', 'knows', 'knowing'],
    'think': ['thought', 'thinks', 'thinking'],
    'see': ['saw', 'seen', 'sees', 'seeing'],
    'put': ['puts', 'putting'],
    'run': ['ran', 'runs', 'running'],
    'break': ['broke', 'broken', 'breaks', 'breaking'],
    'fall': ['fell', 'fallen', 'falls', 'falling'],
    'feel': ['felt', 'feels', 'feeling'],
    'keep': ['kept', 'keeps', 'keeping'],
    'leave': ['left', 'leaves', 'leaving'],
    'stand': ['stood', 'stands', 'standing'],
    'bring': ['brought', 'brings', 'bringing'],
    'set': ['sets', 'setting'],
    'turn': ['turned', 'turns', 'turning'],
    'look': ['looked', 'looks', 'looking'],
    'show': ['showed', 'shown', 'shows', 'showing'],
    'carry': ['carried', 'carries', 'carrying'],
    'hold': ['held', 'holds', 'holding'],
    'write': ['wrote', 'written', 'writes', 'writing'],
    'grow': ['grew', 'grown', 'grows', 'growing'],
    'cut': ['cuts', 'cutting'],
  };
  if (irregulars[word]) variations.push(...irregulars[word]);
  return variations;
}
