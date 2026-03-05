
# PlayLink Ec - Backend Implementation Guide

## Overview
This document outlines the comprehensive backend services that need to be implemented to bring the PlayLink Ec multi-club padel platform to life. The frontend is 100% complete and ready for integration.

## Database Schema
The database schema is already in place with the following tables:
- `user`, `account`, `session`, `verification` (Better Auth)
- `clubs`, `club_members` (Multi-club architecture)
- `courts`, `court_schedules`, `bookings` (Court management)
- `tournaments`, `tournament_requests` (Tournament system)
- `matches`, `match_teams`, `match_team_players`, `match_results` (Match management)
- `rankings` (Player statistics and ELO ratings)
- `conversations`, `conversation_participants`, `messages`, `message_reads` (Chat system)
- `notifications` (Notification system)

## Critical Backend Features to Implement

### 1. Tournament Bracket Generation & Management

#### POST /api/club/tournaments/:tournamentId/close-registration
**Purpose:** Close tournament registration and automatically generate bracket based on tournament type

**Authentication:** Bearer token (club admin only)

**Process:**
1. Validate tournament exists and user is admin of that club
2. Change tournament status from 'open' to 'closed'
3. Fetch all approved tournament_requests
4. Implement bracket generation algorithms:
   - **Traditional (Single Elimination):** Pair players randomly, create knockout rounds, handle byes for odd numbers
   - **Super 8:** Divide into groups of 4, round robin within groups, top 2 advance to semifinals
   - **Rey de Cancha (King of Court):** Winner stays, challenger rotates, continuous play format
   - **Americano:** Rotating partners - each player plays with different partners against different opponents
5. Create matches in `matches` table with proper round numbers
6. Create `match_teams` (teamA, teamB) and `match_team_players` entries
7. Create group conversation for tournament (type='group', tournament_id set)
8. Add all approved players as `conversation_participants`
9. Send notifications to all participants: "Tournament [name] bracket is ready! Check your matches."

**Response:**
```json
{
  "success": true,
  "matchesCreated": 15,
  "bracket": [
    {
      "matchId": "uuid",
      "round": 1,
      "teamA": [{ "userId": "user1", "userName": "John Doe" }],
      "teamB": [{ "userId": "user2", "userName": "Jane Smith" }]
    }
  ]
}
```

#### GET /api/club/tournaments/:id/bracket
**Purpose:** Retrieve full tournament bracket structure

**Response:**
```json
{
  "matches": [
    {
      "id": "uuid",
      "round": 1,
      "status": "pending",
      "teamA": [{ "userId": "user1", "userName": "John" }],
      "teamB": [{ "userId": "user2", "userName": "Jane" }],
      "results": []
    }
  ]
}
```

#### GET /api/club/tournaments/:tournamentId/requests
**Purpose:** Get all join requests for a tournament

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user1",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### PUT /api/club/tournaments/:tournamentId/requests/:requestId
**Purpose:** Approve or reject tournament join request

**Body:**
```json
{
  "status": "approved"
}
```

**Process:**
1. Update `tournament_requests.status`
2. Send notification to player: "Your request to join [tournament] has been [approved/rejected]"

---

### 2. Match Result Recording & Ranking Updates

#### PUT /api/club/matches/:matchId/result
**Purpose:** Record match results and automatically update player rankings

**Authentication:** Bearer token (club admin only)

**Body:**
```json
{
  "results": [
    { "setNumber": 1, "teamAScore": 6, "teamBScore": 4 },
    { "setNumber": 2, "teamAScore": 7, "teamBScore": 5 }
  ]
}
```

**Process:**
1. Validate match exists and belongs to admin's club
2. Delete existing `match_results` for this match
3. Insert new `match_results` entries for each set
4. Calculate winner based on sets won (best of 3 or best of 5)
5. Update `match_teams.is_winner` for winning team
6. Update match status to 'played'
7. **Trigger ELO rating calculation:**
   - Use standard ELO formula with K=32
   - Initial rating = 1200
   - Update `rankings` table for all players in match
8. Update stats: wins, losses, matches_played, sets_won, sets_lost
9. Calculate points: Win=3 points, Loss=0 points
10. Send notifications to all players: "Match result recorded: [TeamA] vs [TeamB]"
11. If tournament match, check if round is complete and create next round matches automatically

**Response:**
```json
{
  "success": true,
  "match": {
    "id": "uuid",
    "status": "played",
    "winner": "teamA",
    "results": [...]
  }
}
```

#### POST /api/club/rankings/recalculate
**Purpose:** Manually recalculate all rankings for the club

**Process:**
1. Fetch all verified matches for the club
2. Recalculate ELO ratings chronologically
3. Update wins, losses, matches_played, sets_won, sets_lost
4. Calculate points based on wins

---

### 3. QR Code Generation & Validation System

#### Enhance POST /api/bookings
**Purpose:** Generate unique QR code when creating booking

**Process:**
1. Create booking as normal
2. Generate cryptographically secure token: `crypto.randomBytes(32).toString('hex')`
3. Format QR code: `PLAYLINK-${clubId}-${bookingId}-${token}`
4. Store in `bookings.qr_code` column
5. Return `qr_code` in response

