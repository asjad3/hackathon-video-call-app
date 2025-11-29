import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to capture audio from microphone using Web Speech API for recognition
 * This version uses the browser's built-in speech recognition on captured audio
 */
export const useClientSideSpeechRecognition = (userId, roomId, socketRef, isEnabled = true) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isEnabled || !userId || !roomId || !socketRef.current) return;

    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      console.error('❌ Web Speech API not supported');
      return;
    }

    console.log('🎤 Initializing Web Speech Recognition...');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('✅ Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;

        console.log(`🎤 ${isFinal ? 'Final' : 'Interim'}: "${transcript}"`);

        // Send transcript via socket
        if (socketRef.current && transcript.trim()) {
          socketRef.current.emit('speechChunk', {
            userId,
            roomId,
            text: transcript,
            isFinal
          });
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setError(event.error);
      
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied');
      } else if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected, continuing...');
      } else if (event.error === 'aborted') {
        console.log('⚠️ Recognition aborted, restarting...');
        // Try to restart
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart:', e);
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('⏹️ Speech recognition ended');
      setIsListening(false);
      
      // Auto-restart if still enabled
      if (isEnabled && userId && roomId) {
        console.log('🔄 Auto-restarting speech recognition...');
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart:', e);
          }
        }, 500);
      }
    };

    // Start recognition
    try {
      recognition.start();
      console.log('🎤 Starting continuous speech recognition...');
    } catch (err) {
      console.error('❌ Failed to start recognition:', err);
      setError(err.message);
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('🛑 Stopped speech recognition');
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [userId, roomId, socketRef, isEnabled]);

  return { isListening, error };
};

