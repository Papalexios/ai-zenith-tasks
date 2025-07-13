import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Voice transcription received:', transcript);
      onTranscription(transcript);
      toast({
        title: "Voice Transcribed",
        description: `"${transcript}"`,
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let title = "Voice Recognition Error";
      let description = "Could not process speech. Please try again.";
      
      if (event.error === 'not-allowed') {
        title = "Microphone Permission Denied";
        description = "Please allow microphone access in your browser. Click the 🔒 icon in the address bar and enable microphone permissions, then refresh the page.";
      } else if (event.error === 'no-speech') {
        title = "No Speech Detected";
        description = "Please speak clearly and try again.";
      } else if (event.error === 'network') {
        title = "Network Error";
        description = "Please check your internet connection and try again.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
        duration: 6000
      });
      
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscription]);

  const startRecording = () => {
    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try Chrome, Safari, or Edge.",
        variant: "destructive"
      });
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="lg"
      onClick={handleClick}
      disabled={disabled || !isSupported}
      className={`h-16 w-16 rounded-full transition-all duration-300 ${
        isRecording 
          ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
          : 'border-border/30 hover:border-primary/30 hover:bg-primary/5'
      }`}
      title={!isSupported ? "Speech recognition not supported in this browser" : isRecording ? "Stop recording" : "Start voice input"}
    >
      {isRecording ? (
        <Square className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};