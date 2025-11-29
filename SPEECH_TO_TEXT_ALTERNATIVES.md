# Speech-to-Text Alternatives - Implementation Guide

## Problem with Current Approach
The Web Speech API (react-speech-recognition) has a **microphone conflict** with ZegoCloud. Both try to access the microphone simultaneously, causing the "aborted" error.

## Solution: Backend Processing

Instead of using the browser's speech recognition, we:
1. **Capture audio from the microphone** using MediaRecorder API
2. **Send audio chunks to the backend** via Socket.io
3. **Process audio with a cloud service** (your choice)
4. **Broadcast transcripts** back to all users

---

## 🏆 Recommended Services

### 1. **AssemblyAI** (Easiest to Start)
- ✅ Real-time streaming
- ✅ Free tier: 5 hours/month
- ✅ Excellent accuracy
- ✅ Easy API

**Setup:**
```bash
cd videoly-backend
npm install axios
```

**Get API Key:**
- Visit: https://www.assemblyai.com/
- Sign up (free)
- Get API key from dashboard

**Cost:** $0.00025 per second (~$0.015 per minute)

### 2. **Google Cloud Speech-to-Text** (Best Accuracy)
- ✅ Industry-leading accuracy
- ✅ 60 minutes free per month
- ✅ Supports 125+ languages
- ✅ Real-time streaming

**Setup:**
```bash
cd videoly-backend
npm install @google-cloud/speech
```

**Get API Key:**
- Visit: https://cloud.google.com/speech-to-text
- Create project
- Enable Speech-to-Text API
- Download credentials JSON

**Cost:** $0.024 per minute (after free tier)

### 3. **Deepgram** (Fastest Real-time)
- ✅ WebSocket-based streaming
- ✅ Lowest latency
- ✅ Free tier: $200 credit
- ✅ Best for real-time

**Setup:**
```bash
cd videoly-backend
npm install @deepgram/sdk
```

**Get API Key:**
- Visit: https://deepgram.com/
- Sign up
- Get API key

**Cost:** $0.0125 per minute

### 4. **Azure Speech Services** (Windows Integration)
- ✅ Good Windows integration
- ✅ Free tier: 5 hours/month
- ✅ Microsoft support

**Setup:**
```bash
cd videoly-backend
npm install microsoft-cognitiveservices-speech-sdk
```

### 5. **AWS Transcribe** (Enterprise)
- ✅ Enterprise-grade
- ✅ Free tier: 60 minutes/month
- ✅ AWS ecosystem integration

---

## Quick Implementation Guide

### Step 1: Choose Your Service

I recommend **AssemblyAI** for quickest start or **Deepgram** for best real-time performance.

### Step 2: Update Backend

```bash
cd videoly-backend

# For AssemblyAI
npm install axios

# OR for Deepgram
npm install @deepgram/sdk websocket

# OR for Google Cloud
npm install @google-cloud/speech
```

### Step 3: Add Environment Variables

Create/update `videoly-backend/.env`:
```env
# Choose ONE:
ASSEMBLYAI_API_KEY=your_key_here
# OR
DEEPGRAM_API_KEY=your_key_here
# OR
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### Step 4: Update Backend Code

```typescript
// videoly-backend/src/index.ts
import { initializeSpeechRecognition } from './speechRecognition';

// After Socket.io setup:
initializeSpeechRecognition(io);
```

### Step 5: Update Frontend Room.jsx

Replace the speech recognition code with:

```javascript
import { useAudioCapture } from '../hooks/useAudioCapture';

