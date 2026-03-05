
# Quick Start - Backend Implementation

## 🎯 Priority Order

Implement these features in order of priority:

### Phase 1: Core Functionality (Week 1)
1. **QR Code Generation** - Enhance POST /api/bookings
2. **QR Validation** - POST /api/qr/validate
3. **Club Discovery** - GET /api/clubs/discover
4. **Club Joining** - POST /api/clubs/:clubId/join
5. **Club Settings** - GET/PUT /api/club/info

### Phase 2: Tournament System (Week 2)
6. **Tournament Requests** - GET/PUT /api/club/tournaments/:id/requests/:requestId
7. **Bracket Generation** - POST /api/club/tournaments/:id/close-registration
8. **Match Results** - PUT /api/club/matches/:matchId/result
9. **Ranking Updates** - Automatic ELO calculation

### Phase 3: Communication (Week 3)
10. **WebSocket Chat** - ws://[backend]/ws/chat
11. **Chat API** - GET/POST /api/chat/...
12. **Notifications** - POST /api/club/notifications/send
13. **Push Notifications** - Expo Push integration

---

## 🔥 Critical Endpoints

### 1. QR Code System (HIGHEST PRIORITY)

#### Update POST /api/bookings
```typescript
// Add to booking creation
import crypto from 'crypto';

const token = crypto.randomBytes(32).toString('hex');
const qrCode = `PLAYLINK-${clubId}-${bookingId}-${token}`;

// Store in bookings.qr_code
// Return in response
```

#### POST /api/qr/validate
```typescript
// Body: { qrCode: string }
// 1. Parse: PLAYLINK-{clubId}-{bookingId}-{token}
// 2. Verify staff belongs to club
// 3. Fetch booking, verify qr_code matches
// 4. Check status = 'confirmed'
// 5. Check date = today
// 6. Check time within ±30 min of start_time
// 7. Update status to 'checked_in'
// 8. Send notification to player
```

### 2. Tournament Bracket Generation

#### POST /api/club/tournaments/:id/close-registration
```typescript
// 1. Fetch approved tournament_requests
// 2. Generate bracket based on tournament.type:

// TRADITIONAL (Single Elimination)
function generateTraditionalBracket(players) {
  // Shuffle players randomly
  // Pair them: [P1 vs P2], [P3 vs P4], etc.
  // Handle byes if odd number
  // Create matches with round=1
  // Winners advance to round=2, etc.
}

// SUPER 8 (Round Robin + Knockout)
function generateSuper8Bracket(players) {
  // Divide into groups of 4
  // Each group: everyone plays everyone (6 matches per group)
  // Top 2 from each group advance to semifinals
  // Winners play final
}

// REY DE CANCHA (King of Court)
function generateReyDeCancha(players) {
  // First match: P1 vs P2
  // Winner stays, P3 challenges
  // Winner stays, P4 challenges
  // Continue rotation
}

// AMERICANO (Rotating Partners)
function generateAmericano(players) {
  // Each player plays with different partners
  // Against different opponents
  // Maximize variety of pairings
}

// 3. Create matches, match_teams, match_team_players
// 4. Create group conversation
// 5. Add all players as participants
// 6. Send notifications
```

### 3. Match Result Recording

#### PUT /api/club/matches/:matchId/result
```typescript
// Body: { results: [{ setNumber, teamAScore, teamBScore }] }

// 1. Delete existing match_results
// 2. Insert new match_results
// 3. Calculate winner (most sets won)
// 4. Update match_teams.is_winner
// 5. Update match status to 'played'

// 6. ELO Calculation
function updateELO(winnerRating, loserRating, K = 32) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;
  
  const newWinnerRating = winnerRating + K * (1 - expectedWinner);
  const newLoserRating = loserRating + K * (0 - expectedLoser);
  
  return { newWinnerRating, newLoserRating };
}

// 7. Update rankings table for all players
// 8. Send notifications
// 9. If tournament, check if round complete, create next round
```

### 4. WebSocket Chat

#### ws://[backend]/ws/chat
```typescript
// On connection
ws.on('connection', (socket) => {
  // Authenticate
  socket.on('message', (data) => {
    const msg = JSON.parse(data);
    
    if (msg.type === 'auth') {
      // Verify Bearer token
      // Store userId in socket
    }
    
    if (msg.type === 'join') {
      // Verify user is conversation_participant
      // Add socket to room
    }
    
    if (msg.type === 'message') {
      // Insert into messages table
      // Broadcast to all in room
      io.to(conversationId).emit('message', {
        type: 'message',
        messageId,
        conversationId,
        senderId,
        senderName,
        content,
        createdAt
      });
    }
    
    if (msg.type === 'read') {
      // Insert into message_reads
      // Broadcast read receipt to sender
    }
  });
});
```

