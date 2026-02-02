"use client";

import { useCallback, useRef, useState } from "react";

export type SpeechRecognitionError =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "not-supported"
  | "transcription-failed"
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
      const module = await import("@heyputer/puter.js");
      puterRef.current = module.default as Puter;
    }
    return puterRef.current;
  };

  // Process audio and transcribe - called when recording stops
  const processAudio = useCallback(async (mimeType: string) => {
    setIsListening(false);
    setIsProcessing(true);
    isStartingRef.current = false;
    pendingStopRef.current = false;

    // Stop all tracks
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    // Create audio blob
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
    audioChunksRef.current = [];

    if (audioBlob.size === 0) {
      setError("no-speech");
      setIsProcessing(false);
      return;
    }

    try {
      // Transcribe with Puter.js - force English language
      const puter = await loadPuter();
      const result = await puter.ai.speech2txt(audioBlob, {
        language: "en", // Force English transcription only
      });
      const text = typeof result === "string" ? result : result.text || "";
      setTranscript(text.trim());
    } catch (err) {
      console.error("Transcription error:", err);
      setError("transcription-failed");
    } finally {
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
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        // Set up stop handler - this is called regardless of how recording stops
        mediaRecorder.onstop = () => {
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
        mediaRecorder.start(100);
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
