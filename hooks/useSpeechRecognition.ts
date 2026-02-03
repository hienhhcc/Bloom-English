"use client";

import { useCallback, useRef, useState } from "react";

export type SpeechRecognitionError =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "not-supported"
  | "transcription-failed"
  | "non-english-detected"
  | "unknown";

interface ListeningOptions {
  maxDuration?: number; // Max recording time in ms (default: 30000)
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isProcessing: boolean; // Transcription in progress
  isSupported: boolean; // Always true (MediaRecorder widely supported)
  transcript: string;
  error: SpeechRecognitionError | null;
  startListening: (options?: ListeningOptions) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Define Puter type for dynamic import
interface PuterAI {
  speech2txt: (
    audio: Blob,
    options?: { model?: string; language?: string }
  ) => Promise<string | { text?: string }>;
}

interface Puter {
  ai: PuterAI;
}

/**
 * Detect if text contains non-English characters (CJK, Cyrillic, Arabic, etc.)
 * Returns true if the text appears to be non-English
 */
function containsNonEnglishCharacters(text: string): boolean {
  // Check for CJK (Chinese, Japanese, Korean) characters
  const cjkPattern = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
  // Check for Cyrillic characters
  const cyrillicPattern = /[\u0400-\u04ff]/;
  // Check for Arabic characters
  const arabicPattern = /[\u0600-\u06ff]/;
  // Check for Thai characters
  const thaiPattern = /[\u0e00-\u0e7f]/;
  // Check for Devanagari (Hindi) characters
  const devanagariPattern = /[\u0900-\u097f]/;

  return (
    cjkPattern.test(text) ||
    cyrillicPattern.test(text) ||
    arabicPattern.test(text) ||
    thaiPattern.test(text) ||
    devanagariPattern.test(text)
  );
}

/**
 * Remove non-English characters from text, keeping only ASCII and common punctuation
 */
function filterToEnglishOnly(text: string): string {
  // Keep only ASCII letters, numbers, spaces, and common punctuation
  return text
    .replace(/[^\x20-\x7E]/g, ' ')  // Replace non-ASCII with space
    .replace(/\s+/g, ' ')           // Collapse multiple spaces
    .trim();
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<SpeechRecognitionError | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const puterRef = useRef<Puter | null>(null);
  const isStartingRef = useRef(false);
  const pendingStopRef = useRef(false);

  // Load Puter.js on first use
  const loadPuter = async (): Promise<Puter> => {
    if (!puterRef.current) {
      console.log("Loading Puter.js...");
      const puterModule = await import("@heyputer/puter.js");
      console.log("Puter.js module loaded:", puterModule);
      puterRef.current = puterModule.default as Puter;
      console.log("Puter.js initialized:", puterRef.current);
    }
    return puterRef.current;
  };

  // Process audio and transcribe - called when recording stops
  const processAudio = useCallback(async (mimeType: string) => {
    console.log("processAudio called, mimeType:", mimeType);
    setIsListening(false);
    setIsProcessing(true);
    isStartingRef.current = false;
    pendingStopRef.current = false;

    // Stop all tracks
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    // Create audio blob
    console.log("Audio chunks count:", audioChunksRef.current.length);
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
    audioChunksRef.current = [];

    console.log("Created audio blob, size:", audioBlob.size);
    if (audioBlob.size === 0) {
      console.log("No audio data recorded");
      setError("no-speech");
      setIsProcessing(false);
      return;
    }

    try {
      // Transcribe with Puter.js
      const puter = await loadPuter();
      console.log("Sending audio to Puter.js for transcription, size:", audioBlob.size);
      const result = await puter.ai.speech2txt(audioBlob, {
        language: "en",   // Request English transcription
      });
      console.log("Puter.js transcription result:", result);
      let text = typeof result === "string" ? result : result.text || "";
      text = text.trim();

      // Post-process: Check for non-English characters and filter them out
      const hadNonEnglish = containsNonEnglishCharacters(text);
      if (hadNonEnglish) {
        console.warn("Non-English characters detected in transcription:", text);
        // Filter to English-only characters
        text = filterToEnglishOnly(text);
        console.log("Filtered transcription:", text);
      }

      // If after filtering we have no meaningful text
      if (!text || text.length < 2) {
        // Use specific error if we filtered out non-English
        setError(hadNonEnglish ? "non-english-detected" : "no-speech");
      } else {
        setTranscript(text);
      }
    } catch (err) {
      console.error("Transcription error:", err);
      // Log more details about the error
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      setError("transcription-failed");
    } finally {
      console.log("processAudio completed");
      setIsProcessing(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    // Mark that we want to stop
    pendingStopRef.current = true;

    // Clear max duration timeout
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }

    // Stop the media recorder if it's recording
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startListening = useCallback(
    async (options: ListeningOptions = {}) => {
      // Prevent starting if already starting, listening, or processing
      if (isStartingRef.current || isListening || isProcessing) {
        return;
      }

      isStartingRef.current = true;
      pendingStopRef.current = false;
      setError(null);
      setTranscript("");
      audioChunksRef.current = [];

      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Check if user requested stop while we were waiting for microphone
        if (pendingStopRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          isStartingRef.current = false;
          pendingStopRef.current = false;
          return;
        }

        streamRef.current = stream;

        // Create MediaRecorder with best supported format
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/wav";

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        // Set up data handler
        mediaRecorder.ondataavailable = (event) => {
          console.log("ondataavailable, data size:", event.data.size);
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        // Set up stop handler - this is called regardless of how recording stops
        mediaRecorder.onstop = () => {
          console.log("mediaRecorder.onstop called");
          // Clear timeout if it exists
          if (maxDurationTimeoutRef.current) {
            clearTimeout(maxDurationTimeoutRef.current);
            maxDurationTimeoutRef.current = null;
          }
          mediaRecorderRef.current = null;
          // Process the audio
          processAudio(mimeType);
        };

        // Start recording - collect data every 100ms
        console.log("Starting MediaRecorder with mimeType:", mimeType);
        mediaRecorder.start(100);
        console.log("MediaRecorder started, state:", mediaRecorder.state);
        setIsListening(true);
        isStartingRef.current = false;

        // Check again if user requested stop while we were setting up
        if (pendingStopRef.current) {
          mediaRecorder.stop();
          return;
        }

        // Auto-stop after maxDuration (default 30 seconds)
        const maxDuration = options.maxDuration ?? 30000;
        maxDurationTimeoutRef.current = setTimeout(() => {
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }, maxDuration);
      } catch (err) {
        isStartingRef.current = false;
        pendingStopRef.current = false;
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            setError("not-allowed");
          } else if (err.name === "NotFoundError") {
            setError("audio-capture");
          } else {
            setError("unknown");
          }
        } else {
          setError("unknown");
        }
      }
    },
    [isListening, isProcessing, processAudio]
  );

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    isProcessing,
    isSupported: true, // MediaRecorder is widely supported
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
