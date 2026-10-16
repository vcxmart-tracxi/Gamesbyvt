# Firebase Integration & Security Specification
**Product:** GamesByVT  
**Developer:** Bodepudi Varun Teja  

## Database Schema Structure

### Realtime Database Structure
```json
{
  "rooms": {
    "<ROOM_CODE>": {
      "code": "K9B47X",
      "createdAt": 1742080000000,
      "updatedAt": 1742080005000,
      "status": "lobby | playing | ended",
      "selectedGame": "ramudu-seetha | housy | show",
      "hostId": "usr_1742080000_a1b2",
      "maxPlayers": 12,
      "players": {
        "<PLAYER_ID>": {
          "id": "<PLAYER_ID>",
          "name": "Varun",
          "isHost": true,
          "isReady": true,
          "isConnected": true,
          "lastActive": 1742080005000
        }
      },
      "publicGame": {
        "calledNumbers": [45, 12, 89],
        "currentNumber": 45,
        "roundNumber": 2,
        "submittedPlayerIds": ["usr_1"]
      }
    }
  },
  "private": {
    "<ROOM_CODE>": {
      "<PLAYER_ID>": {
        "hand": [ ... ],
        "ticket": [ ... ],
        "reconnectToken": "..."
      }
    }
  }
}
```

## Security Rules Enforcement
1. **Private Data Isolation**: Under `private/$roomCode/$playerId`, read and write permissions are granted ONLY if `auth.uid == $playerId`. No player can read another player's hand.
2. **Host Privileges**: Room status, game selection, and number drawing can only be written if `data.child('hostId').val() === auth.uid`.
3. **Player Self-Updates**: Players can only update their own profile and readiness under `rooms/$roomCode/players/$playerId`.

## Expected Firebase Usage & Cost Considerations
- **Anonymous Authentication**: Free on Firebase Auth.
- **Realtime Database**: 1 GB stored data, 10 GB downloaded / month on Spark (free) tier. For continuous real-time gaming, concurrent connections limit is 100 on Spark tier and 200,000 on Blaze (pay-as-you-go) tier.
- **Cleanup Requirement**: Unattended rooms must be deleted; GamesByVT includes an active server-side cleanup routine running every 60 seconds.
