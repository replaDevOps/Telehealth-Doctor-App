# WebRTC Audio/Video Call Implementation with Pusher & Laravel

## Overview
This guide explains how to implement audio/video calls using WebRTC with Pusher for signaling in a Laravel backend. The implementation uses Pusher private channels for secure WebRTC signaling.

## Architecture

```
Patient App (React Native)  ←→  Pusher Channels  ←→  Doctor App (React Native)
                                        ↑
                                        │
                                  Laravel Backend
                                  (Event Broadcasting)
```

## Laravel Backend Implementation

### 1. Install Pusher Package

```bash
composer require pusher/pusher-php-server
```

### 2. Configure Pusher in `.env`

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=c990100ab2e049d3a02a
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=ap2
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_ENCRYPTED=true
```

### 3. Configure Broadcasting in `config/broadcasting.php`

```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'host' => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER').'.pusher.com',
        'port' => env('PUSHER_PORT', 443),
        'scheme' => env('PUSHER_SCHEME', 'https'),
        'encrypted' => true,
        'useTLS' => env('PUSHER_SCHEME', 'https') === 'https',
    ],
],
```

### 4. Create WebRTC Event Classes

#### `app/Events/WebRTCOffer.php`

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WebRTCOffer implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $consultationID;
    public $from;
    public $to;
    public $offer;

    /**
     * Create a new event instance.
     */
    public function __construct($consultationID, $from, $to, $offer)
    {
        $this->consultationID = $consultationID;
        $this->from = $from;
        $this->to = $to;
        $this->offer = $offer;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('webrtc-consultation.' . $this->consultationID);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'webrtc-offer';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'consultationID' => $this->consultationID,
            'from' => $this->from,
            'to' => $this->to,
            'offer' => $this->offer,
        ];
    }
}
```

#### `app/Events/WebRTCAnswer.php`

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class WebRTCAnswer implements ShouldBroadcast
{
    public $consultationID;
    public $from;
    public $to;
    public $answer;

    public function __construct($consultationID, $from, $to, $answer)
    {
        $this->consultationID = $consultationID;
        $this->from = $from;
        $this->to = $to;
        $this->answer = $answer;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('webrtc-consultation.' . $this->consultationID);
    }

    public function broadcastAs(): string
    {
        return 'webrtc-answer';
    }

    public function broadcastWith(): array
    {
        return [
            'consultationID' => $this->consultationID,
            'from' => $this->from,
            'to' => $this->to,
            'answer' => $this->answer,
        ];
    }
}
```

#### `app/Events/WebRTCIceCandidate.php`

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class WebRTCIceCandidate implements ShouldBroadcast
{
    public $consultationID;
    public $from;
    public $to;
    public $candidate;

    public function __construct($consultationID, $from, $to, $candidate)
    {
        $this->consultationID = $consultationID;
        $this->from = $from;
        $this->to = $to;
        $this->candidate = $candidate;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('webrtc-consultation.' . $this->consultationID);
    }

    public function broadcastAs(): string
    {
        return 'webrtc-ice-candidate';
    }

    public function broadcastWith(): array
    {
        return [
            'consultationID' => $this->consultationID,
            'from' => $this->from,
            'to' => $this->to,
            'candidate' => $this->candidate,
        ];
    }
}
```

#### `app/Events/WebRTCCallStarted.php`

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class WebRTCCallStarted implements ShouldBroadcast
{
    public $consultationID;
    public $initiator;
    public $type;

    public function __construct($consultationID, $initiator, $type = 'audio')
    {
        $this->consultationID = $consultationID;
        $this->initiator = $initiator;
        $this->type = $type;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('webrtc-consultation.' . $this->consultationID);
    }

    public function broadcastAs(): string
    {
        return 'webrtc-call-started';
    }
}
```

#### `app/Events/WebRTCCallEnded.php`

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class WebRTCCallEnded implements ShouldBroadcast
{
    public $consultationID;
    public $endedBy;

    public function __construct($consultationID, $endedBy)
    {
        $this->consultationID = $consultationID;
        $this->endedBy = $endedBy;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('webrtc-consultation.' . $this->consultationID);
    }

    public function broadcastAs(): string
    {
        return 'webrtc-call-ended';
    }
}
```

### 5. Create API Controller for WebRTC Signaling

