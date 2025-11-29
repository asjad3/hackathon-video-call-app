import { useEffect, useRef, useState } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

/**
 * Deepgram Speech Recognition Hook
 * Works in the browser without microphone conflicts!
 * 
 * Get your free API key: https://deepgram.com/ ($200 free credit)
 */
export const useDeepgramSpeech = (userId, roomId, socketRef, apiKey, isEnabled = true) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  
  const deepgramRef = useRef(null);
  const connectionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isEnabled || !userId || !roomId || !socketRef.current) {
      console.log('⏸️ Deepgram paused:', { isEnabled, userId, roomId, hasSocket: !!socketRef.current });
      return;
    }

    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ Deepgram API key is missing!');
      setError('API key required - Get free key at https://deepgram.com');
      return;
    }

    let isMounted = true;

    const startDeepgram = async () => {
      try {
        console.log('🎤 Starting Deepgram speech recognition...');
        console.log('🎤 Requesting microphone access with high priority...');

        // Get microphone access FIRST (this is critical!)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000, // Optimal for speech recognition
          }
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        console.log('✅ Microphone access granted to Deepgram');
        streamRef.current = stream;

        // Initialize Deepgram client AFTER getting mic access
        const deepgram = createClient(apiKey);
        deepgramRef.current = deepgram;

        // Create live transcription connection
        const connection = deepgram.listen.live({
          model: 'nova-2',
          language: 'en',
          smart_format: true,
          punctuate: true,
          interim_results: true,
        });

        connectionRef.current = connection;

        // Handle connection open
        connection.on(LiveTranscriptionEvents.Open, () => {
          console.log('✅ Deepgram connection opened');
          setIsListening(true);

          // Create MediaRecorder to send audio to Deepgram
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm',
          });

          mediaRecorderRef.current = mediaRecorder;

          // Send audio data to Deepgram
          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0 && connection.getReadyState() === 1) {
              connection.send(event.data);
            }
          });

          // Start recording
          mediaRecorder.start(250); // Send data every 250ms for real-time
          console.log('🎤 Started sending audio to Deepgram');
        });

        // Handle transcription results
        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const transcript = data.channel.alternatives[0].transcript;
          const isFinal = data.is_final;

          if (transcript && transcript.trim()) {
            console.log(`📝 ${isFinal ? 'Final' : 'Interim'}: "${transcript}"`);
            
            setTranscript(transcript);

            // Send to socket
            if (socketRef.current) {
              socketRef.current.emit('speechChunk', {
                userId,
                roomId,
                text: transcript,
                isFinal
              });
            }
          }
        });

        // Handle errors
        connection.on(LiveTranscriptionEvents.Error, (error) => {
          console.error('❌ Deepgram error:', error);
          setError(error.message || 'Deepgram error');
          
          // If microphone is taken by another app, try to restart
          if (error.message && error.message.includes('microphone')) {
            console.log('⚠️ Microphone conflict detected, will retry...');
          }
        });

        // Handle connection close
        connection.on(LiveTranscriptionEvents.Close, () => {
          console.log('🔌 Deepgram connection closed');
          setIsListening(false);
          
          // Auto-restart after 2 seconds if still enabled
          if (isEnabled && isMounted) {
            console.log('🔄 Auto-restarting Deepgram in 2 seconds...');
            setTimeout(() => {
              if (isMounted && isEnabled) {
                console.log('🔄 Attempting to restart Deepgram...');
                startDeepgram();
              }
            }, 2000);
          }
        });

      } catch (err) {
        console.error('❌ Failed to start Deepgram:', err);
        setError(err.message);
        setIsListening(false);
      }
    };

    startDeepgram();

    // Cleanup
    return () => {
      isMounted = false;
      
      console.log('🧹 Cleaning up Deepgram...');

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (connectionRef.current) {
        connectionRef.current.finish();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsListening(false);
    };
  }, [userId, roomId, socketRef, apiKey, isEnabled]);

  return { isListening, error, transcript };
};

