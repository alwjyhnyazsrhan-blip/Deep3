# Security Specification for kingofdeep

## Project
- Firebase Project: `kingofdeep`
- Database: Firestore `(default)`

## Data Invariants & Access Control

### 1. User Profiles (`/users/{userId}`)
- **Owner**: `userId == auth.uid`
- **Read**: Public (for leaderboards, visiting player harbors, viewing fleets).
- **Write (Create/Update/Delete)**: Restricted strictly to the document owner (`userId == auth.uid` or `resource.data.userId == auth.uid`).
- **Invariant**: No player can directly modify another player's gold, gems, ships, or level documents. All cross-player interactions must occur through asynchronous events (`/harborEvents`).

### 2. Global Chat Messages (`/chats/{messageId}`)
- **Read**: Public to all players.
- **Write**: Only authenticated players where `request.resource.data.senderId == auth.uid`.
- **Delete/Update**: Only the author (`resource.data.senderId == auth.uid`).
- **Invariant**: Chat messages must contain genuine `senderId`. Spoofing other players or arbitrary system identities from client payloads is rejected.

### 3. Friend Requests (`/friendRequests/{requestId}`)
- **Read**: Only sender (`senderId == auth.uid`) or receiver (`receiverId == auth.uid`).
- **Create**: Only sender where `request.resource.data.senderId == auth.uid`.
- **Update**: Allowed for sender or receiver (e.g., status changes to ACCEPTED/DECLINED).
- **Delete**: Allowed for sender or receiver.

### 4. Harbor Events (`/harborEvents/{eventId}`)
- **Read**: Only attacker (`attackerId == auth.uid`) or defender (`defenderId == auth.uid`).
- **Create**: Only attacker where `request.resource.data.attackerId == auth.uid`.
- **Update/Delete**: Either participant (e.g. defender marking event as PROCESSED or clearing inbox).

### 5. Support Tickets (`/support_tickets/{ticketId}`)
- **Create**: Authenticated user matching `userId == auth.uid`.
- **Read/Update/Delete**: Author only (`resource.data.userId == auth.uid`).

### 6. Tribes (`/tribes/{tribeId}`)
- **Read**: Public.
- **Write**: Signed-in members.
