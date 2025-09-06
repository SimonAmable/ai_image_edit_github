'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Type definitions for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: {
    transcript: string;
    confidence: number;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface HybridMicrophoneButtonProps {
    onLiveTranscription: (text: string, isFinal: boolean) => void;
    onGroqTranscription: (text: string, segmentId: string) => void;
    onError: (error: string) => void;
}

export default function HybridMicrophoneButton({
    onLiveTranscription,
    onGroqTranscription,
    onError
}: HybridMicrophoneButtonProps) {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const segmentCounterRef = useRef(0);

    useEffect(() => {
        // Check if browser supports both APIs
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const hasMediaRecorder = !!window.MediaRecorder;
        const hasMediaDevices = !!navigator?.mediaDevices?.getUserMedia;

        setIsSupported(!!SpeechRecognition && hasMediaRecorder && hasMediaDevices);
    }, []);

    const startListening = async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            onError('Speech recognition not supported in this browser');
            return;
        }

        try {
            // Start audio recording for Groq
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                }
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                setIsProcessing(true);

                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                // Send to Groq for enhanced accuracy
                const segmentId = `segment_${++segmentCounterRef.current}`;

                try {
                    const formData = new FormData();
                    formData.append('audio', audioBlob, `recording_${segmentId}.${mimeType.includes('webm') ? 'webm' : 'mp4'}`);

                    const response = await fetch('/api/speech-to-text', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();

                    if (result.success) {
                        onGroqTranscription(result.text, segmentId);
                    } else {
                        onError(result.error || 'Groq transcription failed');
                    }
                } catch (error) {
                    console.error('Groq transcription error:', error);
                    onError('Enhanced transcription failed, using live version');
                } finally {
                    setIsProcessing(false);
                }

                // Clean up stream
                stream.getTracks().forEach(track => track.stop());
            };

            // Start live speech recognition
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                mediaRecorder.start(); // Start recording for Groq
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Send live results for immediate feedback
                if (interimTranscript) {
                    onLiveTranscription(interimTranscript, false);
                }

                if (finalTranscript) {
                    onLiveTranscription(finalTranscript, true);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);

                switch (event.error) {
                    case 'no-speech':
                        onError('No speech detected. Please try again.');
                        break;
                    case 'audio-capture':
                        onError('Microphone not accessible. Please check permissions.');
                        break;
                    case 'not-allowed':
                        onError('Microphone access denied. Please allow microphone access.');
                        break;
                    default:
                        onError(`Speech recognition error: ${event.error}`);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                // Stop recording when speech recognition ends
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            };

            recognition.start();
        } catch (error: unknown) {
            console.error('Failed to start hybrid recording:', error);
            const errorWithName = error as { name?: string };
            if (errorWithName.name === 'NotAllowedError') {
                onError('Microphone access denied. Please allow microphone access and try again.');
            } else if (errorWithName.name === 'NotFoundError') {
                onError('No microphone found. Please connect a microphone and try again.');
            } else {
                onError('Failed to start recording. Please check your microphone settings.');
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        setIsListening(false);
    };

    const handleClick = () => {
        if (!isSupported) {
            onError('Speech recognition or audio recording not supported in this browser');
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return (
            <Button
                disabled
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 p-0 bg-gray-100 border-gray-300 text-gray-400"
            >
                <MicOff className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <Button
                onClick={handleClick}
                disabled={isProcessing}
                variant="outline"
                size="lg"
                className={`rounded-full w-16 h-16 p-0 transition-all duration-200 ${isListening
                        ? 'bg-green-500 hover:bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/25 animate-pulse'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                    }`}
            >
                {isListening ? (
                    <MicOff className="h-6 w-6" />
                ) : (
                    <Mic className="h-6 w-6" />
                )}
            </Button>

            {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enhancing with AI...</span>
                </div>
            )}
        </div>
    );
}