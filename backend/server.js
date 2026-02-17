// backend/server.js
// Auto Battler Backend Server - With SQLite Database

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { sequelize, User, Character, Match, initializeDatabase } = require('./db');
const { STARTER_CHARACTERS } = require('./utils/characters');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ============ CONFIGURATION ============

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const BCRYPT_ROUNDS = 10;

// WebSocket connection tracking
const connectedClients = new Map();
const matchQueue = [];

// ============ MIDDLEWARE ============

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Auth middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.user = await User.findByPk(decoded.userId);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ============ AUTHENTICATION ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user in database
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      wins: 0,
      losses: 0
    });

    // Add 5 starter characters to user
    for (const starterChar of STARTER_CHARACTERS) {
      await Character.create({
        userId: user.id,
        characterId: starterChar.id,
        name: starterChar.name,
        class: starterChar.class,
        rarity: starterChar.rarity,
        hp: starterChar.hp,
        attack: starterChar.attack,
        defense: starterChar.defense,
        speed: starterChar.speed,
        level: 1,
        experience: 0
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const characters = await Character.findAll({ where: { userId: req.user.id } });
    
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      characters: characters.map(c => c.characterId),
      wins: req.user.wins,
      losses: req.user.losses
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// ============ USER ROUTES ============

app.get('/api/users/characters', auth, async (req, res) => {
  try {
    const characters = await Character.findAll({ 
      where: { userId: req.user.id },
      raw: true 
    });
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get characters' });
  }
});

app.post('/api/users/characters', auth, async (req, res) => {
  try {
    const { characterId } = req.body;
    
    // Check STARTER_CHARACTERS to get character data
    const characterData = STARTER_CHARACTERS.find(c => c.id === characterId);
    if (!characterData) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user already has this character
    const existing = await Character.findOne({
      where: { userId: req.user.id, characterId }
    });

    if (existing) {
      return res.status(409).json({ message: 'Character already owned' });
    }

    // Add character to user
    const character = await Character.create({
      userId: req.user.id,
      characterId: characterData.id,
      name: characterData.name,
      class: characterData.class,
      rarity: characterData.rarity,
      hp: characterData.hp,
      attack: characterData.attack,
      defense: characterData.defense,
      speed: characterData.speed,
      level: 1,
      experience: 0
    });

    res.status(201).json(character);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add character' });
  }
});

// ============ MATCH ROUTES ============

app.post('/api/matches/create', auth, async (req, res) => {
  try {
    const match = await Match.create({
      player1Id: req.user.id,
      status: 'waiting'
    });

    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create match' });
  }
});

app.get('/api/matches', auth, async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: {
        status: 'completed'
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get matches' });
  }
});

app.get('/api/matches/:id', auth, async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get match' });
  }
});

app.put('/api/matches/:id/team', auth, async (req, res) => {
  try {
    const { team } = req.body;
    const match = await Match.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.player1Id === req.user.id) {
      match.player1Team = team;
    } else if (match.player2Id === req.user.id) {
      match.player2Team = team;
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update team' });
  }
});

// ============ BATTLE ROUTES ============

app.get('/api/battle/units', (req, res) => {
  res.json(STARTER_CHARACTERS);
});

app.get('/api/battle/units/:id', (req, res) => {
  const unit = STARTER_CHARACTERS.find(c => c.id === parseInt(req.params.id));
  if (!unit) {
    return res.status(404).json({ message: 'Unit not found' });
  }
  res.json(unit);
});

// ============ WEBSOCKET HANDLERS ============

wss.on('connection', (ws) => {
  console.log('✓ New WebSocket client connected');
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.log('WebSocket message:', message.type);

      switch (message.type) {
        case 'search_match':
          handleSearchMatch(ws, message.payload);
          break;
        case 'place_unit':
          handlePlaceUnit(ws, message.payload);
          break;
        case 'start_battle':
          handleStartBattle(ws, message.payload);
          break;
        case 'end_battle':
          handleEndBattle(ws, message.payload);
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('✗ WebSocket client disconnected');
    connectedClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Heartbeat mechanism - keep connections alive
setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// ============ WEBSOCKET LOGIC ============

function handleSearchMatch(ws, payload) {
  const { userId } = payload;
  connectedClients.set(ws, userId);

  console.log('🔍 Searching for match for user:', userId);

  if (matchQueue.length > 0) {
    const opponent = matchQueue.shift();
    const matchId = require('uuid').v4();

    const match = {
      id: matchId,
      player1Id: opponent.userId,
      player2Id: userId,
      player1WS: opponent.ws,
      player2WS: ws,
      status: 'ready',
      startedAt: new Date()
    };

    // Notify both players
    opponent.ws.send(JSON.stringify({
      type: 'match_created',
      payload: {
        matchId,
        opponent: { id: userId }
      }
    }));

    ws.send(JSON.stringify({
      type: 'match_created',
      payload: {
        matchId,
        opponent: { id: opponent.userId }
      }
    }));

    console.log('✅ Match created:', matchId);
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
  console.log('📍 Unit placed:', { matchId, position, unitId });
}

function handleStartBattle(ws, payload) {
  const { matchId } = payload;
  console.log('⚔️ Battle started:', matchId);

  ws.send(JSON.stringify({
    type: 'battle_start',
    payload: { message: 'Battle started!' }
  }));

  // Simulate battle turns
  let round = 1;
  const maxRounds = 3;
  
  const battleInterval = setInterval(() => {
    if (round > maxRounds) {
      clearInterval(battleInterval);

      const winner = Math.random() > 0.5 ? 'player1' : 'player2';
      ws.send(JSON.stringify({
        type: 'battle_end',
        payload: {
          winner,
          result: 'COMPLETED'
        }
      }));

      return;
    }

    ws.send(JSON.stringify({
      type: 'battle_update',
      payload: { 
        message: `Round ${round}: Combat ongoing...`,
        round
      }
    }));

    round++;
  }, 2000);
}

function handleEndBattle(ws, payload) {
  const { matchId, winner } = payload;
  console.log('🏆 Battle ended. Winner:', winner);
}

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ============ SERVER START ============

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════╗
║  🎮 Auto Battler Server Started       ║
║                                        ║
║  Server: http://localhost:${PORT}     ║
║  WebSocket: ws://localhost:${PORT}    ║
║  Database: SQLite (auto-battler.db)   ║
║                                        ║
║  Ready for battles! ⚔️                 ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = server;
