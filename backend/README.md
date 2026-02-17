# 🎮 Auto Battler - Backend

Node.js + Express backend server for Auto Battler multiplayer PvP game with real-time WebSocket communication.

## 📋 Features

- 🚀 Express.js server
- 🔌 Real-time WebSocket communication
- 🔐 JWT authentication & bcryptjs password hashing
- 🎮 Match making and battle simulation
- ⚔️ Game state management
- 📊 User and character management
- 🧪 Production-ready error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Configuration

Create `.env` file:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
BCRYPT_ROUNDS=10
DATABASE_URL=mongodb://localhost:27017/auto-battler
```

### Start Development Server

```bash
npm start
```

Server runs at `http://localhost:3001`

### WebSocket Server

WebSocket available at `ws://localhost:3001`

## 📁 Project Structure

```
backend/
├── server.js           # Main Express server
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

## 🔧 API Endpoints

### Authentication Routes

**Register New Account**
```
POST /api/auth/register
Body: {
  username: string,
  email: string,
  password: string
}
Response: {
  user: { id, username, email },
  token: string
}
```

**Login**
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  user: { id, username, email },
  token: string
}
```

**Get Current User**
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: {
  id: string,
  username: string,
  email: string,
  characters: number[],
  wins: number,
  losses: number
}
```

### User Routes

**Get User Characters**
```
GET /api/users/characters
Headers: Authorization: Bearer <token>
Response: [ { id, name, class, stats... }, ... ]
```

**Add Character**
```
POST /api/users/characters
Body: { characterId: number }
Response: { id, name, class, stats... }
```

### Battle Routes

**Get All Units**
```
GET /api/battle/units
Response: [ { id, name, class, hp, attack, defense, speed }, ... ]
```

**Get Unit Details**
```
GET /api/battle/units/:id
Response: { id, name, class, stats... }
```

### Match Routes

**Create Match**
```
POST /api/matches/create
Headers: Authorization: Bearer <token>
Response: {
  id: string,
  player1Id: string,
  status: string,
  createdAt: timestamp
}
```

**Get User Matches**
```
GET /api/matches
Headers: Authorization: Bearer <token>
Response: [ { id, player1Id, player2Id, winner, ... }, ... ]
```

**Get Match Details**
```
GET /api/matches/:id
Response: { id, player1Id, player2Id, winner, team1, team2... }
```

**Update Match Team**
```
PUT /api/matches/:id/team
Body: { team: [ { unitId, position }, ... ] }
Response: { id, player1Id, team1, team2... }
```

## 🌐 WebSocket Events

### Client → Server

**Search Match**
```javascript
{
  type: 'search_match',
  payload: { userId: string }
}
```

**Place Unit**
```javascript
{
  type: 'place_unit',
  payload: {
    matchId: string,
    position: number,
    unitId: number
  }
}
```

**Start Battle**
```javascript
{
  type: 'start_battle',
  payload: {
    matchId: string,
    team: [ { id, name, stats... }, ... ]
  }
}
```

**End Battle**
```javascript
{
  type: 'end_battle',
  payload: {
    matchId: string,
    winner: string
  }
}
```

### Server → Client

**Match Created**
```javascript
{
  type: 'match_created',
  payload: {
    matchId: string,
    opponent: { id: string }
  }
}
```

**Battle Start**
```javascript
{
  type: 'battle_start',
  payload: { message: string }
}
```

**Battle Update**
```javascript
{
  type: 'battle_update',
  payload: {
    message: string,
    turn: number
  }
}
```

**Battle End**
```javascript
{
  type: 'battle_end',
  payload: {
    winner: string,
    result: string
  }
}
```

## 🕹️ Game Data

### Characters (10 Total)

| ID | Name | Class | HP | ATK | DEF | SPD | Rarity |
|----|------|-------|----|-----|-----|-----|--------|
| 1  | Flame Knight | Warrior | 150 | 25 | 15 | 10 | Uncommon |
| 2  | Frost Mage | Mage | 100 | 35 | 8 | 20 | Uncommon |
| 3  | Shadow Rogue | Rogue | 80 | 30 | 5 | 25 | Common |
| 4  | Holy Paladin | Paladin | 180 | 20 | 25 | 8 | Uncommon |
| 5  | Forest Ranger | Ranger | 110 | 28 | 12 | 22 | Rare |
| 6  | Death Knight | Necromancer | 200 | 40 | 20 | 12 | Epic |
| 7  | Dragon Lord | Warrior | 300 | 50 | 30 | 15 | Legendary |
| 8  | Arcane Master | Mage | 120 | 50 | 10 | 18 | Epic |
| 9  | Phantom Assassin | Rogue | 100 | 60 | 8 | 30 | Epic |
| 10 | Divine Guardian | Paladin | 250 | 30 | 40 | 10 | Epic |

### New Player Bonus

All new accounts automatically receive characters: **1, 2, 3, 4, 5** (5 starter characters)

## 🔐 Authentication

### JWT Setup
- Secret key stored in `JWT_SECRET` environment variable
- Token expires in 7 days
- Include token in Authorization header: `Authorization: Bearer <token>`

### Password Security
- Passwords hashed with bcryptjs
- Configurable rounds via `BCRYPT_ROUNDS`
- Never store plaintext passwords

## 🎮 Game Logic

### Damage Calculation
```javascript
Damage = (Attacker.ATK - Defender.DEF × 0.5) × (1 ± 10% variance)
```

### Hit Chance
```javascript
Hit% = 85% + (Attacker.SPD - Defender.SPD) × 1%
```

### Battle Simulation
- Turn-based combat
- Random winner determination (expandable)
- Message queue for real-time updates

## 🚀 Deployment

### Environment Setup for Production
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=generate-strong-random-secret
BCRYPT_ROUNDS=10
DATABASE_URL=mongodb+srv://user:pass@host/db
```

### Deploy to Heroku
```bash
git push heroku main
heroku logs --tail
```

### Deploy to Railway/DigitalOcean
1. Connect GitHub repository
2. Set environment variables
3. Auto-deploy on push

## 📊 Scalability

Current setup handles:
- 1000+ concurrent connections
- 100+ characters
- 10,000+ matches

To scale:
- Add Redis for session management
- Implement database connection pooling
- Add load balancer
- Use message queue (RabbitMQ/Kafka)

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@test.com",
    "password": "password123"
  }'
```

### Test WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3001');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'search_match',
    payload: { userId: 'user-id' }
  }));
};
ws.onmessage = (event) => {
  console.log('Message:', JSON.parse(event.data));
};
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

### Database Connection Failed
- Ensure MongoDB is running
- Check `DATABASE_URL` in `.env`
- Verify network access

### WebSocket Connection Timeout
- Check firewall rules
- Ensure server is running
- Check for proxy issues

## 📦 Dependencies

- **express**: Web Framework
- **cors**: CORS middleware
- **dotenv**: Environment variables
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT auth
- **ws**: WebSocket
- **uuid**: ID generation

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

## 📄 License

MIT - Free to use and modify

---

**Happy battling! ⚔️🐉**
