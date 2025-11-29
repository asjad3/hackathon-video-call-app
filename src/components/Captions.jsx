import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime'
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:5000';

const Captions = ({ roomId, userId }) => {
  const [socket, setSocket] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [translationLang, setTranslationLang] = useState('none');
  const [translatedCaptions, setTranslatedCaptions] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const socketRef = useRef(null);
  const lastFinalTranscriptRef = useRef('');

  // Use react-speech-recognition hook
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    console.log('🎤 Listening:', listening);
    console.log('🎤 Transcript:', transcript);
    console.log('🎤 Interim Transcript:', interimTranscript);
    console.log('🎤 Final Transcript:', finalTranscript);
    console.log('🎤 Browser Supports Speech Recognition:', browserSupportsSpeechRecognition);
  }, [listening, transcript, interimTranscript, finalTranscript]);

  // Handle speech recognition results and send to socket
  useEffect(() => {
    // Send final transcript when it changes
    if (finalTranscript && finalTranscript !== lastFinalTranscriptRef.current && socketRef.current) {
      const newText = finalTranscript.slice(lastFinalTranscriptRef.current.length).trim();
      if (newText) {
        console.log('📤 Sending final caption:', newText);
        socketRef.current.emit('speechChunk', {
          userId,
          roomId,
          text: newText,
          isFinal: true
        });
        lastFinalTranscriptRef.current = finalTranscript;
      }
    }
  }, [finalTranscript, userId, roomId]);

  // Send interim results for real-time preview
  useEffect(() => {
    if (interimTranscript.trim() && socketRef.current && listening) {
      socketRef.current.emit('speechChunk', {
        userId,
        roomId,
        text: interimTranscript.trim(),
        isFinal: false
      });
    }
  }, [interimTranscript, userId, roomId, listening]);

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to socket server:', SOCKET_SERVER_URL);
      setIsConnected(true);
      newSocket.emit('joinRoom', { roomId, userId });
      console.log(`📤 Joining room: ${roomId} as user: ${userId}`);
    });

    newSocket.on('userJoined', (data) => {
      console.log('👤 Another user joined the room:', data);
      setRoomJoined(true);
    });

    newSocket.on('caption', (data) => {
      console.log('📝 Received caption:', data);
      setCaptions((prev) => {
        const newCaptions = [...prev];
        // Update interim results or add final results
        if (!data.isFinal) {
          // Replace last interim result if exists
          const lastIndex = newCaptions.length - 1;
          if (lastIndex >= 0 && !newCaptions[lastIndex].isFinal) {
            newCaptions[lastIndex] = data;
          } else {
            newCaptions.push(data);
          }
        } else {
          // Remove interim result and add final
          const filtered = newCaptions.filter(c => c.isFinal || c.userId !== data.userId);
          filtered.push(data);
          return filtered;
        }
        return newCaptions;
      });

      // Translate if translation is enabled
      if (translationLang !== 'none' && data.isFinal) {
        translateText(data.text, data.userId, data.timestamp);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
      setIsConnected(false);
      setRoomJoined(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, userId]);

  // Translation function (using a free API - you can replace with your preferred service)
  const translateText = async (text, userId, timestamp) => {
    try {
      // Using MyMemory Translation API (free, no key required)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${translationLang}`
      );
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        setTranslatedCaptions((prev) => ({
          ...prev,
          [`${userId}-${timestamp}`]: data.responseData.translatedText
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Check browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/70 backdrop-blur-sm rounded-lg p-4 pointer-events-auto">
            <p className="text-white text-sm text-center">
              Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
      lastFinalTranscriptRef.current = '';
      console.log('🎤 Stopped listening');
    } else {
      SpeechRecognition.startListening({ 
        continuous: true, 
        // language: 'en-US',
        // interimResults: true 
      });
      console.log('🎤 Started listening');
    }
  };

  const languages = [
    { code: 'none', name: 'No Translation' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <div className="max-w-4xl mx-auto">
        {/* Controls */}
        <div className="flex gap-2 mb-2 pointer-events-auto items-center">
          <Button
            onClick={toggleListening}
            variant={listening ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
            disabled={!isConnected}
          >
            {listening ? (
              <>
                <Mic className="w-4 h-4" />
                Listening...
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4" />
                Start Captions
              </>
            )}
          </Button>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
      
          <select
            value={translationLang}
            onChange={(e) => setTranslationLang(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm pointer-events-auto"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Captions Display */}
        <div className="mb-8 bg-black/70 backdrop-blur-sm rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto pointer-events-auto">
          {captions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No captions yet...</p>
          ) : (
            captions.slice(-10).map((caption, index) => (
              <div key={`${caption.userId}-${caption.timestamp || index}`} className="text-white">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 font-semibold min-w-[60px]">
                    {caption.userId === userId ? 'You' : 'Other'}:
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm ${caption.isFinal ? 'text-white' : 'text-gray-300 italic'}`}>
                      {caption.text}
                    </p>
                    {translationLang !== 'none' && caption.isFinal && translatedCaptions[`${caption.userId}-${caption.timestamp}`] && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        {translatedCaptions[`${caption.userId}-${caption.timestamp}`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {transcript && (
          <div className="text-white text-sm">
            <p>Transcript: {transcript}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Captions;