#### `app/Http/Controllers/Api/WebRTCController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Events\WebRTCOffer;
use App\Events\WebRTCAnswer;
use App\Events\WebRTCIceCandidate;
use App\Events\WebRTCCallStarted;
use App\Events\WebRTCCallEnded;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WebRTCController extends Controller
{
    /**
     * Send WebRTC offer
     */
    public function sendOffer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultationID' => 'required|integer',
            'to' => 'required|string',
            'offer' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user = Auth::user();
        $from = $user->type === 'doctor' ? "doctor_{$user->id}" : "patient_{$user->id}";

        event(new WebRTCOffer(
            $request->consultationID,
            $from,
            $request->to,
            $request->offer
        ));

        return response()->json(['success' => true]);
    }

    /**
     * Send WebRTC answer
     */
    public function sendAnswer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultationID' => 'required|integer',
            'to' => 'required|string',
            'answer' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user = Auth::user();
        $from = $user->type === 'doctor' ? "doctor_{$user->id}" : "patient_{$user->id}";

        event(new WebRTCAnswer(
            $request->consultationID,
            $from,
            $request->to,
            $request->answer
        ));

        return response()->json(['success' => true]);
    }

    /**
     * Send ICE candidate
     */
    public function sendIceCandidate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultationID' => 'required|integer',
            'to' => 'required|string',
            'candidate' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user = Auth::user();
        $from = $user->type === 'doctor' ? "doctor_{$user->id}" : "patient_{$user->id}";

        event(new WebRTCIceCandidate(
            $request->consultationID,
            $from,
            $request->to,
            $request->candidate
        ));

        return response()->json(['success' => true]);
    }

    /**
     * Start call
     */
    public function startCall(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultationID' => 'required|integer',
            'type' => 'required|string|in:audio,video',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user = Auth::user();
        $initiator = $user->type === 'doctor' ? "doctor_{$user->id}" : "patient_{$user->id}";

        event(new WebRTCCallStarted(
            $request->consultationID,
            $initiator,
            $request->type
        ));

        return response()->json(['success' => true]);
    }

    /**
     * End call
     */
    public function endCall(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultationID' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user = Auth::user();
        $endedBy = $user->type === 'doctor' ? "doctor_{$user->id}" : "patient_{$user->id}";

        event(new WebRTCCallEnded(
            $request->consultationID,
            $endedBy
        ));

        return response()->json(['success' => true]);
    }
}
```

### 6. Configure Private Channel Authorization

#### `routes/channels.php`

```php
<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('webrtc-consultation.{consultationID}', function ($user, $consultationID) {
    // Check if user is authorized to access this consultation
    $consultation = \App\Models\Consultation::find($consultationID);
    
    if (!$consultation) {
        return false;
    }

    // Allow if user is the doctor or patient of this consultation
    if ($user->type === 'doctor' && $consultation->doctorID == $user->id) {
        return true;
    }

    if ($user->type === 'patient' && $consultation->patientID == $user->id) {
        return true;
    }

    return false;
});
```

### 7. Add API Routes

#### `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    // WebRTC Signaling endpoints
    Route::prefix('webrtc')->group(function () {
        Route::post('/offer', [WebRTCController::class, 'sendOffer']);
        Route::post('/answer', [WebRTCController::class, 'sendAnswer']);
        Route::post('/ice-candidate', [WebRTCController::class, 'sendIceCandidate']);
        Route::post('/start-call', [WebRTCController::class, 'startCall']);
        Route::post('/end-call', [WebRTCController::class, 'endCall']);
    });
});
```

### 8. Update Consultation Acceptance to Trigger Call Start

In your consultation acceptance controller/service:

```php
use App\Events\WebRTCCallStarted;

// When doctor accepts consultation
public function acceptConsultation($consultationID)
{
    $consultation = Consultation::find($consultationID);
    
    // Update consultation status
    $consultation->status = 'Accepted';
    $consultation->save();

    // Trigger consultation-patient event (existing)
    event(new ConsultationAccepted($consultation));

    // If it's Audio or Video consultation, trigger call start
    if (in_array($consultation->type, ['Audio', 'Video'])) {
        $patientID = "patient_{$consultation->patientID}";
        event(new WebRTCCallStarted($consultationID, $patientID, strtolower($consultation->type)));
    }

    return $consultation;
}
```

## Frontend Implementation

### 1. Update SignalingService to Use Pusher

The frontend now uses `PusherSignalingService` instead of Socket.IO. Update `useWebRTC.ts` to use the new service:

```typescript
// In useWebRTC.ts, replace:
import SignalingService from '../services/webrtc/SignalingService';

