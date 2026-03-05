'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface UseArticleAudioReturn {
  state: AudioState;
  error: string | null;
  play: () => void;
  pause: () => void;
  stop: () => void;
  download: () => void;
}

export function useArticleAudio(text: string): UseArticleAudioReturn {
  const [state, setState] = useState<AudioState>('idle');
  const [error, setError] = useState<string | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const useFallbackRef = useRef<boolean | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      audioElRef.current?.pause();
      if (utteranceRef.current) {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const fetchAudio = useCallback(async (): Promise<'api' | 'fallback'> => {
    if (audioBlobRef.current) return 'api';
    if (useFallbackRef.current === true) return 'fallback';

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const blob = await res.blob();
        audioBlobRef.current = blob;
        useFallbackRef.current = false;
        return 'api';
      }

      // Server indicated fallback (501, 502, 500)
      const body = await res.json().catch(() => ({}));
      if (body.fallback || res.status === 501) {
        useFallbackRef.current = true;
        return 'fallback';
      }

      throw new Error(body.error || `TTS request failed (${res.status})`);
    } catch (err) {
      // Network error — try fallback
      if (useFallbackRef.current === null) {
        useFallbackRef.current = true;
        return 'fallback';
      }
      throw err;
    }
  }, [text]);

  const playViaApi = useCallback(() => {
    if (!audioBlobRef.current) return;
    if (!audioElRef.current) {
      const url = URL.createObjectURL(audioBlobRef.current);
      const el = new Audio(url);
      el.addEventListener('ended', () => setState('idle'));
      el.addEventListener('error', () => {
        setState('error');
        setError('Audio playback failed');
      });
      audioElRef.current = el;
    }
    audioElRef.current.play();
    setState('playing');
  }, []);

  const playViaFallback = useCallback(() => {
    if (!window.speechSynthesis) {
      setState('error');
      setError('Text-to-speech is not supported in this browser');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => setState('idle');
    utterance.onerror = (e) => {
      if (e.error === 'canceled') return;
      setState('error');
      setError('Speech synthesis failed');
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState('playing');
  }, [text]);

  const play = useCallback(async () => {
    setError(null);
    setState('loading');
    try {
      const mode = await fetchAudio();
      if (mode === 'api') {
        playViaApi();
      } else {
        playViaFallback();
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    }
  }, [fetchAudio, playViaApi, playViaFallback]);

  const pause = useCallback(() => {
    if (audioElRef.current && state === 'playing') {
      audioElRef.current.pause();
      setState('paused');
    } else if (useFallbackRef.current && state === 'playing') {
      window.speechSynthesis?.pause();
      setState('paused');
    }
  }, [state]);

  const stop = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    setState('idle');
  }, []);

  const download = useCallback(async () => {
    setError(null);
    if (!audioBlobRef.current) {
      setState('loading');
      try {
        const mode = await fetchAudio();
        if (mode === 'fallback') {
          setError('Download is only available with cloud TTS. Set GOOGLE_TTS_API_KEY on the server.');
          setState('idle');
          return;
        }
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Failed to generate audio');
        return;
      }
      setState('idle');
    }
    if (audioBlobRef.current) {
      const url = URL.createObjectURL(audioBlobRef.current);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'article-audio.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [fetchAudio]);

  return { state, error, play, pause, stop, download };
}