// In your Room component:
const { isRecording, error } = useAudioCapture(userId, roomId, socketRef, true);
```

---

## Complete Deepgram Example (FASTEST)

### Backend Implementation:

```typescript
// videoly-backend/src/speechRecognition.ts
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export function initializeSpeechRecognition(io: Server) {
  io.on('connection', (socket: Socket) => {
    let deepgramLive: any = null;

    socket.on('startTranscription', async (data: { roomId: string; userId: string }) => {
      // Create Deepgram live transcription connection
      deepgramLive = deepgram.listen.live({
        language: 'en',
        punctuate: true,
        smart_format: true,
        model: 'nova-2',
      });

      deepgramLive.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Deepgram connection opened');
      });

      deepgramLive.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel.alternatives[0].transcript;
        
        if (transcript && transcript.trim()) {
          // Broadcast to room
          io.to(data.roomId).emit('caption', {
            userId: data.userId,
            text: transcript,
            isFinal: data.is_final,
            timestamp: new Date().toISOString()
          });
        }
      });

      deepgramLive.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('❌ Deepgram error:', error);
      });
    });

    socket.on('audioChunk', (data: { audio: string; roomId: string; userId: string }) => {
      if (deepgramLive) {
        // Send audio to Deepgram
        const audioBuffer = Buffer.from(data.audio, 'base64');
        deepgramLive.send(audioBuffer);
      }
    });

    socket.on('disconnect', () => {
      if (deepgramLive) {
        deepgramLive.finish();
      }
    });
  });
}
```

---

## Complete AssemblyAI Example (EASIEST)

```typescript
// videoly-backend/src/speechRecognition.ts
import axios from 'axios';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const ASSEMBLYAI_TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

export function initializeSpeechRecognition(io: Server) {
  io.on('connection', (socket: Socket) => {
    
    socket.on('audioChunk', async (data: {
      userId: string;
      roomId: string;
      audio: string;
    }) => {
      try {
        // 1. Upload audio
        const audioBuffer = Buffer.from(data.audio, 'base64');
        
        const uploadResponse = await axios.post(ASSEMBLYAI_UPLOAD_URL, audioBuffer, {
          headers: {
            'authorization': ASSEMBLYAI_API_KEY,
            'content-type': 'application/octet-stream'
          }
        });
        
        // 2. Start transcription
        const transcriptResponse = await axios.post(ASSEMBLYAI_TRANSCRIPT_URL, {
          audio_url: uploadResponse.data.upload_url
        }, {
          headers: {
            'authorization': ASSEMBLYAI_API_KEY,
            'content-type': 'application/json'
          }
        });
        
        // 3. Get result (simplified - you'd poll for completion)
        const transcriptId = transcriptResponse.data.id;
        
        // Broadcast transcript
        io.to(data.roomId).emit('caption', {
          userId: data.userId,
          text: 'Processing...', // Would be actual transcript after polling
          isFinal: true,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
}
```

---

## Windows Speech API (If You Need Offline)

If you want to use Windows Speech API (no internet required):

### Requirements:
- Windows Server
- Node.js with edge-js package

```bash
npm install edge-js
```

### Implementation:

```typescript
const edge = require('edge-js');

const windowsSpeech = edge.func({
  source: `
    using System;
    using System.Speech.Recognition;
    using System.Threading.Tasks;
    
    public class Startup
    {
      public async Task<object> Invoke(string audioPath)
      {
        using (SpeechRecognitionEngine recognizer = new SpeechRecognitionEngine())
        {
          recognizer.LoadGrammar(new DictationGrammar());
          recognizer.SetInputToWaveFile(audioPath);
          
          RecognitionResult result = recognizer.Recognize();
          return result.Text;
        }
      }
    }
  `
});

// Usage:
const transcript = await windowsSpeech('path/to/audio.wav');
```

---

## Pricing Comparison

| Service | Free Tier | Cost per Minute | Real-time | Accuracy |
|---------|-----------|-----------------|-----------|----------|
| AssemblyAI | 5 hrs/mo | $0.015 | ✅ | ⭐⭐⭐⭐ |
| Deepgram | $200 credit | $0.0125 | ✅✅ | ⭐⭐⭐⭐⭐ |
| Google Cloud | 60 min/mo | $0.024 | ✅ | ⭐⭐⭐⭐⭐ |
| Azure | 5 hrs/mo | $0.024 | ✅ | ⭐⭐⭐⭐ |
| AWS | 60 min/mo | $0.024 | ✅ | ⭐⭐⭐⭐ |
| Windows API | FREE | $0 | ❌ | ⭐⭐⭐ |

---

## My Recommendation

**For Your Use Case:**

1. **Start with Deepgram** - Best real-time performance, $200 free credit
2. **Or AssemblyAI** - Easiest setup, good for testing
3. **Scale to Google Cloud** - When you need enterprise accuracy

All of these will solve your microphone conflict issue!

