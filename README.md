# GamesByVT — Complete Responsive Multiplayer Gaming Website

**Developer:** Bodepudi Varun Teja  
**Product:** GamesByVT  
**Tagline:** Three Games. One Room. Play Together.  

GamesByVT is an authoritative real-time multiplayer gaming website built with React, TypeScript, and Express. It features three classic multiplayer games designed for groups of friends playing together across mobile, tablet, and desktop devices:

1. **Ramudu–Seetha**: Character cards and scoring engine with Ramudu (1,000 conditional), Seetha (1,000 conditional), Lakshman (900), Hanumal (750), Vaali (500), and custom characters (<500). (Explicit note: Discovery rules awaiting creator confirmation).
2. **Housy (Tambola)**: Authoritative 1–90 caller, unique 3×9 standard tickets, auto-marking, and verified claim validation for Early Five, Top Line, Middle Line, Bottom Line, and Full House.
3. **Show**: Rapid hidden-card passing game. Keep 3 cards, pass 1 clockwise, and repeat with strict 4-card invariants and private hand isolation.

---

## 1. Brand & Design System

- **Warm White Background**: `#FAFAF8`
- **Dark Charcoal Primary Text**: `#202124`
- **Muted Blue Accent**: `#4169E1`
- **Soft Grey Borders**: `#E7E7E3`
- **Secondary Text**: `#777B83`
- **Typography**: Plus Jakarta Sans for UI copy; JetBrains Mono for numbers, tickets, and codes.
- **Zero-Pill Discipline**: Metadata displayed as clean unboxed text with typographic separators (`·`).
- **Mobile Touch Targets**: Minimum 44 × 44 CSS pixels across all buttons and inputs.

---

## 2. Real-Time Multiplayer Architecture

- **Authoritative Server**: Hosted in `server.ts`. Clients never manipulate cards, tickets, or scores directly.
- **SSE Real-Time Sync**: Server-Sent Events (`/api/rooms/:roomCode/events`) broadcast state changes, presence, and game actions with sub-second latency.
- **Private Hand Isolation**: Only the authenticated owner can access their private hand or ticket. Hand contents are excluded from public room broadcasts.
- **Reconnection Engine**: Reconnect tokens are generated and stored in secure browser session storage. If a player refreshes, their active hand/ticket is automatically restored.
- **Host Handover Policy**: If a host leaves, host controls seamlessly transfer to the next active player.
- **Automated Room Sweep**: Background cleanup runs every 60 seconds. Inactive rooms (>45 mins idle) or expired rooms (>4 hours old) are automatically purged from memory.

---

## 3. Automated Test Suite

Run all tests:
```bash
npm test
```
The test suite validates:
- Ramudu–Seetha conditional scoring (Ramudu finds Seetha vs misses)
- Lakshman, Hanumal, Vaali fixed score preservation
- Custom character rejection for score >= 500 or duplicates
- Standard Tambola 3×9 ticket generation (15 numbers total, 5 per row, ascending columns)
- Authoritative claim validation (rejecting premature claims, accepting valid claims)
- Show deck distribution (4N cards for N players)
- Clockwise card passing and 4-card invariant retention
- Server rejection when attempting to pass an unowned card
- Four-of-a-kind detection

---

## 4. Running & Deployment

### Development
```bash
npm run dev
```
Starts full-stack Express server with Vite middleware on port 3000.

### Production Build
```bash
npm run build
npm start
```
Compiles client bundle and runs `server.ts` with static asset serving.

---

## 5. Firebase Integration & Security Rules

The security rules for both Firebase Realtime Database and Cloud Firestore are located in:
- `firebase/database.rules.json`
- `firebase/firestore.rules`
- `firebase/README.md`

Designed and Developed by **Bodepudi Varun Teja**.
