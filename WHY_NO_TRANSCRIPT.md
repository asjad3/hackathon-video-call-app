# Why Speech Recognition Shows "Listening" But No Transcript

## The Problem: Microphone Conflict 🎤❌

Your issue is almost certainly a **microphone access conflict** between:
- **ZegoCloud video call** (captures microphone for video call)
- **Web Speech API** (tries to capture microphone for speech-to-text)

### What's Happening:
1. ✅ ZegoCloud starts first and captures the microphone
2. ✅ Speech recognition starts and sees the mic is "available" 
3. ✅ Status shows "Listening" (it thinks it's working)
4. ❌ BUT ZegoCloud has exclusive access to the mic
5. ❌ So speech recognition gets NO audio
6. ❌ Result: No transcript!

This is a **known limitation** - browsers don't allow two applications to use the same microphone simultaneously.

## How to Check (Run These in Console):

After the page loads, check the console logs:
- Look for: `🎤 Audio capture started` - If missing, mic conflict confirmed!
- Look for: `🔊 Sound detected!` - If missing, no audio is reaching speech recognition
- Look for: `❌ audio-capture` error - Direct evidence of conflict

## Solutions:

### Option 1: Use the Captions Component (Recommended ✅)
I've created `RoomWithCaptions.jsx` which uses the separate Captions component. This component:
- Has a manual start button (user starts captions when ready)
- Better manages microphone timing
- Has proven to work in your codebase

**To use it:**
```javascript
// In your router, replace Room with RoomWithCaptions
import RoomWithCaptions from './pages/RoomWithCaptions';

// Then use RoomWithCaptions instead of Room
<Route path="/room/:roomId" element={<RoomWithCaptions />} />
```

### Option 2: Start Speech Recognition BEFORE ZegoCloud
Reverse the initialization order:

```javascript
// 1. Start speech recognition FIRST (gets mic access)
SpeechRecognition.startListening({ continuous: true });

// 2. THEN start ZegoCloud (might fail or share access)
zp.joinRoom({ ... });
```

⚠️ This might cause video call issues!

### Option 3: Use Different Microphone (if available)
If user has multiple microphones, they can:
1. Use built-in mic for video call
2. Use external mic (USB/Bluetooth) for speech recognition

### Option 4: Use Backend Speech Recognition
Send audio from ZegoCloud to your backend for speech-to-text processing using:
- Google Cloud Speech-to-Text
- AWS Transcribe
- Azure Speech Services

## Immediate Test:

**Run this in your browser console RIGHT NOW to confirm the conflict:**

```javascript
// Check if audio is reaching speech recognition
const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (recognition) {
    console.log('Speech Recognition exists');
    const r = new recognition();
    r.onaudiostart = () => console.log('✅ AUDIO IS WORKING!');
    r.onaudioend = () => console.log('⚠️ Audio ended');
    r.onerror = (e) => console.error('❌ ERROR:', e.error);
    r.onresult = (e) => console.log('📝 GOT TRANSCRIPT:', e.results[0][0].transcript);
    r.start();
    console.log('Started test recognition - speak now!');
}
```

Watch for:
- ✅ `AUDIO IS WORKING!` = No conflict, something else is wrong
- ❌ `ERROR: audio-capture` = CONFIRMED CONFLICT with ZegoCloud

## Recommendation:

Use the **RoomWithCaptions** component I just created. The Captions component already works in your app (you have it in your codebase), and it handles the microphone timing better with a manual start button.

This way users can:
1. Join the call first
2. Then manually click "Start Captions" when ready
3. Speech recognition will work because the user controls when it starts

