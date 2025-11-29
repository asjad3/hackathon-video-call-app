import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to capture audio from microphone and send chunks to backend
 * This solves the microphone conflict by capturing the same audio stream
 * that the video call is using
 */
export const useAudioCapture = (userId, roomId, socketRef, isEnabled = true) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (!isEnabled || !userId || !roomId) return;

    let isMounted = true;

    const startAudioCapture = async () => {
      try {
        console.log('🎤 Starting audio capture...');

        // Get audio stream from microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        audioStreamRef.current = stream;

        // Create MediaRecorder to capture audio chunks
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 128000
        });

        mediaRecorderRef.current = mediaRecorder;

        // Handle audio data
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            
            // Send audio chunk to backend for processing
            if (socketRef.current) {
              // Convert blob to base64 for transmission
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Audio = reader.result.split(',')[1];
                socketRef.current.emit('audioChunk', {
                  userId,
                  roomId,
                  audio: base64Audio,
                  timestamp: Date.now()
                });
                console.log('📤 Sent audio chunk to backend');
              };
              reader.readAsDataURL(event.data);
            }
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error('❌ MediaRecorder error:', event.error);
          setError(event.error);
        };

        mediaRecorder.onstart = () => {
          console.log('✅ Audio recording started');
          setIsRecording(true);
        };

        mediaRecorder.onstop = () => {
          console.log('⏹️ Audio recording stopped');
          setIsRecording(false);
          audioChunksRef.current = [];
        };

        // Start recording in chunks (every 2 seconds)
        mediaRecorder.start(2000);

      } catch (err) {
        console.error('❌ Failed to start audio capture:', err);
        setError(err.message);
      }
    };

    startAudioCapture();

    // Cleanup
    return () => {
      isMounted = false;
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [userId, roomId, socketRef, isEnabled]);

  return { isRecording, error };
};

