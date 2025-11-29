import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io } from 'socket.io-client';
import { useDeepgramSpeech } from '../hooks/useDeepgramSpeech';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:5000';
const DEEPGRAM_API_KEY = "a14bd4e749af7ee385fc6994fb41d8d31b65413a" || ''; // Add your key here or in .env

const Room = () => {
    const { roomId } = useParams();
    const containerRef = useRef(null);
    const zpRef = useRef(null);
    const socketRef = useRef(null);
    const [userId, setUserId] = useState(null);
    const [captions, setCaptions] = useState([]);
    const [captionsEnabled, setCaptionsEnabled] = useState(true); // Auto-start enabled
    const captionsEndRef = useRef(null);
  
    // Use Deepgram speech recognition (works without conflicts!)
    const { isListening, error: speechError, transcript } = useDeepgramSpeech(
        userId, 
        roomId, 
        socketRef, 
        DEEPGRAM_API_KEY, 
        captionsEnabled // Controlled by toggle button
    );

    // Auto-scroll to latest caption
    useEffect(() => {
        if (captionsEndRef.current) {
            captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [captions]);

    // Generate userId on mount
    useEffect(() => {
        const generatedUserId = `User${Date.now()}`;
        setUserId(generatedUserId);
    }, []);

    // Initialize Socket.io connection
    useEffect(() => {
        if (!userId || !roomId) return;

        const socket = io(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('✅ Connected to socket server:', SOCKET_SERVER_URL);
            socket.emit('joinRoom', { roomId, userId });
            console.log(`📤 Joining room: ${roomId} as user: ${userId}`);
        });

        socket.on('caption', (data) => {
            console.log('📝 Received caption:', data);
            // Add caption to state for display
            setCaptions((prev) => [...prev, data].slice(-10)); // Keep last 10 captions
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from socket server');
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [userId, roomId]);

    // Initialize ZegoUIKit video call - DELAYED to let Deepgram start first
    useEffect(() => {
        const element = containerRef.current;
        if (!element || !userId) return;

        // IMPORTANT: Delay ZegoCloud to give Deepgram time to claim microphone
        console.log('⏳ Waiting 3 seconds before starting ZegoCloud to prioritize speech recognition...');
        
        const zegoTimeout = setTimeout(() => {
            console.log('🎥 Starting ZegoCloud video call now...');

            // Generate Kit Token
            const appID = 328211389;
            const serverSecret = "0d303ad2cd3e94d336c226fd5a569257";

            // Check if credentials are placeholders
            if (appID === 123456789 || serverSecret === "YOUR_SERVER_SECRET") {
                console.warn("Please replace appID and serverSecret with your own from ZegoCloud console.");
                alert("Please configure your ZegoCloud AppID and ServerSecret in src/pages/Room.jsx");
                return;
            }

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                roomId,
                Date.now().toString(),
                userId
            );

            // Create instance object from Kit Token.
            const zp = ZegoUIKitPrebuilt.create(kitToken);
            zpRef.current = zp;

            // Start the call
            zp.joinRoom({
                container: element,
                sharedLinks: [
                    {
                        name: 'Copy Link',
                        url:
                            window.location.protocol + '//' +
                            window.location.host + window.location.pathname +
                            '?roomID=' +
                            roomId,
                    },
                ],
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showScreenSharingButton: false,
                showPreJoinView: false,
                turnOnMicrophoneWhenJoining: true,
                turnOnCameraWhenJoining: true,
                showUserList: false,
                layout: "Auto",
            });
        }, 3000); // Wait 3 seconds

        // Cleanup function
        return () => {
            clearTimeout(zegoTimeout);
            if (zpRef.current) {
                zpRef.current.destroy();
            }
        };
    }, [roomId, userId]);

    return (
        <div className="relative" style={{ width: '100vw', height: '100vh' }}>
            {/* Video Call Container */}
            <div
                className="myCallContainer relative overflow-hidden bg-[var(--bg-primary)]"
                ref={containerRef}
                style={{ width: '100%', height: '100%' }}
            ></div>

            {/* Speech Recognition Status Indicator */}
            <div className="fixed top-4 left-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm space-y-1">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span>{isListening ? '🎤 Listening (Deepgram)...' : '⏸️ Initializing...'}</span>
                </div>
                <div className="text-xs text-gray-300">
                    <div>Status: {isListening ? '✅ Active' : '⏳ Starting...'}</div>
                    {speechError && <div className="text-red-400">Error: {speechError}</div>}
                    {!DEEPGRAM_API_KEY && <div className="text-yellow-400">⚠️ Add DEEPGRAM_API_KEY</div>}
                    <div className="mt-1 text-xs text-gray-400">
                        {transcript && `Live: ${transcript.slice(0, 30)}...`}
                    </div>
                </div>
            </div>

            {/* Caption Toggle Button */}
            <div className="fixed bottom-4 left-1/3 transform -translate-x-1/2 z-50">
                <button
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    className={`px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200 ${
                        captionsEnabled
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {captionsEnabled ? (
                        <>
                            <span className="inline-block mr-2">🎤</span>
                            Captions ON
                        </>
                    ) : (
                        <>
                            <span className="inline-block mr-2">🔇</span>
                            Captions OFF
                        </>
                    )}
                </button>
            </div>

            {/* Captions Display */}
            {captions.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 z-50 pointer-events-none">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto pointer-events-auto">
                            {captions.map((caption, index) => (
                                <div key={`${caption.userId}-${caption.timestamp || index}`} className="text-white">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs text-gray-400 font-semibold min-w-[60px]">
                                            {caption.userId === userId ? 'You' : caption.userId}:
                                        </span>
                                        <p className="text-sm flex-1">{caption.text}</p>
                                    </div>
                                </div>
                            ))}
                            {/* Auto-scroll target */}
                            <div ref={captionsEndRef} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;