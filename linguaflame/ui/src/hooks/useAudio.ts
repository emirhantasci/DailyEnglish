import { useState, useCallback, useRef } from 'react';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playFromUrl = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  }, []);

  const playWithTTS = useCallback((text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const playWord = useCallback(
    async (word: string) => {
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (res.ok) {
          const data = await res.json();
          const audioUrl = data?.[0]?.phonetics?.find((p: { audio?: string }) => p.audio)?.audio;
          if (audioUrl) {
            playFromUrl(audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl);
            return;
          }
        }
      } catch {
        // fallback to TTS
      }
      playWithTTS(word);
    },
    [playFromUrl, playWithTTS],
  );

  const stop = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  return { isPlaying, playWord, playFromUrl, playWithTTS, stop };
}
