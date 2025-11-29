# Speech Recognition Debugging Guide

## Common Issues & Solutions

### 1. **Microphone Access Conflict**
**Problem**: ZegoCloud and Web Speech API both try to access the microphone.
**Solution**: 
- The code now waits 2 seconds before starting speech recognition
- This gives ZegoCloud time to initialize first

### 2. **Browser Compatibility**
**Supported Browsers**:
- ✅ Chrome/Chromium (Desktop & Mobile)
- ✅ Edge (Desktop)
- ✅ Safari (Desktop & iOS)
- ❌ Firefox (Not supported)

### 3. **HTTPS Requirement**
The Web Speech API **requires HTTPS** or `localhost`.
- ✅ `http://localhost:*` - Works
- ✅ `https://*` - Works
- ❌ `http://192.168.*` - Does NOT work

### 4. **Microphone Permissions**
Check browser permissions:
1. Click the lock icon in the address bar
2. Ensure "Microphone" is set to "Allow"
3. Refresh the page if you just granted permission

## Debugging Steps

### Step 1: Check Console Logs
Look for these messages in the browser console:
```
✅ Speech recognition started successfully
🎤 Listening: true
🎤 Microphone Available: true
```

### Step 2: Check Visual Indicator
The top-left status box should show:
- 🔴 Red pulsing dot when listening
- ✅ Green checkmarks for browser support and microphone

### Step 3: Test Speech
1. Speak clearly into your microphone
2. Watch the console for transcript updates
3. Check the visual indicator for "Live:" transcript

### Step 4: Check for Errors
Look for these error messages:
```
❌ Failed to start speech recognition
❌ Browser does not support speech recognition
❌ Microphone permission denied
```

## Manual Testing

### Test 1: Check Browser Support
Open console and run:
```javascript
console.log('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
// Should return: true
```

### Test 2: Check Microphone Access
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone access granted'))
  .catch(err => console.error('❌ Microphone access denied:', err));
```

### Test 3: Manually Start Recognition
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  console.log('Result:', event.results[event.results.length - 1][0].transcript);
};

recognition.onerror = (event) => {
  console.error('Error:', event.error);
};

recognition.start();
console.log('Started...');
```

## Known Issues

### Issue: "no-speech" Error
**Cause**: No speech detected for a period
**Solution**: Speak louder or closer to the microphone

### Issue: "aborted" Error
**Cause**: Another application is using the microphone
**Solution**: Close other apps using the microphone

### Issue: "not-allowed" Error
**Cause**: Microphone permission denied
**Solution**: Grant microphone permission in browser settings

### Issue: Transcript is Empty
**Causes**:
1. Microphone is muted (check ZegoCloud controls)
2. Wrong microphone selected
3. Speech too quiet
4. Background noise too loud

## Alternative: Use Captions Component

If speech recognition still doesn't work in Room.jsx, you can use the standalone Captions component instead:

```jsx
// In Room.jsx, import and use Captions
import Captions from '../components/Captions';

// Add to return statement
<Captions roomId={roomId} userId={userId} />
```

The Captions component has:
- Manual start/stop button
- Better error handling
- Visual feedback
- Translation support

## Need Help?

1. Check what browser you're using
2. Check if you're on HTTPS or localhost
3. Check browser console for errors
4. Check the visual status indicator
5. Try the manual tests above

