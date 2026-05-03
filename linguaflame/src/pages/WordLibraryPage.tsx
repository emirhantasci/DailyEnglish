import { useState, useMemo } from 'react';
import { Search, Filter, Volume2, Loader2 } from 'lucide-react';
import type { Word } from '@/types';
import wordsData from '@/data/words.json';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAudio } from '@/hooks/useAudio';

interface WordLibraryPageProps {
}

export function WordLibraryPage({}: WordLibraryPageProps) {
  const allWords = wordsData as Word[];
  const { isPlaying, playWord } = useAudio();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(allWords.map((w) => w.category));
    return ['all', ...Array.from(cats).sort()];
  }, [allWords]);

  const filtered = useMemo(() => {
    return allWords.filter((w) => {
      const matchSearch =
        !search ||
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.turkishMeaning.toLowerCase().includes(search.toLowerCase()) ||
        w.definition.toLowerCase().includes(search.toLowerCase());
      const matchDiff = difficultyFilter === 'all' || w.difficulty === difficultyFilter;
      const matchCat = categoryFilter === 'all' || w.category === categoryFilter;
      return matchSearch && matchDiff && matchCat;
    });
  }, [allWords, search, difficultyFilter, categoryFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-black text-white">📚 Word Library</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors text-sm"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-surface-700 border border-surface-600 text-white text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-surface-700 border border-surface-600 text-white text-sm focus:border-brand-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} words</p>

      {/* Word grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((word) => {
          const isExpanded = expandedId === word.id;

          return (
            <Card key={word.id}>
              <button
                className="w-full text-left"
                onClick={() => setExpandedId(isExpanded ? null : word.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{word.word}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playWord(word.word);
                      }}
                      className="p-1 text-slate-400 hover:text-brand-400 transition-colors"
                    >
                      {isPlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{word.phonetic} · {word.partOfSpeech}</p>
                <div className="flex gap-1.5 mt-2">
                  <Badge
                    variant={word.difficulty === 'beginner' ? 'success' : word.difficulty === 'intermediate' ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {word.difficulty}
                  </Badge>
                  <Badge variant="default" size="sm">{word.category}</Badge>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-surface-600/30 animate-slide-up space-y-2">
                  <p className="text-slate-200">{word.definition}</p>
                  <p className="text-blue-300 font-medium">{word.turkishMeaning}</p>
                  {word.synonyms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-slate-500">Synonyms:</span>
                      {word.synonyms.map((s) => (
                        <span key={s} className="text-xs text-slate-400 bg-surface-700 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                  {word.examples.slice(0, 2).map((ex, i) => (
                    <p key={i} className="text-sm text-slate-400 italic">&ldquo;{ex.sentence}&rdquo;</p>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No words match your filters</p>
        </div>
      )}
    </div>
  );
}
