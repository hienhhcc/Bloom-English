"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseTextToSpeechReturn {
  speak: (text: string, slow?: boolean) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

function checkWebSpeechSupport(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Fallback to Web Speech API
function fallbackSpeak(
  text: string,
  slow: boolean,
  setIsSpeaking: (value: boolean) => void
): void {
  if (!checkWebSpeechSupport()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = slow ? 0.5 : 1;
  utterance.lang = "en-US";

  const voices = window.speechSynthesis.getVoices();
  const englishVoice =
    voices.find(
      (voice) => voice.lang.startsWith("en") && voice.name.includes("English")
    ) || voices.find((voice) => voice.lang.startsWith("en"));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => setIsSpeaking(false);

  window.speechSynthesis.speak(utterance);
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const puterRef = useRef<typeof import("@heyputer/puter.js").default | null>(null);

  // Load puter.js after mount
  useEffect(() => {
    setIsSupported(true); // Puter.js works in all browsers

    // Dynamically import puter.js
    import("@heyputer/puter.js").then((puterModule) => {
      puterRef.current = puterModule.default;
    }).catch((err) => {
      console.error("Failed to load puter.js:", err);
      // Fall back to Web Speech API support check
      setIsSupported(checkWebSpeechSupport());
    });
  }, []);

  const speak = useCallback(async (text: string, slow: boolean = false) => {
    // Cancel any current speech
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (checkWebSpeechSupport()) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);

    try {
      const puter = puterRef.current;
      if (!puter || !puter.ai?.txt2speech) {
        throw new Error("Puter.js not loaded");
      }

      // Use Puter.js with neural voice for better quality
      const audio = await puter.ai.txt2speech(text, {
        voice: "Joanna", // AWS Polly neural voice
        engine: "neural",
        language: "en-US",
      });

      currentAudioRef.current = audio;

      // Adjust playback rate for slow mode
      if (slow) {
        audio.playbackRate = 0.7;
      }

      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      // Fallback to Web Speech API if Puter fails
      fallbackSpeak(text, slow, setIsSpeaking);
    }
  }, []);

  const cancel = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (checkWebSpeechSupport()) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, cancel, isSpeaking, isSupported };
}
