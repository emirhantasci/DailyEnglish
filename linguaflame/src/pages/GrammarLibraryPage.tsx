import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, BookOpen, Zap, AlertTriangle, MessageSquare, HelpCircle, Clock } from 'lucide-react';
import type { GrammarTopic } from '@/types';
import grammarData from '@/data/grammar.json';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function GrammarLibraryPage() {
  const allGrammar = grammarData as GrammarTopic[];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(allGrammar.map((g) => g.category));
    return ['all', ...Array.from(cats).sort()];
  }, [allGrammar]);

  const filtered = useMemo(() => {
    return allGrammar
      .filter((g) => {
        const matchSearch =
          !search ||
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.titleTr.toLowerCase().includes(search.toLowerCase()) ||
          g.description.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'all' || g.category === categoryFilter;
        const matchLevel = levelFilter === 'all' || g.level === levelFilter;
        return matchSearch && matchCat && matchLevel;
      })
      .sort((a, b) => a.order - b.order);
  }, [allGrammar, search, categoryFilter, levelFilter]);

  const categoryLabels: Record<string, string> = {
    tenses: 'Tenses',
    clauses: 'Clauses',
    modals: 'Modals',
    other: 'Other',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-violet-400" />
        <h1 className="text-2xl font-black text-white">Grammar Library</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grammar topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-colors text-sm"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-surface-700 border border-surface-600 text-white text-sm focus:border-violet-500 focus:outline-none"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-surface-700 border border-surface-600 text-white text-sm focus:border-violet-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : categoryLabels[c] ?? c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} topics</p>

      {/* Grammar topic cards */}
      <div className="space-y-3">
        {filtered.map((topic) => {
          const isExpanded = expandedId === topic.id;

          return (
            <Card key={topic.id}>
              <button
                className="w-full text-left"
                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{topic.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{topic.title}</h3>
                      <p className="text-sm text-slate-400">{topic.titleTr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={topic.level === 'beginner' ? 'success' : topic.level === 'intermediate' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {topic.level}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {categoryLabels[topic.category] ?? topic.category}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-2">{topic.description}</p>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-surface-600/30 animate-slide-up space-y-5">
                  {/* When to Use */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <h4 className="font-semibold text-white text-sm">When to Use</h4>
                    </div>
                    <ul className="space-y-1">
                      {topic.whenToUse.map((item, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-brand-400 mt-0.5">•</span>
                          <span dangerouslySetInnerHTML={{
                            __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-400">$1</strong>'),
                          }} />
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Structure */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-violet-400" />
                      <h4 className="font-semibold text-white text-sm">Structure</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">+ Positive</p>
                        {topic.structure.positive.split('\n').map((line, li) => (
                          <p key={li} className="text-xs text-slate-200 font-mono">{line}</p>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1">− Negative</p>
                        {topic.structure.negative.split('\n').map((line, li) => (
                          <p key={li} className="text-xs text-slate-200 font-mono">{line}</p>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1">? Question</p>
                        {topic.structure.question.split('\n').map((line, li) => (
                          <p key={li} className="text-xs text-slate-200 font-mono">{line}</p>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Structure Help — Key Terms */}
                  {topic.structureHelp && topic.structureHelp.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 text-violet-400" />
                        <h4 className="font-semibold text-white text-sm">Key Terms — Terimler</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {topic.structureHelp.map((item, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-violet-500/8 border border-violet-500/20">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span>{item.emoji}</span>
                              <span className="font-mono font-bold text-violet-300 text-xs">{item.term}</span>
                            </div>
                            <p className="text-[11px] text-slate-300">{item.meaning}</p>
                            <p className="text-[11px] text-slate-500">{item.meaningTr}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.examples.map((ex, j) => (
                                <span
                                  key={j}
                                  className="text-[10px] px-1 py-0.5 rounded bg-surface-700/80 text-slate-400"
                                  dangerouslySetInnerHTML={{
                                    __html: ex.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-400 font-semibold">$1</span>'),
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Timeline */}
                  {topic.timeline && topic.timeline.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-sky-400" />
                        <h4 className="font-semibold text-white text-sm">Timeline — Zaman Çizelgesi</h4>
                      </div>
                      <div className="relative px-2 py-4">
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-surface-600 -translate-y-1/2" />
                        <div className="relative flex items-center justify-between">
                          {topic.timeline.map((point, ti) => {
                            const isActive = !!point.description;
                            return (
                              <div key={ti} className="relative flex flex-col items-center z-10" style={{ width: '33.33%' }}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${
                                  isActive
                                    ? 'bg-sky-500 border-sky-400 shadow-lg shadow-sky-500/30 scale-110'
                                    : 'bg-surface-700 border-surface-500 opacity-50'
                                }`}>{point.emoji}</div>
                                <p className={`text-[10px] mt-1.5 text-center font-bold ${isActive ? 'text-sky-300' : 'text-slate-500'}`}>{point.label}</p>
                                <p className={`text-[9px] text-center ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>{point.labelTr}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Signal Words */}
                  {topic.signalWords.length > 0 && (
                    <section>
                      <h4 className="font-semibold text-white text-sm mb-2">🔑 Signal Words</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {topic.signalWords.map((sw) => (
                          <span
                            key={sw}
                            className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          >
                            {sw}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Examples */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                      <h4 className="font-semibold text-white text-sm">Examples</h4>
                    </div>
                    <div className="space-y-2">
                      {topic.examples.map((ex, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-surface-700/60 border border-surface-600/20">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{ex.emoji}</span>
                            <span className="text-[10px] uppercase tracking-wider text-violet-400 font-bold">{ex.label}</span>
                          </div>
                          <p
                            className="text-sm text-slate-200"
                            dangerouslySetInnerHTML={{
                              __html: ex.english.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-400 underline underline-offset-2">$1</strong>'),
                            }}
                          />
                          <p className="text-xs text-slate-400 mt-0.5">🇹🇷 {ex.turkish}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Common Mistakes */}
                  {topic.commonMistakes.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <h4 className="font-semibold text-white text-sm">Common Mistakes</h4>
                      </div>
                      <div className="space-y-2">
                        {topic.commonMistakes.map((m, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-surface-700/60 border border-surface-600/20">
                            <p className="text-sm">
                              <span className="text-red-400 line-through">{m.wrong}</span>
                            </p>
                            <p className="text-sm mt-0.5">
                              <span className="text-emerald-400 font-semibold">{m.correct}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{m.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No grammar topics match your filters</p>
        </div>
      )}
    </div>
  );
}
