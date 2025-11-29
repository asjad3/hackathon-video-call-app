# Quick Setup Guide - Deepgram Speech Recognition

## ✅ What I Installed

I've installed **Deepgram SDK** - the best real-time speech-to-text for React!

## 🚀 Get Your FREE API Key (2 minutes)

### Step 1: Sign Up
Visit: https://deepgram.com/

### Step 2: Get $200 Free Credit
- Sign up with your email
- Confirm email
- You get $200 free credit automatically!

### Step 3: Get API Key
1. Go to: https://console.deepgram.com/
2. Click "API Keys" in sidebar
3. Click "Create New Key"
4. Copy your API key

### Step 4: Add to Your App

**Option A: Add to `.env` file (Recommended)**
```env
# hackathon-video-call-app/.env
VITE_DEEPGRAM_API_KEY=your_api_key_here
```

**Option B: Directly in code (Quick Test)**
```javascript
// In Room.jsx
const DEEPGRAM_API_KEY = 'your_api_key_here';
```

---

## 📝 Update Room.jsx

Replace the hook import:

```javascript
// OLD:
import { useClientSideSpeechRecognition } from '../hooks/useClientSideSpeechRecognition';
const { isListening, error } = useClientSideSpeechRecognition(userId, roomId, socketRef, true);

// NEW:
import { useDeepgramSpeech } from '../hooks/useDeepgramSpeech';
const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY || 'your_api_key_here';
const { isListening, error, transcript } = useDeepgramSpeech(userId, roomId, socketRef, DEEPGRAM_API_KEY, true);
```

---

## 🎯 Why Deepgram?

✅ **Works in browser** - No backend needed  
✅ **NO microphone conflicts** - Uses separate audio stream  
✅ **Real-time** - < 300ms latency  
✅ **Excellent accuracy** - Better than Web Speech API  
✅ **$200 free** = ~16,000 minutes free  
✅ **Auto-restarts** on errors  

---

## 🧪 Test It

1. Add your API key
2. Restart dev server: `npm run dev`
3. Open room
4. **Speak** - you'll see real transcripts!

---

## 💡 Alternative: AssemblyAI (Also Great!)

If you prefer AssemblyAI:

```bash
npm install assemblyai
```

Create `.env`:
```env
VITE_ASSEMBLYAI_API_KEY=your_key_here
```

Get key from: https://www.assemblyai.com/

---

## 🆘 Troubleshooting

### "API key invalid"
- Make sure you copied the full key
- Check for extra spaces
- Restart dev server after adding .env

### "Still no transcripts"
- Check browser console for errors
- Make sure mic permission is granted
- Try refreshing the page

### "Microphone conflict"
- Deepgram should NOT have conflicts
- If it does, ZegoCloud might be blocking all access
- Try starting Deepgram before ZegoCloud

---

**After adding your API key, you'll get REAL speech-to-text! 🎉**

