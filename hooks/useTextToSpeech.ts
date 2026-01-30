'use client';

import { useCallback, useState, useEffect } from 'react';

interface UseTextToSpeechReturn {
  speak: (text: string, slow?: boolean) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

function checkSupport(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check support after mount to avoid hydration mismatch
  useEffect(() => {
    setIsSupported(checkSupport());
  }, []);

  const speak = useCallback((text: string, slow: boolean = false) => {
    if (!checkSupport()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = slow ? 0.5 : 1;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (voice) => voice.lang.startsWith('en') && voice.name.includes('English')
    ) || voices.find((voice) => voice.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (!checkSupport()) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, cancel, isSpeaking, isSupported };
}