### 5. Notifications

#### POST /api/club/notifications/send
```typescript
// Body: { title, body, recipientType: 'all' | 'players' | 'staff' }

// 1. Determine recipients from club_members
// 2. Insert notification for each recipient
// 3. Send push notifications via Expo Push API

import { Expo } from 'expo-server-sdk';
const expo = new Expo();

const messages = recipients.map(user => ({
  to: user.pushToken,
  sound: 'default',
  title: title,
  body: body,
  data: { clubId, notificationId }
}));

const chunks = expo.chunkPushNotifications(messages);
for (const chunk of chunks) {
  await expo.sendPushNotificationsAsync(chunk);
}
```

---

## 🔐 Security Checklist

- [ ] All endpoints verify Bearer token
- [ ] Club admin endpoints check role='admin' in club_members
- [ ] Staff endpoints check role='staff' or 'admin'
- [ ] All queries filter by club_id for multi-club isolation
- [ ] QR validation includes cryptographic verification
- [ ] Ownership checks on all UPDATE/DELETE operations
- [ ] Input validation on all request bodies
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Rate limiting on sensitive endpoints

---

## 📊 Database Indexes

Add these indexes for performance:

```sql
CREATE INDEX idx_bookings_club_id ON bookings(club_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

CREATE INDEX idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);

CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_club_id ON matches(club_id);
CREATE INDEX idx_matches_status ON matches(status);

CREATE INDEX idx_rankings_club_id ON rankings(club_id);
CREATE INDEX idx_rankings_user_id ON rankings(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

---

## 🧪 Testing Checklist

### QR System
- [ ] QR code generated on booking creation
- [ ] QR validation works for valid code
- [ ] Rejects invalid QR format
- [ ] Rejects wrong club
- [ ] Rejects wrong date
- [ ] Rejects outside time window
- [ ] Rejects already checked in
- [ ] Sends notification to player

### Tournament Brackets
- [ ] Traditional bracket generates correctly
- [ ] Super 8 bracket generates correctly
- [ ] Rey de Cancha bracket generates correctly
- [ ] Americano bracket generates correctly
- [ ] Handles odd number of players
- [ ] Creates group chat
- [ ] Sends notifications to all participants

### Match Results
- [ ] Records results correctly
- [ ] Calculates winner properly
- [ ] Updates ELO ratings
- [ ] Updates wins/losses/matches_played
- [ ] Sends notifications to players
- [ ] Creates next round for tournaments

### Chat
- [ ] WebSocket connection works
- [ ] Messages broadcast to all participants
- [ ] Read receipts work
- [ ] Image sharing works
- [ ] Conversation list shows unread count

### Notifications
- [ ] Admin can send to all members
- [ ] Admin can send to players only
- [ ] Admin can send to staff only
- [ ] Push notifications delivered
- [ ] In-app notifications appear
- [ ] Mark as read works

---

## 🚀 Deployment

1. **Environment Variables**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
EXPO_ACCESS_TOKEN=...
PORT=3000
```

2. **Start Backend**
```bash
cd backend
npm install
npm run build
npm start
```

3. **Update Frontend**
```json
// app.json
{
  "extra": {
    "backendUrl": "https://your-backend.com"
  }
}
```

4. **Test Integration**
- Open app
- Try each feature
- Check backend logs
- Verify database updates

---

## 📞 Support

If you encounter issues:
1. Check `get_backend_logs` for errors
2. Verify database schema matches expected structure
3. Ensure all indexes are created
4. Check authentication token is being sent
5. Verify club_id filtering is working

---

## ✅ Ready to Launch Checklist

- [ ] All Phase 1 endpoints implemented
- [ ] All Phase 2 endpoints implemented
- [ ] All Phase 3 endpoints implemented
- [ ] Database indexes created
- [ ] Security checklist complete
- [ ] Testing checklist complete
- [ ] Backend deployed
- [ ] Frontend updated with backend URL
- [ ] End-to-end testing complete
- [ ] Push notifications configured
- [ ] WebSocket server running
- [ ] Monitoring and logging set up

---

**Once all checkboxes are complete, PlayLink Ec is ready to launch! 🎉**

