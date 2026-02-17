## Backend Server Setup Guide

This guide helps you set up the Node.js/Express backend server for the Auto Battler game.

## Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB (or any database you prefer)
- Redis (optional, for session management)

## Installation

```bash
# Create backend directory
mkdir auto-battler-backend
cd auto-battler-backend

# Initialize project
npm init -y

# Install dependencies
npm install express express-cors dotenv bcryptjs jsonwebtoken ws uuid axios
npm install --save-dev nodemon
```

## Environment Setup

Create `.env` file:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/auto-battler
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

## Server Code Structure

### 1. Main Server (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/battle', require('./routes/battle'));

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received:', message);
    
    // Handle different message types
    switch(message.type) {
      case 'search_match':
        handleMatchSearch(ws, message.payload);
        break;
      case 'place_unit':
        handlePlaceUnit(ws, message.payload);
        break;
      case 'start_battle':
        handleStartBattle(ws, message.payload);
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

### 2. Authentication Routes (routes/auth.js)

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = []; // Replace with database

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with 5 starter characters
    const user = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      characters: [1, 2, 3, 4, 5], // Starter character IDs
      createdAt: new Date()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, username, email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
```

### 3. User Routes (routes/users.js)

```javascript
const express = require('express');
const router = express.Router();

router.get('/characters', (req, res) => {
  // Get user characters from database
  const characters = [
    {
      id: 1,
      name: 'Flame Knight',
      class: 'warrior',
      rarity: 'uncommon',
      hp: 150,
      attack: 25,
      defense: 15,
      speed: 10
    },
    // ... more characters
  ];
  res.json(characters);
});

router.post('/characters', (req, res) => {
  const { characterId } = req.body;
  // Add character to user collection
  res.status(201).json({ message: 'Character added' });
});

module.exports = router;
```

### 4. Match Routes (routes/matches.js)

```javascript
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const matches = [];

router.post('/create', (req, res) => {
  const match = {
    id: uuidv4(),
    player1: req.user?.id,
    status: 'waiting',
    createdAt: new Date()
  };
  matches.push(match);
  res.status(201).json(match);
});

router.get('/:id', (req, res) => {
  const match = matches.find(m => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ message: 'Match not found' });
  }
  res.json(match);
});

module.exports = router;
```

### 5. Battle Routes (routes/battle.js)

```javascript
const express = require('express');
const router = express.Router();

const UNITS = [
  { id: 1, name: 'Flame Knight', class: 'warrior', hp: 150, attack: 25, defense: 15, speed: 10 },
  { id: 2, name: 'Frost Mage', class: 'mage', hp: 100, attack: 35, defense: 8, speed: 20 },
  { id: 3, name: 'Shadow Rogue', class: 'rogue', hp: 80, attack: 30, defense: 5, speed: 25 },
  { id: 4, name: 'Holy Paladin', class: 'paladin', hp: 180, attack: 20, defense: 25, speed: 8 },
  { id: 5, name: 'Forest Ranger', class: 'ranger', hp: 110, attack: 28, defense: 12, speed: 22 },
];

router.get('/units', (req, res) => {
  res.json(UNITS);
});

router.get('/units/:id', (req, res) => {
  const unit = UNITS.find(u => u.id === parseInt(req.params.id));
  if (!unit) {
    return res.status(404).json({ message: 'Unit not found' });
  }
  res.json(unit);
});

module.exports = router;
```

## WebSocket Handlers

Add these handler functions to your main server file:

```javascript
let matchQueue = [];
const activeMatches = new Map();

function handleMatchSearch(ws, payload) {
  const { userId } = payload;

  if (matchQueue.length > 0) {
    const opponent = matchQueue.shift();
    const matchId = `match_${Date.now()}`;

    const match = {
      id: matchId,
      player1: opponent.userId,
      player2: userId,
      player1WS: opponent.ws,
      player2WS: ws,
      status: 'ready'
    };

    activeMatches.set(matchId, match);

    // Notify both players
    opponent.ws.send(JSON.stringify({
      type: 'match_created',
      payload: { matchId, opponent: { id: userId } }
    }));

    ws.send(JSON.stringify({
      type: 'match_created',
      payload: { matchId, opponent: { id: opponent.userId } }
    }));
  } else {
    matchQueue.push({ userId, ws });
    ws.send(JSON.stringify({
      type: 'app',
      payload: { message: 'Searching for opponent...' }
    }));
  }
}

function handlePlaceUnit(ws, payload) {
  const { matchId, position, unitId } = payload;
  const match = activeMatches.get(matchId);

  if (match) {
    // Broadcast to opponent
    if (match.player1WS === ws) {
      match.player2WS.send(JSON.stringify({
        type: 'battle_update',
        payload: { message: `Opponent placed unit at position ${position}` }
      }));
    } else {
      match.player1WS.send(JSON.stringify({
        type: 'battle_update',
        payload: { message: `Opponent placed unit at position ${position}` }
      }));
    }
  }
}

function handleStartBattle(ws, payload) {
  const { matchId } = payload;
  const match = activeMatches.get(matchId);

  if (match) {
    match.status = 'battling';
    
    // Notify both players
    match.player1WS.send(JSON.stringify({
      type: 'battle_start',
      payload: { message: 'Battle started!' }
    }));

    match.player2WS.send(JSON.stringify({
      type: 'battle_start',
      payload: { message: 'Battle started!' }
    }));
  }
}
```

## Database Schema (MongoDB)

```javascript
// Users collection
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  characters: [CharacterId],
  wins: Number,
  losses: Number,
  elo: Number,
  createdAt: Date,
  updatedAt: Date
}

// Matches collection
{
  _id: ObjectId,
  player1Id: ObjectId,
  player2Id: ObjectId,
  winner: ObjectId,
  player1Team: [{ unitId, position }],
  player2Team: [{ unitId, position }],
  status: String, // 'pending', 'active', 'completed'
  startedAt: Date,
  endedAt: Date
}
```

## Running the Server

```bash
# Development
npm start

# With nodemon (auto-reload)
npx nodemon server.js
```

## Testing

Use tools like Postman or REST Client to test endpoints:

```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123"
}
```

## Next Steps

1. Replace in-memory storage with a real database
2. Implement proper error handling and validation
3. Add authentication middleware
4. Implement match-making algorithm
5. Add battle simulation logic
6. Deploy to production (Heroku, AWS, DigitalOcean, etc.)

---

For more help, refer to the frontend README.md
