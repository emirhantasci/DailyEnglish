const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryDefinition {
  definition: string;
  example?: string;
}

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: DictionaryPhonetic[];
  meanings: DictionaryMeaning[];
}

const cache = new Map<string, DictionaryEntry | null>();

export async function fetchWordData(word: string): Promise<DictionaryEntry | null> {
  const key = word.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(key)}`);
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = await res.json();
    const entry = data[0] as DictionaryEntry;
    cache.set(key, entry);
    return entry;
  } catch {
    cache.set(key, null);
    return null;
  }
}

export function getAudioUrl(entry: DictionaryEntry): string | null {
  const phonetic = entry.phonetics.find((p) => p.audio && p.audio.length > 0);
  if (!phonetic?.audio) return null;
  return phonetic.audio.startsWith('//') ? `https:${phonetic.audio}` : phonetic.audio;
}
