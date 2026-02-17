# 🗄️ SQLite Database Setup - Auto Battler

## ✅ Database Installed & Configured

The backend now uses **SQLite** with **Sequelize ORM** for alpha development.

### What Changed

| Aspect | Before | After |
|--------|--------|-------|
| Storage | In-memory arrays | SQLite file (`auto-battler.db`) |
| ORM | None | Sequelize |
| Database | None | SQLite 3 |
| Data Persistence | ❌ Lost on restart | ✅ Persists between restarts |
| Scalability | Manual arrays | SQL queries |

---

## 🚀 Files Added/Modified

### New Files
- `backend/db.js` - Sequelize models (User, Character, Match)
- `backend/utils/characters.js` - Game character data
- `backend/auto-battler.db` - SQLite database (auto-created)

### Modified Files
- `backend/server.js` - Now uses Sequelize instead of arrays
- `backend/package.json` - Added `sequelize` & `sqlite3`

---

## 📋 Database Schema

### Users Table
```sql
CREATE TABLE Users (
  id UUID PRIMARY KEY,
  username STRING UNIQUE,
  email STRING UNIQUE,
  password STRING (hashed with bcrypt),
  wins INTEGER,
  losses INTEGER,
  createdAt TIMESTAMP
);
```

### Characters Table
```sql
CREATE TABLE Characters (
  id INTEGER PRIMARY KEY,
  userId UUID FOREIGN KEY,
  characterId INTEGER,
  name STRING,
  class STRING,
  rarity STRING,
  hp INTEGER,
  attack INTEGER,
  defense INTEGER,
  speed INTEGER,
  level INTEGER,
  experience INTEGER
);
```

### Matches Table
```sql
CREATE TABLE Matches (
  id UUID PRIMARY KEY,
  player1Id UUID,
  player2Id UUID,
  player1Team JSON,
  player2Team JSON,
  winner UUID,
  status STRING (waiting|active|completed),
  battleLog JSON,
  createdAt TIMESTAMP
);
```

---

## ⚙️ Database Configuration

### Environment Variables

**File:** `backend/.env`

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL=sqlite://./auto-battler.db
```

### Sequelize Config

**File:** `backend/db.js`

```javascript
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'auto-battler.db'),
  logging: false
});
```

---

## 🔍 Database Features

### ✅ Automatic Schema Creation
```javascript
await sequelize.sync({ alter: true });
// Automatically creates tables on first run
```

### ✅ Relationships
```javascript
// User → Many Characters
User.hasMany(Character, { foreignKey: 'userId', onDelete: 'CASCADE' });

// User → Many Matches
User.hasMany(Match, { foreignKey: 'player1Id', as: 'matchesAsPlayer1' });
```

### ✅ Indexes for Performance
```javascript
// Faster queries on userId
indexes: [{ fields: ['userId'] }]
```

---

## 🧪 Testing Registration

### Test Flow
1. Start backend: `npm start`
2. Start frontend: `npm run dev`
3. Register new account at http://localhost:5173
4. Backend creates:
   - User record in database
   - 5 starter characters linked to user
5. Data persists in `auto-battler.db`

### Verify Data

**Check database file:**
```bash
ls -lh auto-battler.db
```

**View tables:**
```bash
sqlite3 auto-battler.db ".tables"
```

**Query users:**
```bash
sqlite3 auto-battler.db "SELECT * FROM Users;"
```

---

## 🔄 Data Flow (Registration)

```
Frontend Register Form
       ↓
POST /api/auth/register
       ↓
Backend creates User
       ↓
SQLite: INSERT INTO Users (...)
       ↓
Loop: Create 5 Starter Characters
       ↓
SQLite: INSERT INTO Characters (...)
       ↓
Generate JWT Token
       ↓
Return token to Frontend
       ↓
Frontend stores token in Zustand
```

---

## 📊 Advantages Over In-Memory

| Feature | In-Memory | SQLite |
|---------|-----------|--------|
| Persistence | ❌ Lost on crash | ✅ Survives restarts |
| Multiple servers | ❌ Separate copies | ✅ Shared database |
| Query speed | ✅ Fast | ✅ Fast (local) |
| Data size | ❌ Limited by RAM | ✅ Disk limited |
| Setup | ✅ Easy | ✅ Easy with ORM |
| Production ready | ❌ No | ⚠️ Yes (for alpha) |

---

## 🚀 Future Upgrades

### PostgreSQL (Production)
```javascript
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
```

### MongoDB (Alternative)
```javascript
// Switch ORM to Mongoose or use Sequelize's mongo adapter
// Minimal code changes needed
```

---

## 🐛 Troubleshooting

### Issue: Database locked error
```
Error: SQLITE_BUSY database is locked
```

**Solution:**
```bash
# Kill any process using the database
pkill -f "node server.js"

# Start fresh
npm start
```

### Issue: Characters not saving
**Check:**
```bash
# Verify db.js is being used
grep "require('./db')" server.js

# Check Character import in utils
grep "STARTER_CHARACTERS" server.js
```

### Issue: No database file created
**Solution:**
```bash
# Manually create database directory
mkdir -p backend

# Ensure write permissions
chmod 755 backend

# Run server again
npm start
```

---

## 📈 Performance Tips

### Optimize Queries
```javascript
// Use includes to avoid N+1 queries
User.findByPk(userId, {
  include: [{ model: Character }]
});
```

### Add Indexes
```javascript
// For frequently searched fields
indexes: [
  { fields: ['email'] },
  { fields: ['userId'] }
]
```

### Pagination
```javascript
// Limit results
Character.findAll({
  where: { userId },
  limit: 10,
  offset: 0
});
```

---

## 📚 Additional Resources

- [Sequelize Documentation](https://sequelize.org)
- [SQLite Official](https://www.sqlite.org)
- [Express + Sequelize Tutorial](https://www.bezkoder.com/sequelize-associate-models)
- [Database Design Best Practices](https://dbdiagram.io)

---

## ✅ Status

**Database Setup: COMPLETE**

- ✅ SQLite configured
- ✅ Sequelize ORM integrated
- ✅ Models defined (User, Character, Match)
- ✅ Relationships established
- ✅ Auto schema creation
- ✅ Registration working
- ✅ Data persistence verified

**Ready for alpha testing!** 🎮

