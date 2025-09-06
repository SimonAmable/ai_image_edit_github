'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import HybridMicrophoneButton from './HybridMicrophoneButton';

export default function SpeechToText() {
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [textSegments, setTextSegments] = useState<{ id: string, text: string, enhanced: boolean }[]>([]);

  // Check if browser supports required APIs
  useEffect(() => {
    setIsClient(true);

    const hasSpeechRecognition = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
    const isSecureContext = window.isSecureContext;

    setIsSupported(hasSpeechRecognition && isSecureContext);
  }, []);

  const handleLiveTranscription = (text: string, isFinal: boolean) => {
    if (isFinal) {
      // Add segment that will be enhanced
      const segmentId = `segment_${Date.now()}`;
      setTextSegments(prev => [...prev, { id: segmentId, text: text, enhanced: false }]);
      setInterimText(''); // Clear interim text
    } else {
      // Show interim text in real-time
      setInterimText(text);
    }
  };

  const handleGroqTranscription = (enhancedText: string, segmentId: string) => {
    // Silently replace the browser version with Groq's enhanced version
    setTextSegments(prev =>
      prev.map(segment =>
        segment.id === segmentId
          ? { ...segment, text: enhancedText, enhanced: true }
          : segment
      )
    );
  };

  const handleError = (error: string) => {
    toast.error(`Error: ${error}`);
  };

  // Combine all segments into display text
  const displayText = textSegments.map(segment => segment.text).join(' ') +
    (interimText ? (textSegments.length > 0 ? ' ' : '') + interimText : '');

  const copyToClipboard = async () => {
    if (displayText.trim()) {
      await navigator.clipboard.writeText(displayText);
      toast.success('Text copied!');
    }
  };

  const clearText = () => {
    setTextSegments([]);
    setInterimText('');
    toast.success('Text cleared!');
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center text-red-500">
          Browser not supported. Please use Chrome with HTTPS.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Microphone Button */}
      <div className="flex justify-center">
        <HybridMicrophoneButton
          onLiveTranscription={handleLiveTranscription}
          onGroqTranscription={handleGroqTranscription}
          onError={handleError}
        />
      </div>

      {/* Text Area */}
      <Textarea
        value={displayText}
        onChange={(e) => {
          // Allow editing when not actively speaking
          if (!interimText) {
            const newText = e.target.value;
            setTextSegments([{ id: 'manual', text: newText, enhanced: true }]);
          }
        }}
        placeholder="Click the microphone and start speaking..."
        className={`min-h-[200px] resize-none text-lg ${
          interimText ? 'text-gray-600 dark:text-gray-400' : ''
        }`}
      />

      {/* Action Buttons */}
      {(textSegments.length > 0 || interimText) && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearText}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}