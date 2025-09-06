import * as React from 'react';

interface EmailTemplateProps {
  feedback: string;
}

export function EmailTemplate({ feedback }: EmailTemplateProps) {
  return (
    <div>
      <h2>New Feedback Received</h2>
      <div style={{ marginTop: '1em' }}>
        <strong>Feedback:</strong>
        <div>{feedback}</div>
      </div>
    </div>
  );
}