**Response:**
```json
{
  "id": "uuid",
  "clubId": "uuid",
  "courtId": "uuid",
  "bookingDate": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "status": "confirmed",
  "qrCode": "PLAYLINK-club123-booking456-abc123def456...",
  "createdAt": "2024-01-15T09:00:00Z"
}
```

#### POST /api/qr/validate
**Purpose:** Validate QR code and check-in player

**Authentication:** Bearer token (staff or admin only)

**Body:**
```json
{
  "qrCode": "PLAYLINK-club123-booking456-abc123def456..."
}
```

**Process:**
1. Parse QR code to extract clubId, bookingId, token
2. Validate staff member belongs to the club (check `club_members`)
3. Fetch booking and verify `qr_code` matches exactly
4. Validate booking status is 'confirmed' (not already checked_in, cancelled, etc.)
5. Validate booking_date is today
6. Validate current time is within 30 minutes before or after start_time
7. Update booking status to 'checked_in'
8. Log check-in with staff user_id and timestamp
9. Send notification to player: "Check-in successful for [court] at [time]"

**Success Response:**
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "courtName": "Court 1",
    "userName": "John Doe",
    "startTime": "10:00",
    "endTime": "11:00",
    "status": "checked_in"
  }
}
```

**Error Responses:**
- 400: Invalid QR code format
- 404: Booking not found
- 400: Already checked in
- 400: Wrong date or time (outside check-in window)
- 403: Staff member not authorized for this club

---

### 4. Real-Time Chat with WebSockets

#### WebSocket Endpoint: ws://[backend]/ws/chat

**Connection:**
- Authenticate via Bearer token in query param or initial message
- Client sends: `{ type: 'auth', token: 'Bearer ...' }`

**Join Conversation:**
```json
{
  "type": "join",
  "conversationId": "uuid"
}
```
- Server validates user is a `conversation_participant`

**Send Message:**
```json
{
  "type": "message",
  "conversationId": "uuid",
  "content": "Hello everyone!",
  "imageUrl": "https://..." // optional
}
```
- Server inserts into `messages` table
- Server broadcasts to all participants in that conversation:
```json
{
  "type": "message",
  "messageId": "uuid",
  "conversationId": "uuid",
  "senderId": "user1",
  "senderName": "John Doe",
  "content": "Hello everyone!",
  "imageUrl": "https://...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Mark as Read:**
```json
{
  "type": "read",
  "messageId": "uuid"
}
```
- Server inserts into `message_reads` table
- Server broadcasts read receipt to sender:
```json
{
  "type": "read",
  "messageId": "uuid",
  "userId": "user2",
  "readAt": "2024-01-15T10:31:00Z"
}
```

#### GET /api/chat/conversations
**Purpose:** Get all conversations for user

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "direct",
    "participants": [
      { "userId": "user1", "userName": "John" },
      { "userId": "user2", "userName": "Jane" }
    ],
    "lastMessage": {
      "content": "See you tomorrow!",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "unreadCount": 3
  },
  {
    "id": "uuid",
    "type": "group",
    "tournamentName": "Summer Championship",
    "participants": [...],
    "lastMessage": {...},
    "unreadCount": 0
  }
]
```

#### GET /api/chat/conversation/:conversationId/messages
**Purpose:** Get all messages for a conversation

**Response:**
```json
[
  {
    "id": "uuid",
    "senderId": "user1",
    "senderName": "John Doe",
    "content": "Hello!",
    "imageUrl": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "readBy": [
      { "userId": "user2", "readAt": "2024-01-15T10:31:00Z" }
    ]
  }
]
```

#### POST /api/chat/conversation
**Purpose:** Create a new conversation

**Body (Direct):**
```json
{
  "type": "direct",
  "participantIds": ["user1", "user2"]
}
```

**Body (Group):**
```json
{
  "type": "group",
  "tournamentId": "uuid"
}
```

**Response:**
```json
{
  "conversationId": "uuid"
}
```

---

### 5. Notification System

#### POST /api/club/notifications/send
**Purpose:** Admin sends notification to club members

**Authentication:** Bearer token (club admin only)

**Body:**
```json
{
  "title": "Court Maintenance",
  "body": "Court 3 will be closed tomorrow for maintenance.",
  "recipientType": "all"
}
```

**Recipient Types:**
- `all`: All club members
- `players`: Only members with role='player'
- `staff`: Only members with role='staff' or 'admin'
- Can also specify `recipientIds: ["user1", "user2"]` for specific users

**Process:**
1. Validate user is club admin
2. Determine recipients based on recipientType
3. Insert notification for each recipient with `is_read=false`
4. **Integrate with Expo Push Notifications:**
   - Fetch push tokens for recipients (need to add push_token storage)
   - Send push notifications via Expo Push API
5. Return count of notifications sent

**Response:**
```json
{
  "success": true,
  "notificationsSent": 45
}
```

#### GET /api/club/notifications/history
**Purpose:** Get history of notifications sent by club

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Court Maintenance",
    "body": "Court 3 will be closed...",
    "recipientCount": 45,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### GET /api/notifications
**Purpose:** Get all notifications for authenticated user

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Tournament Bracket Ready",
    "body": "The bracket for Summer Championship is ready!",
    "type": "tournament",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "clubName": "Padel Club Central"
  }
]
```

