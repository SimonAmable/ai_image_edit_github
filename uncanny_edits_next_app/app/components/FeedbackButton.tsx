'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Send Feedback
      </Button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}