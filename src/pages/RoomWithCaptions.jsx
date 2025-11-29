import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import Captions from '../components/Captions';

const RoomWithCaptions = () => {
    const { roomId } = useParams();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Generate a unique userId for this session
        const generatedUserId = `User${Date.now()}`;
        setUserId(generatedUserId);
    }, []);

    const myMeeting = async (element) => {
        if (!userId) return;

        // Generate Kit Token
        const appID = 328211389;
        const serverSecret = "0d303ad2cd3e94d336c226fd5a569257";

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomId,
            Date.now().toString(),
            userId
        );

        // Create instance object from Kit Token
        const zp = ZegoUIKitPrebuilt.create(kitToken);

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
    };

    return (
        <div className="relative" style={{ width: '100vw', height: '100vh' }}>
            <div
                className="myCallContainer"
                ref={myMeeting}
                style={{ width: '100%', height: '100%' }}
            ></div>

            {/* Add Captions Component - This works independently */}
            {userId && <Captions roomId={roomId} userId={userId} />}
        </div>
    );
};

export default RoomWithCaptions;

