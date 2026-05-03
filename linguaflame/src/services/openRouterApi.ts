import { OPENROUTER_API_KEY, OPENROUTER_BASE_URL, FREE_MODEL } from '@/utils/constants';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LinguaFlame',
      },
      body: JSON.stringify({
        model: FREE_MODEL,
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (e) {
    console.warn('AI unavailable:', e);
    return '';
  }
}

// ---------- Local fallback sentence scoring ----------

function getWordVariations(word: string): string[] {
  const w = word.toLowerCase();
  const variations = [w];

  if (w.endsWith('e')) {
    variations.push(w + 'd', w + 's', w.slice(0, -1) + 'ing');
  } else if (w.endsWith('y')) {
    variations.push(w.slice(0, -1) + 'ied', w.slice(0, -1) + 'ies', w + 'ing');
  } else {
    variations.push(w + 'ed', w + 's', w + 'ing', w + w.slice(-1) + 'ed', w + w.slice(-1) + 'ing');
  }

  const irregulars: Record<string, string[]> = {
    come: ['came', 'coming', 'comes'], go: ['went', 'gone', 'goes', 'going'],
    get: ['got', 'gotten', 'gets', 'getting'], take: ['took', 'taken', 'takes', 'taking'],
    make: ['made', 'makes', 'making'], give: ['gave', 'given', 'gives', 'giving'],
    find: ['found', 'finds', 'finding'], know: ['knew', 'known', 'knows', 'knowing'],
    think: ['thought', 'thinks', 'thinking'], see: ['saw', 'seen', 'sees', 'seeing'],
    put: ['puts', 'putting'], run: ['ran', 'runs', 'running'],
    break: ['broke', 'broken', 'breaks', 'breaking'], fall: ['fell', 'fallen', 'falls', 'falling'],
    feel: ['felt', 'feels', 'feeling'], keep: ['kept', 'keeps', 'keeping'],
    leave: ['left', 'leaves', 'leaving'], stand: ['stood', 'stands', 'standing'],
    bring: ['brought', 'brings', 'bringing'], hold: ['held', 'holds', 'holding'],
    write: ['wrote', 'written', 'writes', 'writing'], grow: ['grew', 'grown', 'grows', 'growing'],
    show: ['showed', 'shown', 'shows', 'showing'], carry: ['carried', 'carries', 'carrying'],
    set: ['sets', 'setting'], turn: ['turned', 'turns', 'turning'],
    look: ['looked', 'looks', 'looking'], cut: ['cuts', 'cutting'],
  };
  if (irregulars[w]) variations.push(...irregulars[w]);
  return variations;
}

function containsWord(sentence: string, word: string): boolean {
  const lower = sentence.toLowerCase();
  const variations = getWordVariations(word);
  return variations.some(v => {
    const regex = new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });
}

export function scoreSentenceLocal(word: string, sentence: string): { score: number; feedback: string; usedAI: boolean } {
  const trimmed = sentence.trim();
  const words = trimmed.split(/\s+/);
  const wordCount = words.length;

  const hasWord = containsWord(trimmed, word);
  const startsWithCapital = /^[A-Z]/.test(trimmed);
  const endsWithPunctuation = /[.!?]$/.test(trimmed);
  const hasMinLength = wordCount >= 5;
  const hasGoodLength = wordCount >= 8;
  const hasRepeatedWords = words.some((w, i) => i > 0 && w.toLowerCase() === words[i - 1].toLowerCase());
  const hasBasicStructure = wordCount >= 3; // at least subject-verb-object
  const isNotJustWord = trimmed.toLowerCase() !== word.toLowerCase();

  // Check for common filler/nonsense patterns
  const isNonsense = /(.)\1{4,}/.test(trimmed) || /^[^a-zA-Z]*$/.test(trimmed);
  const hasOnlyTargetWord = words.filter(w => !containsWord(w, word)).length < 2;

  let score = 0;
  const feedbackParts: string[] = [];

  if (isNonsense || !isNotJustWord) {
    return { score: 0, feedback: 'Please write a meaningful sentence.', usedAI: false };
  }

  // Word usage (40 points)
  if (hasWord) {
    score += 40;
  } else {
    feedbackParts.push(`Make sure to use the word "${word}" in your sentence.`);
  }

  // Sentence length (20 points)
  if (hasGoodLength) {
    score += 20;
  } else if (hasMinLength) {
    score += 12;
    feedbackParts.push('Try making your sentence a bit longer.');
  } else {
    score += 5;
    feedbackParts.push('Your sentence is too short. Aim for at least 5 words.');
  }

  // Grammar basics (20 points)
  if (startsWithCapital && endsWithPunctuation) {
    score += 20;
  } else {
    if (!startsWithCapital) feedbackParts.push('Start your sentence with a capital letter.');
    if (!endsWithPunctuation) feedbackParts.push('End your sentence with proper punctuation (. ! ?).');
    if (startsWithCapital || endsWithPunctuation) score += 10;
  }

  // Structure quality (20 points)
  if (hasBasicStructure && !hasOnlyTargetWord && !hasRepeatedWords) {
    score += 20;
  } else {
    if (hasRepeatedWords) feedbackParts.push('Avoid repeating the same word consecutively.');
    if (hasOnlyTargetWord) feedbackParts.push('Try adding more context around the word.');
    score += 8;
  }

  const feedback = feedbackParts.length > 0
    ? feedbackParts.join(' ')
    : score >= 80
      ? 'Great sentence!'
      : 'Good sentence!';

  return { score, feedback, usedAI: false };
}

// ---------- AI + fallback scoring ----------

export async function scoreSentence(
  word: string,
  sentence: string,
): Promise<{ score: number; feedback: string; usedAI: boolean }> {
  // Always compute local fallback first
  const fallback = scoreSentenceLocal(word, sentence);

  // If the sentence doesn't even contain the word, skip the AI call
  if (!containsWord(sentence, word)) {
    return fallback;
  }

  try {
    const response = await chatCompletion([
      {
        role: 'system',
        content: `You are an English teacher scoring sentences. Score 0-100. Reply ONLY in JSON: {"score": number, "feedback": "brief feedback in English"}`,
      },
      {
        role: 'user',
        content: `Score this sentence that should use the word "${word}": "${sentence}"`,
      },
    ]);

    if (response) {
      // Try to extract JSON from response (handle markdown code blocks too)
      const jsonMatch = response.match(/\{[\s\S]*"score"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const aiScore = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : null;
        if (aiScore !== null) {
          return {
            score: aiScore,
            feedback: parsed.feedback || fallback.feedback,
            usedAI: true,
          };
        }
      }
    }
  } catch {
    console.warn('AI scoring failed, using local fallback');
  }

  return fallback;
}