#### PUT /api/notifications/:notificationId/read
**Purpose:** Mark notification as read

**Response:**
```json
{
  "success": true
}
```

---

### 6. Club Discovery & Joining

#### GET /api/clubs/discover
**Purpose:** Discover clubs user is not a member of

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Padel Club Central",
    "address": "123 Main St",
    "phone": "+593 99 123 4567",
    "email": "info@padelclub.com",
    "memberCount": 150,
    "courtsCount": 6,
    "activeTournamentsCount": 3
  }
]
```

#### POST /api/clubs/:clubId/join
**Purpose:** Player joins a club

**Process:**
1. Validate club exists
2. Check user is not already a member
3. Create `club_members` entry with role='player'
4. Create initial `rankings` entry (points=0, elo_rating=1200, wins=0, losses=0, etc.)
5. Send notification: "Welcome to [club name]!"

**Response:**
```json
{
  "success": true,
  "club": {
    "id": "uuid",
    "name": "Padel Club Central",
    "role": "player"
  }
}
```

---

### 7. Club Settings Management

#### GET /api/club/info
**Purpose:** Get club details for admin

**Response:**
```json
{
  "id": "uuid",
  "name": "Padel Club Central",
  "address": "123 Main St",
  "phone": "+593 99 123 4567",
  "email": "info@padelclub.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/club/info
**Purpose:** Update club information

**Body:**
```json
{
  "name": "Padel Club Central - Updated",
  "address": "456 New St",
  "phone": "+593 99 999 9999",
  "email": "contact@padelclub.com"
}
```

**Response:**
```json
{
  "success": true,
  "club": {
    "id": "uuid",
    "name": "Padel Club Central - Updated",
    "address": "456 New St",
    "phone": "+593 99 999 9999",
    "email": "contact@padelclub.com"
  }
}
```

---

## Security & Authentication

### Multi-Club Isolation
- All queries MUST filter by `club_id` to ensure data isolation
- Users can belong to multiple clubs via `club_members` table
- Each request must determine the user's current club context

### Role-Based Access Control
- **Player:** Can view, book courts, join tournaments, chat
- **Staff:** Can validate QR codes, view bookings
- **Admin:** Full access to club management, can create tournaments, record results, send notifications

### Authentication
- All endpoints use Bearer token authentication (Better Auth)
- Token validation on every request
- User ID extracted from token for ownership checks

### Ownership Checks
- Bookings: User can only cancel their own bookings
- Matches: Only club admin can record results
- Tournaments: Only club admin can manage
- QR Validation: Staff must belong to the club

---

## Timestamp Format
- All timestamps use ISO 8601 format: `2024-01-15T10:30:00Z`
- Database columns use `timestamptz` (timestamp with time zone)
- All API responses return timestamps as ISO 8601 strings

---

## Error Handling
- 400 Bad Request: Invalid input, validation errors
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: User doesn't have permission
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Server-side errors

**Error Response Format:**
```json
{
  "error": "Invalid QR code format",
  "statusCode": 400
}
```

---

## Performance Considerations

### Database Indexing
Ensure proper indexes on:
- `club_id` (all tables with club_id)
- `user_id` (bookings, rankings, notifications, etc.)
- `tournament_id` (matches, tournament_requests)
- `status` (bookings, matches, tournaments)
- `created_at` (for sorting)

### Bracket Generation
- Handle edge cases: odd number of players (byes), minimum participants
- Use transactions to ensure atomicity
- Consider background jobs for very large tournaments (100+ players)

### Real-time Chat
- WebSocket connection pooling
- Message broadcasting optimization
- Consider Redis Pub/Sub for scaling across multiple server instances

### Notification Delivery
- Batch push notifications where possible
- Queue system for large notification sends
- Retry logic for failed push notifications

---

## Frontend Integration Status

✅ **COMPLETE** - All frontend screens are built and ready:
- Home screen with bookings and club selector
- Profile screen with stats and club management
- Booking creation and details screens
- Tournament list and details screens
- Club admin dashboard
- Court management
- Tournament management with "Close Registration" button
- Match result recording
- Player and staff management
- Rankings display
- QR scanner screen
- Notification center
- Club discovery and joining
- Club settings management

🔄 **AWAITING BACKEND** - Frontend is calling these API endpoints:
- All endpoints defined in `utils/api.ts`
- WebSocket connection for real-time chat
- Push notification registration

---

## Next Steps

1. **Implement Backend Services:** Build all endpoints listed above
2. **WebSocket Server:** Set up WebSocket server for real-time chat
3. **Push Notifications:** Integrate Expo Push Notification service
4. **Testing:** Test all endpoints with frontend integration
5. **Deployment:** Deploy backend and update `backendUrl` in app.json

---

## Notes

- The frontend is 100% complete and production-ready
- All UI components, navigation, and API integration points are implemented
- The backend implementation will bring all features to life
- The web panel for administrators is a separate component (not started)

