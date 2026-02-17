# 🚀 Quick Start Guide - Auto Battler

This guide will get you up and running with the Auto Battler game in minutes!

## Option 1: Frontend Only (Demo Mode)

If you just want to see the frontend UI:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

**Note**: Without a backend, you won't be able to login or play, but you can see the UI.

---

## Option 2: Full Stack Setup (Recommended)

### Prerequisites

- Node.js 16+ installed
- npm installed
- Two separate terminal windows

### Step 1: Set Up Backend

```bash
# Create backend directory (in a separate location)
mkdir auto-battler-backend
cd auto-battler-backend

# Copy backend files
cp ../auto-battler/BACKEND_STARTER.js ./server.js
cp ../auto-battler/BACKEND_PACKAGE.json ./package.json

# Create .env file
cat > .env << 'EOF'
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
BCRYPT_ROUNDS=10
EOF

# Install dependencies
npm install

# Start server
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║  🎮 Auto Battler Server Started       ║
║  Server: http://localhost:3001        ║
║  WebSocket: ws://localhost:3001       ║
╚════════════════════════════════════════╝
```

### Step 2: Set Up Frontend

In a new terminal window, from the `auto-battler` directory:

```bash
# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
EOF

# Start development server
npm run dev
```

Visit `http://localhost:5173`

---

## 🎮 Using the App

### 1. Register a New Account

1. Click "Create New Account"
2. Fill in username, email, password
3. Select 5 starter characters (you'll get all 5 for free as a new player)
4. Click "Create Account"

**Starter Characters:**
- Flame Knight (Warrior)
- Frost Mage (Mage)
- Shadow Rogue (Rogue)
- Holy Paladin (Paladin)
- Forest Ranger (Ranger)

### 2. Dashboard

- View your characters with their stats
- Browse the character shop
- Select a character to battle with
- Click "Start PvP Battle" to search for an opponent

### 3. Battle

1. Place your characters on the 3×3 grid (3 positions max)
2. See opponent's placements in real-time
3. Click "Start Battle" to begin
4. Watch the auto-battle simulation
5. View results and return to dashboard

---

## 🧪 Test Accounts

When you start the server, these test accounts are available:

```
Email: test@example.com
Password: password123

Email: player2@example.com
Password: password123
```

To add more test accounts, restart the server and register new accounts.

---

## 📊 Features Checklist

- ✅ User Authentication (Registration & Login)
- ✅ 5 Starter Characters on Registration
- ✅ Character Collection Management
- ✅ Real-time Multiplayer Matching
- ✅ 3×3 Grid Battle System
- ✅ 3vs3 Team Battles
- ✅ Battle Simulation
- ✅ Battle Log/History
- ✅ Responsive UI

---

## 🐛 Troubleshooting

### "Connection Refused" Error

Make sure the backend is running on `http://localhost:3001`

```bash
# Check if port 3001 is in use
lsof -i :3001
# If needed, change PORT in backend .env file
```

### "Invalid Token" Error

- Clear browser local storage: Open DevTools → Application → Local Storage → Clear All
- Log out and log back in
- Refresh the page

### WebSocket Connection Failed

- Check that backend WebSocket is running
- Verify `VITE_WS_URL` is correct in frontend `.env`
- Check firewall settings (allow port 3001)

### Cannot Find Opponent

This is expected if only one user is searching. Open another browser or incognito window and register a second account, then search from both.

---

## 🌐 Deploying to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production setup instructions.

### Quick Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use a real database (MongoDB, PostgreSQL, etc.)
- [ ] Enable HTTPS/WSS
- [ ] Set up CORS properly for your domain
- [ ] Add rate limiting
- [ ] Set up logging and monitoring
- [ ] Use environment variables for all secrets

---

## 📚 Additional Resources

- [Frontend README](./README.md) - Full frontend documentation
- [Backend Setup](./BACKEND_SETUP.md) - Detailed backend configuration
- [Character Stats](./README.md#-character-stats) - Game balance information
- [API Documentation](./BACKEND_SETUP.md#api-endpoints) - All API endpoints

---

## 🎯 Next Steps

1. **Explore the code** - Check out the components and game logic
2. **Customize characters** - Modify `src/utils/characters.js`
3. **Add more features** - Implement skills, items, or a shop system
4. **Set up database** - Replace in-memory storage with MongoDB or PostgreSQL
5. **Deploy** - Follow the production deployment guide

---

## 💡 Tips

- Use Chrome DevTools to inspect the network tab and WebSocket messages
- Check the browser console for error messages
- Review server logs in the terminal
- Test with multiple browser windows to simulate different players

---

## 📞 Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review the troubleshooting section above
3. Check backend and frontend terminal output
4. Review the generated .env files
5. Try restarting both servers

---

**Happy gaming! May your battles be victorious! ⚔️🎮**

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Express.js Guide](https://expressjs.com)
- [WebSocket Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)
