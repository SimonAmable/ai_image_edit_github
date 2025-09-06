import SpeechToText from '../components/SpeechToText';

export default function SpeechToTextPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Speech to Text</h1>
          <p className="text-lg text-muted-foreground">
            Convert your speech to text using AI-powered transcription
          </p>
        </div>
        
        <SpeechToText />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by Groq AI • Supports multiple languages • Real-time transcription</p>
        </div>
      </div>
    </div>
  );
}