// With:
import PusherSignalingService from '../services/webrtc/PusherSignalingService';
const SignalingService = PusherSignalingService;
```

### 2. Update API Calls for Signaling

Create an API service for WebRTC signaling:

#### `src/services/api/webrtcService.ts`

```typescript
import { apiClient } from './apiClient';
import { API } from '@constants/api';

export interface SendOfferRequest {
  consultationID: number;
  to: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerRequest {
  consultationID: number;
  to: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceCandidateRequest {
  consultationID: number;
  to: string;
  candidate: RTCIceCandidateInit;
}

export const sendWebRTCOffer = async (data: SendOfferRequest) => {
  const response = await apiClient.post('/webrtc/offer', data);
  return response.data;
};

export const sendWebRTCAnswer = async (data: SendAnswerRequest) => {
  const response = await apiClient.post('/webrtc/answer', data);
  return response.data;
};

export const sendWebRTCIceCandidate = async (data: SendIceCandidateRequest) => {
  const response = await apiClient.post('/webrtc/ice-candidate', data);
  return response.data;
};

export const startWebRTCCall = async (consultationID: number, type: 'audio' | 'video') => {
  const response = await apiClient.post('/webrtc/start-call', {
    consultationID,
    type,
  });
  return response.data;
};

export const endWebRTCCall = async (consultationID: number) => {
  const response = await apiClient.post('/webrtc/end-call', {
    consultationID,
  });
  return response.data;
};
```

### 3. Update PusherSignalingService to Use API

Update `PusherSignalingService.ts` to call API endpoints instead of client events:

```typescript
import { sendWebRTCOffer, sendWebRTCAnswer, sendWebRTCIceCandidate, endWebRTCCall } from '../api/webrtcService';

// In sendOffer method:
async sendOffer(offer: RTCSessionDescriptionInit, to: string): Promise<void> {
    if (!this.roomId || !this.userId) return;
    
    try {
        await sendWebRTCOffer({
            consultationID: parseInt(this.roomId.replace('consultation_', '')),
            to: to,
            offer: offer,
        });
        console.log('✅ [PusherSignaling] Offer sent via API');
    } catch (error) {
        console.error('❌ [PusherSignaling] Failed to send offer:', error);
        this.callbacks.onError?.('Failed to send offer');
    }
}

// Similar updates for sendAnswer, sendIceCandidate, endCall
```

## Pusher Channel Structure

### Channel Naming
- **Private Channel**: `private-webrtc-consultation{consultationID}`
- **Laravel Channel**: `webrtc-consultation.{consultationID}`

### Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `webrtc-offer` | Both | `{ consultationID, from, to, offer }` |
| `webrtc-answer` | Both | `{ consultationID, from, to, answer }` |
| `webrtc-ice-candidate` | Both | `{ consultationID, from, to, candidate }` |
| `webrtc-call-started` | Server → Client | `{ consultationID, initiator, type }` |
| `webrtc-call-ended` | Both | `{ consultationID, endedBy }` |
| `webrtc-call-rejected` | Both | `{ consultationID, rejectedBy }` |

## Testing Checklist

- [ ] Pusher credentials configured in Laravel `.env`
- [ ] Private channel authorization working
- [ ] WebRTC API endpoints accessible
- [ ] Events broadcast correctly
- [ ] Patient can initiate call
- [ ] Doctor can receive and answer call
- [ ] Offer/Answer exchange works
- [ ] ICE candidates exchanged
- [ ] Audio/Video connection established
- [ ] Call end works for both parties
- [ ] Consultation status updated after call

## Security Considerations

1. **Private Channels**: Always use private channels for WebRTC signaling
2. **Authorization**: Verify user has access to consultation in `channels.php`
3. **Rate Limiting**: Add rate limiting to WebRTC API endpoints
4. **Validation**: Validate all WebRTC signaling data
5. **Authentication**: Require authentication for all WebRTC endpoints

## Production Deployment

1. **Pusher Configuration**: Use production Pusher credentials
2. **HTTPS**: Ensure all connections use HTTPS
3. **TURN Servers**: Set up TURN servers for NAT traversal
4. **Monitoring**: Monitor Pusher connection and event delivery
5. **Error Handling**: Implement comprehensive error handling
6. **Logging**: Log all WebRTC events for debugging

## Notes

1. **Channel Name Format**: Laravel uses dots (`.`) but Pusher converts them to dashes (`-`) in channel names
2. **User ID Format**: Use `doctor_{id}` and `patient_{id}` consistently
3. **Room ID Format**: Use `consultation_{consultationID}` format
4. **Client Events**: Private channels support client events, but API calls are more reliable
5. **Reconnection**: Handle Pusher reconnection gracefully
