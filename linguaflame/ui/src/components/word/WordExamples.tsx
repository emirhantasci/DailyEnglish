import { useState } from 'react';
import { Film, Newspaper, AtSign, MessageCircle, GraduationCap, Play } from 'lucide-react';
import type { Word } from '@/types';
import { clsx } from 'clsx';

interface WordExamplesProps {
  word: Word;
}

const tabs = [
  { key: 'movie', label: 'Movie/TV', icon: Film, color: 'text-purple-400' },
  { key: 'news', label: 'News', icon: Newspaper, color: 'text-emerald-400' },
  { key: 'tweet', label: 'Tweet', icon: AtSign, color: 'text-sky-400' },
  { key: 'daily', label: 'Daily', icon: MessageCircle, color: 'text-brand-400' },
  { key: 'ielts', label: 'IELTS', icon: GraduationCap, color: 'text-amber-400' },
] as const;

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/shorts/')[1]?.split(/[?/]/)[0] ?? null;
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v');
    } else if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    }
    if (videoId) {
      const timeParam = parsed.searchParams.get('t');
      const timeSuffix = timeParam ? `?start=${timeParam.replace('s', '')}` : '';
      return `https://www.youtube-nocookie.com/embed/${videoId}${timeSuffix}`;
    }
  } catch { /* ignore invalid URLs */ }
  return null;
}

function isYouTubeShorts(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith('/shorts/');
  } catch { return false; }
}

export function WordExamples({ word }: WordExamplesProps) {
  // Default to first tab that has examples
  const availableTabs = tabs.filter(t => word.examples.some(e => e.context === t.key));
  const [activeTab, setActiveTab] = useState<string>(availableTabs[0]?.key ?? 'movie');

  const activeExamples = word.examples.filter((e) => e.context === activeTab);

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-300 mb-4">📚 Real-world Examples</h3>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-surface-700/50 rounded-xl mb-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const hasExamples = word.examples.some(e => e.context === tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center min-w-0 whitespace-nowrap',
                isActive ? 'bg-surface-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200',
                !hasExamples && 'opacity-40',
              )}
            >
              <Icon className={clsx('h-4 w-4 shrink-0', isActive && tab.color)} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Example cards */}
      <div className="space-y-3">
        {activeExamples.map((ex, i) => {
          const embedUrl = ex.videoUrl ? getYouTubeEmbedUrl(ex.videoUrl) : null;
          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-surface-700/50 border border-surface-600/30 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Movie context: video-only display */}
              {ex.context === 'movie' ? (
                embedUrl ? (
                  <div className={clsx(
                    'relative w-full rounded-lg overflow-hidden mx-auto',
                    ex.videoUrl && isYouTubeShorts(ex.videoUrl)
                      ? 'aspect-[9/16] max-w-[320px]'
                      : 'aspect-video'
                  )}>
                    <iframe
                      src={embedUrl}
                      title={ex.source ?? 'Video example'}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(word.word + ' ' + (ex.source || 'movie scene'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-3 aspect-video bg-surface-800/60 rounded-lg border border-surface-600/40 hover:border-brand-500/40 transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center group-hover:bg-brand-500/30 transition-colors">
                      <Play className="h-8 w-8 text-brand-400 ml-1" />
                    </div>
                    <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                      Search &ldquo;{word.word}&rdquo; on YouTube
                    </span>
                    {ex.source && <span className="text-xs text-slate-600">{ex.source}</span>}
                  </a>
                )
              ) : (
                <>
                  {/* Non-movie contexts: show text with optional video */}
                  {embedUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                      <iframe
                        src={embedUrl}
                        title={ex.source ?? 'Video example'}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}
                  <p className="text-slate-200 text-lg leading-relaxed">
                    &ldquo;{highlightWord(ex.sentence, word.word)}&rdquo;
                  </p>
                  {ex.source && <p className="text-sm text-slate-500 mt-2 italic">— {ex.source}</p>}
                </>
              )}
            </div>
          );
        })}
        {activeExamples.length === 0 && (
          <p className="text-slate-500 text-center py-4">No examples available for this category.</p>
        )}
      </div>
    </div>
  );
}

function highlightWord(sentence: string, word: string): React.ReactNode {
  const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = sentence.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-brand-400 font-bold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
