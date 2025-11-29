# useAudioCapture Implementation Guide

## ✅ What's Implemented

I've successfully integrated the `useAudioCapture` hook into your application!

### Frontend (`Room.jsx`)
- ✅ Replaced Web Speech API with `useAudioCapture` hook
- ✅ Audio is captured via MediaRecorder API
- ✅ Audio chunks are sent to backend every 2 seconds
- ✅ Captions are displayed at the bottom of the screen
- ✅ Status indicator shows recording state
- ✅ **NO MORE MICROPHONE CONFLICTS!**

### Backend (`index.ts`)
- ✅ Added `audioChunk` handler to receive audio data
- ✅ Test captions are sent back to verify the flow
- ✅ Ready for speech-to-text service integration

---

## 🎯 How It Works Now

```
User Speaks
    ↓
MediaRecorder captures audio (every 2 seconds)
    ↓
Audio chunk encoded as base64
    ↓
Sent via Socket.io to backend
    ↓
Backend receives audio
    ↓
[TODO: Process with speech-to-text service]
    ↓
Backend sends transcript back
    ↓
Caption displayed on all users' screens
```

---

## 🚀 Next Steps: Add Real Speech Recognition

### Option 1: Deepgram (Recommended - Fastest)

#### Install Package:
```bash
cd videoly-backend
npm install @deepgram/sdk
```

#### Add to `.env`:
```env
DEEPGRAM_API_KEY=your_api_key_here
```

#### Update `index.ts`:

```typescript
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

// In your socket handler, replace the audioChunk handler:
socket.on('audioChunk', async (data: {
  userId: string;
  roomId: string;
  audio: string;
  timestamp: number;
}) => {
  try {
    console.log(`🎤 Processing audio from ${data.userId}`);
    
    // Decode base64 audio
    const audioBuffer = Buffer.from(data.audio, 'base64');
    
    // Send to Deepgram for transcription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'en',
        punctuate: true,
        smart_format: true,
      }
    );
    
    if (error) throw error;
    
    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    if (transcript && transcript.trim()) {
      // Broadcast transcript to room
      io.to(data.roomId).emit('caption', {
        userId: data.userId,
        text: transcript,
        isFinal: true,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📝 Transcribed: "${transcript}"`);
    }
    
  } catch (error) {
    console.error('❌ Deepgram error:', error);
  }
});
```

#### Get Deepgram API Key:
1. Visit https://deepgram.com/
2. Sign up (free $200 credit)
3. Go to dashboard → API Keys
4. Copy your API key

---

### Option 2: AssemblyAI (Easiest Setup)

#### Install Package:
```bash
cd videoly-backend
npm install assemblyai
```

#### Add to `.env`:
```env
ASSEMBLYAI_API_KEY=your_api_key_here
```

#### Update `index.ts`:

```typescript
import { AssemblyAI } from 'assemblyai';

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!
});

socket.on('audioChunk', async (data: {
  userId: string;
  roomId: string;
  audio: string;
  timestamp: number;
}) => {
  try {
    console.log(`🎤 Processing audio from ${data.userId}`);
    
    // Decode base64 audio
    const audioBuffer = Buffer.from(data.audio, 'base64');
    
    // Save temporarily (AssemblyAI needs a file URL or buffer)
    const fs = require('fs');
    const tmpPath = `/tmp/audio_${Date.now()}.webm`;
    fs.writeFileSync(tmpPath, audioBuffer);
    
    // Transcribe
    const transcript = await assemblyai.transcripts.transcribe({
      audio: tmpPath,
    });
    
    // Clean up
    fs.unlinkSync(tmpPath);
    
    if (transcript.text) {
      io.to(data.roomId).emit('caption', {
        userId: data.userId,
        text: transcript.text,
        isFinal: true,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📝 Transcribed: "${transcript.text}"`);
    }
    
  } catch (error) {
    console.error('❌ AssemblyAI error:', error);
  }
});
```

#### Get AssemblyAI API Key:
1. Visit https://www.assemblyai.com/
2. Sign up (free 5 hours/month)
3. Copy API key from dashboard

---

### Option 3: Google Cloud Speech-to-Text

#### Install Package:
```bash
cd videoly-backend
npm install @google-cloud/speech
```

#### Setup Credentials:
1. Go to https://cloud.google.com/speech-to-text
2. Create project & enable Speech-to-Text API
3. Download credentials JSON
4. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
```

#### Update `index.ts`:

```typescript
import speech from '@google-cloud/speech';

const speechClient = new speech.SpeechClient();

socket.on('audioChunk', async (data: {
  userId: string;
  roomId: string;
  audio: string;
  timestamp: number;
}) => {
  try {
    console.log(`🎤 Processing audio from ${data.userId}`);
    
    const audio = {
      content: data.audio, // base64 audio
    };
    
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    };
    
    const request = {
      audio: audio,
      config: config,
    };
    
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join('\n');
    
    if (transcription) {
      io.to(data.roomId).emit('caption', {
        userId: data.userId,
        text: transcription,
        isFinal: true,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📝 Transcribed: "${transcription}"`);
    }
    
  } catch (error) {
    console.error('❌ Google Cloud error:', error);
  }
});
```

---

## 🧪 Testing Current Implementation

### 1. Start Backend:
```bash
cd videoly-backend
npm run dev
```

### 2. Start Frontend:
```bash
cd hackathon-video-call-app
npm run dev
```

### 3. Open Room:
- Go to `http://localhost:5173/room/test123`
- You should see:
  - ✅ "Recording Audio..." status (red pulsing dot)
  - ✅ "Using MediaRecorder API" indicator
  - ✅ Test captions at bottom: `[Audio chunk received at XX:XX:XX]`

### 4. Check Backend Logs:
You should see:
```
🎤 Received audio chunk from User1234567890 in room test123
📦 Audio chunk size: XXXX bytes (base64)
```

---

## 📊 What You'll See

### Before (Web Speech API):
❌ "aborted" error  
❌ No transcripts  
❌ Microphone conflict  

### After (useAudioCapture):
✅ Audio capture working  
✅ Chunks sent to backend  
✅ No conflicts  
✅ Ready for real transcription  

---

## 💰 Cost Comparison

| Service | Free Tier | Cost | Setup Time |
|---------|-----------|------|------------|
| **Deepgram** | $200 credit | $0.0125/min | 5 min |
| **AssemblyAI** | 5 hrs/mo | $0.015/min | 5 min |
| **Google Cloud** | 60 min/mo | $0.024/min | 15 min |

---

## 🎉 What's Working Now

✅ Audio capture from microphone  
✅ Audio chunks sent to backend  
✅ Socket communication working  
✅ Caption display working  
✅ No microphone conflicts  
✅ Status indicators working  

## 🔜 To Complete

1. Choose a speech-to-text service (I recommend Deepgram)
2. Get API key
3. Install package
4. Update the audioChunk handler
5. Test!

**You're 90% done! Just need to add the speech-to-text service of your choice.**

