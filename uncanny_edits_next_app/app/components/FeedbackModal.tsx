'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err?.error || 'Failed to send feedback');
      } else {
        setSent(true);
        setFeedback('');
        setTimeout(() => {
          setSent(false);
          onOpenChange(false);
        }, 1500);
      }
    } catch (e: unknown) {
      let message = 'Failed to send feedback';
      if (e instanceof Error) {
        message = e.message;
      } else if (typeof e === 'string') {
        message = e;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-md mx-auto rounded-lg my-24">
        <SheetHeader>
          <SheetTitle>Send us your feedback</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <Textarea
            placeholder="Enter your feedback here..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            disabled={loading || sent}
            rows={5}
          />
          {error && <div className="text-red-500 mt-2">{error}</div>}
          {sent && <div className="text-green-600 mt-2">Feedback sent! Thank you.</div>}
        </div>
        <SheetFooter>
          <Button
            onClick={handleSendFeedback}
            disabled={loading || sent || !feedback.trim()}
          >
            {loading ? 'Sending...' : sent ? 'Sent!' : 'Submit'}
          </Button>
          <SheetClose asChild>
            <Button variant="ghost" type="button" disabled={loading}>
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 