import { useMemo } from 'react';
import type { Word, DailySession } from '@/types';
import wordsData from '@/data/words.json';
import { getTurkeyDateStr } from '@/utils/dateUtils';
import { DAILY_WORD_COUNT } from '@/utils/constants';

/** How many of the 5 daily words should be new (unlearned) vs review */
const NEW_WORD_TARGET = 3;
const REVIEW_WORD_TARGET = DAILY_WORD_COUNT - NEW_WORD_TARGET; // 2

/** Minimum days before a learned word can come back for review */
const MIN_REVIEW_GAP_DAYS = 3;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Returns the number of days between two YYYY-MM-DD date strings */
function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round(Math.abs(db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function useDailyWords(
  learnedWordIds: string[] = [],
  sessions: Record<string, DailySession> = {},
) {
  const allWords = wordsData as Word[];
  const today = getTurkeyDateStr();

  const dailyWords = useMemo(() => {
    const seed = dateToSeed(today);
    const rng = seededRandom(seed);

    const learnedSet = new Set(learnedWordIds);

    // ─── Build "last seen" map from sessions ───
    const lastSeenMap = new Map<string, string>(); // wordId → date
    for (const session of Object.values(sessions)) {
      for (const wid of session.wordIds) {
        const prev = lastSeenMap.get(wid);
        if (!prev || session.date > prev) {
          lastSeenMap.set(wid, session.date);
        }
      }
    }

    // ─── Split pools ───
    const unlearned = allWords.filter((w) => !learnedSet.has(w.id));

    // Review candidates: learned words that haven't been seen for MIN_REVIEW_GAP_DAYS
    const reviewCandidates = allWords
      .filter((w) => learnedSet.has(w.id))
      .map((w) => ({
        word: w,
        daysSinceSeen: lastSeenMap.has(w.id) ? daysBetween(today, lastSeenMap.get(w.id)!) : 999,
      }))
      .filter((r) => r.daysSinceSeen >= MIN_REVIEW_GAP_DAYS)
      // Sort: least recently seen first (highest days), then add seeded jitter
      .sort((a, b) => b.daysSinceSeen - a.daysSinceSeen);

    // ─── Pick new words ───
    const shuffledNew = seededShuffle(unlearned, rng);
    const newCount = Math.min(NEW_WORD_TARGET, shuffledNew.length);
    const newWords = shuffledNew.slice(0, newCount);

    // ─── Pick review words (prioritize stalest) ───
    // Add slight seeded shuffle among the top candidates for variety
    const topReviewPool = reviewCandidates.slice(0, Math.max(REVIEW_WORD_TARGET * 3, 8));
    const shuffledReview = seededShuffle(topReviewPool, rng);
    const reviewCount = Math.min(REVIEW_WORD_TARGET, shuffledReview.length);
    const reviewWords = shuffledReview.slice(0, reviewCount).map((r) => r.word);

    // ─── Fill remaining slots if either pool was short ───
    const selected = [...newWords, ...reviewWords];
    const selectedIds = new Set(selected.map((w) => w.id));

    if (selected.length < DAILY_WORD_COUNT) {
      // Try filling with more new words first
      const extraNew = shuffledNew.filter((w) => !selectedIds.has(w.id));
      for (const w of extraNew) {
        if (selected.length >= DAILY_WORD_COUNT) break;
        selected.push(w);
        selectedIds.add(w.id);
      }
    }

    if (selected.length < DAILY_WORD_COUNT) {
      // Then try more review words (even those seen more recently)
      const allReview = allWords
        .filter((w) => learnedSet.has(w.id) && !selectedIds.has(w.id))
        .map((w) => ({
          word: w,
          daysSinceSeen: lastSeenMap.has(w.id) ? daysBetween(today, lastSeenMap.get(w.id)!) : 999,
        }))
        .sort((a, b) => b.daysSinceSeen - a.daysSinceSeen);

      const shuffledExtra = seededShuffle(allReview.slice(0, 10), rng);
      for (const r of shuffledExtra) {
        if (selected.length >= DAILY_WORD_COUNT) break;
        selected.push(r.word);
        selectedIds.add(r.word.id);
      }
    }

    // Final shuffle so review and new words are mixed
    return seededShuffle(selected, rng).slice(0, DAILY_WORD_COUNT);
  }, [today, allWords, learnedWordIds, sessions]);

  return { dailyWords, allWords, today };
}
