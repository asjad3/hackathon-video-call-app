import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const Room = () => {
    const { roomId } = useParams();
    const containerRef = useRef(null);
    const zpRef = useRef(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

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
            "User" + Date.now()
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

        // Cleanup function
        return () => {
            if (zpRef.current) {
                zpRef.current.destroy();
            }
        };
    }, [roomId]);

    return (
        <div
            className="myCallContainer relative overflow-hidden bg-[var(--bg-primary)]"
            ref={containerRef}
            style={{ width: '100vw', height: '100vh' }}
        ></div>
    );
};

export default Room;
