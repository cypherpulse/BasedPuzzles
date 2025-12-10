# Backend Expectations for Based Puzzles

## System Overview

Based Puzzles is a Base-native web game hub featuring Sudoku and Crossword puzzles. The backend must support **daily challenges only** for competitive gameplay, with practice mode handled entirely on the frontend.

### Key Requirements
- **Daily Challenges**: Same puzzle for all players each day
- **Anti-Cheating**: Server-side solution verification
- **Wallet Integration**: Base Smart Wallet authentication
- **Leaderboards**: Global rankings by completion time
- **Streaks & Rewards**: Track consecutive completions and award achievements/NFTs
- **No Practice Mode**: Frontend generates random puzzles for unlimited practice

### Authentication
- **Method**: Wallet Address (Base Smart Wallet)
- **Header**: `X-Wallet-Address: 0x123...abc`
- **Verification**: Validate wallet address format (0x + 40 hex chars)

---

## API Endpoints

### 1. GET /api/puzzles/daily/:gameMode
**Fetch Daily Puzzle**

**Parameters:**
- `gameMode`: "sudoku" or "crossword"
- `date` (optional): "YYYY-MM-DD" format, defaults to today

**Response (Sudoku):**
```json
{
  "id": "daily-sudoku-2025-12-10",
  "gameMode": "sudoku",
  "difficulty": "medium",
  "date": "2025-12-10",
  "grid": [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    // ... full 9x9 grid (0 = empty cell)
  ],
  "theme": "Base Blockchain Basics"
}
```

**Response (Crossword):**
```json
{
  "id": "daily-crossword-2025-12-10",
  "gameMode": "crossword",
  "difficulty": "easy",
  "date": "2025-12-10",
  "width": 7,
  "height": 7,
  "grid": [
    [
      { "row": 0, "col": 0, "isBlock": false, "number": 1 },
      { "row": 0, "col": 1, "isBlock": false },
      // ... full grid array
    ]
  ],
  "clues": [
    {
      "id": "a1",
      "number": 1,
      "direction": "across",
      "row": 0,
      "col": 0,
      "length": 4,
      "prompt": "The L2 network built on Ethereum by Coinbase"
    }
  ],
  "theme": "Base Culture"
}
```

**Notes:**
- Grid contains starting state only (no solutions)
- Crossword grid uses cell objects with `isBlock`, `number` properties
- Theme is optional fun description

---

### 2. POST /api/puzzles/verify
**Submit and Verify Solution**

**Request Body:**
```json
{
  "puzzleId": "daily-sudoku-2025-12-10",
  "solution": [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 1, 9, 5, 3, 4, 2],
    // ... full solved grid
  ],
  "timeTaken": 180,
  "clientTimestamp": "2025-12-10T12:00:00Z"
}
```

**Headers:**
- `X-Wallet-Address: 0x123...abc`

**Success Response:**
```json
{
  "success": true,
  "rank": 15,
  "newStreak": 5,
  "rewards": ["7-Day Streak Badge"],
  "nftMinted": false
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Incorrect solution"
}
```

**Validation Rules:**
- Verify solution matches stored answer
- Check timestamp is within puzzle's active window (24 hours)
- Rate limit: max 5 submissions per user per day
- Update user stats and leaderboard only on success

---

### 3. GET /api/leaderboard/daily/:gameMode
**Fetch Daily Leaderboard**

**Headers:**
- `X-Wallet-Address: 0x123...abc` (optional - for personalized ranking)

**Parameters:**
- `gameMode`: "sudoku" or "crossword"
- `date` (optional): "YYYY-MM-DD", defaults to today
- `limit` (optional): Number of results, default 50
- `offset` (optional): Pagination offset, default 0

**Response:**
```json
[
  {
    "rank": 1,
    "username": "PuzzleMaster",
    "walletAddress": "0x123...abc",
    "timeTaken": 120,
    "completedAt": "2025-12-10T10:30:00Z"
  }
]
```

---

### 4. GET /api/user/stats
**Get User Statistics**

**Headers:**
- `X-Wallet-Address: 0x123...abc` (required)

**Response:**
```json
{
  "walletAddress": "0x123...abc",
  "currentStreak": 7,
  "longestStreak": 12,
  "dailyCompletions": 50,
  "lastCompleted": "2025-12-10",
  "achievements": ["Speed Demon", "Streak Master"]
}
```

---

## Database Schema

### Puzzles Table
```sql
CREATE TABLE puzzles (
  id VARCHAR PRIMARY KEY, -- e.g., "daily-sudoku-2025-12-10"
  game_mode VARCHAR NOT NULL, -- "sudoku" or "crossword"
  difficulty VARCHAR NOT NULL,
  date DATE NOT NULL,
  grid JSON NOT NULL, -- Starting grid state
  solution JSON NOT NULL, -- Complete solution (never sent to frontend)
  clues JSON, -- For crosswords only
  theme VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Submissions Table
```sql
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  puzzle_id VARCHAR REFERENCES puzzles(id),
  wallet_address VARCHAR NOT NULL,
  solution JSON NOT NULL,
  time_taken INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  client_timestamp TIMESTAMP NOT NULL
);
```

### Users Table
```sql
CREATE TABLE users (
  wallet_address VARCHAR PRIMARY KEY,
  username VARCHAR,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  last_completed DATE,
  achievements JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Leaderboards Table (Materialized View)
```sql
CREATE MATERIALIZED VIEW daily_leaderboards AS
SELECT
  puzzle_id,
  wallet_address,
  time_taken,
  submitted_at,
  RANK() OVER (PARTITION BY puzzle_id ORDER BY time_taken ASC) as rank
FROM submissions
WHERE is_correct = true;
```

---

## Anti-Cheating Measures

1. **Server-Side Verification**: Solutions stored only on backend
2. **Rate Limiting**: 5 submissions max per user per day
3. **Timestamp Validation**: Submissions must be within 24-hour window
4. **Wallet Address Validation**: Verify proper Ethereum address format
5. **No Solution Exposure**: Never include solutions in API responses
6. **Audit Logging**: Log all submissions for moderation
7. **Duplicate Prevention**: One correct submission per user per puzzle

---

## Error Handling

**Standard Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // Optional
}
```

**Common Error Codes:**
- `INVALID_PUZZLE`: Puzzle doesn't exist
- `PUZZLE_EXPIRED`: Submission after deadline
- `RATE_LIMITED`: Too many submissions
- `INVALID_SOLUTION`: Solution format incorrect
- `INCORRECT_SOLUTION`: Solution doesn't match
- `UNAUTHORIZED`: Invalid wallet signature

---

## Performance Requirements

- **Response Time**: <500ms for puzzle fetches, <2s for verification
- **Availability**: 99.9% uptime for daily challenges
- **Caching**: Cache daily puzzles in Redis/memory
- **Scaling**: Support 10k+ daily active users

---

## NFT Integration (Future)

When ready for onchain rewards:
- Mint NFTs via smart contract calls
- Track minted NFTs in database
- Include `nftMinted: true` in verification response
- Support ERC-721/1155 standards

---

## Testing Requirements

- Unit tests for solution verification logic
- Integration tests for all endpoints
- Load testing for leaderboard queries
- Security testing for wallet authentication

This specification ensures a secure, fair, and engaging daily puzzle experience for Based Puzzles users.</content>
<parameter name="filePath">g:\2025\Learning\Blockchain\Base\Demo\BasedPuzzles-Frontend\expectations.md