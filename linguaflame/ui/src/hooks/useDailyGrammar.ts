import { useMemo } from 'react';
import type { GrammarTopic } from '@/types';
import grammarData from '@/data/grammar.json';
import { getTurkeyDateStr } from '@/utils/dateUtils';

/**
 * Weight multiplier for level — higher = more likely to appear in daily rotation.
 * Beginner topics appear less often since the user presumably knows them better.
 */
const LEVEL_WEIGHT: Record<string, number> = {
  beginner: 0.7,
  intermediate: 3,
  advanced: 5,
};

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.codePointAt(i) ?? 0;
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function useDailyGrammar(
  completedGrammarIds: string[] = [],
) {
  const allGrammar = grammarData as GrammarTopic[];
  const today = getTurkeyDateStr();

  const dailyGrammar = useMemo<GrammarTopic | null>(() => {
    const seed = dateToSeed(today);
    const rng = seededRandom(seed);
    const completedSet = new Set(completedGrammarIds);

    // Sort by order to maintain progression
    const sorted = [...allGrammar].sort((a, b) => a.order - b.order);

    // ─── Phase 1: Uncompleted topics — natural progression ───
    const uncompleted = sorted.filter((g) => !completedSet.has(g.id));
    if (uncompleted.length > 0) {
      // If user has progressed past early topics, deprioritize beginner-level ones
      const nonBeginner = uncompleted.filter((g) => g.level !== 'beginner');
      const pool = completedSet.size >= 5 && nonBeginner.length > 0 ? nonBeginner : uncompleted;

      const poolSize = Math.min(5, pool.length);
      const idx = Math.floor(rng() * poolSize);
      return pool[idx];
    }

    // ─── Phase 2: All completed — weighted selection by level + staleness ───
    // Build "last shown as grammar" map from sessions
    // We track this via grammarId stored in session, but currently sessions
    // don't store grammar ID. Use date-based rotation with weighting instead.

    // Calculate a score for each topic: higher = more likely to be picked today
    const scored = sorted.map((topic) => {
      const levelWeight = LEVEL_WEIGHT[topic.level] ?? 2;

      // Estimate last seen: check recent sessions by day offset
      // Use deterministic approach: how many days since this topic
      // was the "daily grammar" based on the same selection algorithm
      // Instead, just use level weight + seeded randomness
      const score = levelWeight * (0.5 + rng() * 0.5);
      return { topic, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored[0].topic;
  }, [today, allGrammar, completedGrammarIds]);

  return { dailyGrammar, allGrammar };
}
