# WebRTC Audio/Video Call Implementation Guide

## Overview
This guide explains how to implement audio/video calls using WebRTC with Pusher for signaling. The implementation uses Pusher private channels for secure WebRTC signaling, integrated with Laravel backend.

> **Note**: For Laravel-specific implementation with Pusher, see `WEBRTC_PUSHER_LARAVEL_IMPLEMENTATION.md`

## Backend Pusher Events Required

### 1. Consultation Acceptance Event (Already Exists)
**Channel**: `patient-consultation{patientID}`
**Event**: `consultation-patient`

**Payload Structure**:
```json
{
  "consultation": {
    "id": 123,
    "patientID": 62,
    "doctorID": 33,
    "type": "Audio",  // or "Video" or "Chat"
    "status": "Accepted",
    "code": "0049",
    "serviceID": 13,
    "date": "2026-01-03",
    "created_at": "2026-01-03T11:39:29.000000Z",
    "patient": {
      "id": 62,
      "name": "Patient Name",
      "image": "https://...",
      "age": "31",
      "gender": "female"
    },
    "doctor": {
      "id": 33,
      "name": "Doctor Name",
      "image": "https://...",
      "specialization": "MBBS"
    },
    "service": {
      "id": 13,
      "name": "Service Name",
      "duration": 76
    }
  }
}
```

### 2. WebRTC Signaling Events (New - Required)

**Using Pusher for Signaling (Recommended for Laravel)**
**Channels**:
- `private-webrtc-consultation{consultationID}` - Private channel for WebRTC signaling

**Events**:
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `webrtc-ice-candidate` - ICE candidate
- `webrtc-call-started` - Call initiated
- `webrtc-call-ended` - Call ended
- `webrtc-call-rejected` - Call rejected

**Pusher Event Payload Examples**:

```json
// webrtc-offer
{
  "consultationID": 123,
  "from": "doctor_33",
  "to": "patient_62",
  "offer": {
    "type": "offer",
    "sdp": "..."
  }
}

// webrtc-answer
{
  "consultationID": 123,
  "from": "patient_62",
  "to": "doctor_33",
  "answer": {
    "type": "answer",
    "sdp": "..."
  }
}

// webrtc-ice-candidate
{
  "consultationID": 123,
  "from": "doctor_33",
  "to": "patient_62",
  "candidate": {
    "candidate": "...",
    "sdpMLineIndex": 0,
    "sdpMid": "0"
  }
}

// webrtc-call-started
{
  "consultationID": 123,
  "initiator": "doctor_33",
  "type": "audio"
}

// webrtc-call-ended
{
  "consultationID": 123,
  "endedBy": "doctor_33"
}
```

## Backend Implementation Steps

### Step 1: Update Consultation Acceptance Handler
When a doctor accepts a consultation, trigger the `consultation-patient` event with the full consultation data.

### Step 2: Set Up WebRTC Signaling with Pusher

**For Laravel Backend:**
1. Install Pusher PHP SDK: `composer require pusher/pusher-php-server`
2. Configure Pusher in `.env` file
3. Create WebRTC event classes (see `WEBRTC_PUSHER_LARAVEL_IMPLEMENTATION.md`)
4. Create API endpoints for WebRTC signaling
5. Configure private channel authorization in `routes/channels.php`

**Key Points:**
- Use private channels: `private-webrtc-consultation{consultationID}`
- Implement channel authorization to verify user access
- Create API endpoints for sending offers, answers, and ICE candidates
- Broadcast events from Laravel backend

### Step 3: STUN/TURN Servers
- Configure STUN servers (Google's free STUN servers are fine for development)
- For production, set up TURN servers for NAT traversal
- Update ICE_SERVERS in `useWebRTC.ts`

## Frontend Implementation

### 1. Update Navigation Logic

**Doctor App** (`HomeScreen/index.tsx`):
- When accepting Audio/Video consultation, navigate to appropriate screen
- Pass consultation data and signaling info

**Patient App** (`usePusherNotifications.ts`):
- When receiving `consultation-patient` event with type "Audio" or "Video"
- Navigate to AudioConsultation or VideoConsultation screen
- Pass consultation data and signaling info

### 2. Audio Call Flow

1. **Patient books consultation** (type: Audio)
2. **Doctor accepts consultation**
3. **Backend triggers `consultation-patient` event**
4. **Patient receives event** → Navigate to AudioConsultation
5. **Doctor navigates to AudioConsultation** (after accepting)
6. **Both users join WebRTC room**
7. **Doctor initiates call** (creates offer)
8. **Patient receives offer** → Creates answer
9. **ICE candidates exchanged**
10. **Call connected**

## Required Backend API Endpoints

### 1. Get Signaling Server URL
```
GET /api/webrtc/signaling-server
Response: {
  "url": "wss://your-signaling-server.com",
  "token": "auth-token-if-needed"
}
```

### 2. Get STUN/TURN Configuration
```
GET /api/webrtc/ice-servers
Response: {
  "iceServers": [
    {
      "urls": ["stun:stun.l.google.com:19302"],
      "username": null,
      "credential": null
    },
    {
      "urls": ["turn:your-turn-server.com:3478"],
      "username": "username",
      "credential": "password"
    }
  ]
}
```

## Pusher Channel Structure

### Patient Side
- **Notification Channel**: `send-notification{patientID}`
  - Event: `notification-send`
- **Consultation Channel**: `patient-consultation{patientID}`
  - Event: `consultation-patient`
- **WebRTC Channel** (if using Pusher): `private-webrtc-consultation{consultationID}`
  - Events: `webrtc-offer`, `webrtc-answer`, `webrtc-ice-candidate`

### Doctor Side
- **Notification Channel**: `send-notification-doctor{doctorID}`
  - Event: `notification-send-doctor`
- **Consultation Channel**: `doctor-consultation{doctorID}`
  - Event: `consultation-doctor`
- **WebRTC Channel** (if using Pusher): `private-webrtc-consultation{consultationID}`
  - Events: `webrtc-offer`, `webrtc-answer`, `webrtc-ice-candidate`

## Testing Checklist

- [ ] Consultation booking creates proper consultation record
- [ ] Doctor acceptance triggers `consultation-patient` event
- [ ] Patient receives event and navigates to AudioConsultation
- [ ] Doctor navigates to AudioConsultation after accepting
- [ ] Both users can join WebRTC room
- [ ] Offer/Answer exchange works
- [ ] ICE candidates are exchanged
- [ ] Audio connection established
- [ ] Mute/unmute works
- [ ] Call end works for both parties
- [ ] Call duration is tracked
- [ ] Consultation status updated after call ends

## Notes

1. **Room ID**: Use `consultation_{consultationID}` as the room ID for WebRTC
2. **User ID**: Use `doctor_{doctorID}` and `patient_{patientID}` as user IDs
3. **Permissions**: Ensure microphone permissions are requested
4. **Error Handling**: Handle connection failures gracefully
5. **Call Timeout**: Implement timeout if call doesn't connect within 30 seconds
6. **Pusher Channels**: Laravel uses dots (`.`) in channel names, but Pusher converts them to dashes (`-`)
7. **Private Channels**: Always use private channels for WebRTC signaling for security
8. **Authorization**: Verify user access to consultation in channel authorization

## Laravel Implementation

For detailed Laravel backend implementation, see:
- **`WEBRTC_PUSHER_LARAVEL_IMPLEMENTATION.md`** - Complete Laravel implementation guide with code examples
