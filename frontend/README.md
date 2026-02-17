# 🎮 Auto Battler - Frontend

Modern React + Vite frontend for the Auto Battler 3D multiplayer PvP game with real-time WebSocket communication.

## 📋 Features

- ⚛️ React 18 with Vite
- 🎨 Responsive UI with CSS Modules
- 🌐 Real-time WebSocket integration
- 🐉 3D Dragon Battle Scene (Three.js + React Three Fiber)
- 🎯 Character Management Dashboard
- ⚔️ 3v3 Grid Battle System
- 📱 Mobile responsive design
- 🔐 JWT authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```
Server runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── BattlePage.jsx
│   ├── components/         # Reusable components
│   │   ├── BattleGrid.jsx
│   │   ├── BattleLog.jsx
│   │   ├── Dragon3D.jsx    # 3D dragon battle component
│   │   └── *.module.css
│   ├── stores/             # Zustand store
│   │   └── index.js
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API client
│   │   ├── websocket.js    # WebSocket client
│   │   └── characters.js   # Game constants
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── package-lock.json
```

## 🎮 Key Features

### Authentication
- User registration
- Email/password login
- JWT token management
- Secure session handling

### Character Management
- Display collection
- Add/Remove characters
- View stats (HP, ATK, DEF, SPD)
- Character filtering and sorting

### 3D Battle System
- Dragon models with Three.js
- Real-time animation
- 3v3 team battles
- Interactive camera controls

### Dashboard
- Character collection
- Unit shop
- Match history
- Player profile

## 🔌 API Integration

### Environment Variables
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/characters`
- `GET /api/battle/units`
- `POST /api/matches/create`

## 🌐 WebSocket Events

**Client → Server:**
- `search_match` - Search for opponent
- `place_unit` - Place character
- `start_battle` - Begin battle

**Server → Client:**
- `match_created` - Opponent found
- `battle_start` - Battle begins
- `battle_update` - Action occurred
- `battle_end` - Battle finished

## 🎨 Styling

- CSS Modules for component scoping
- Global styles in `index.css`
- CSS variables for theming
- Dark theme with purple/indigo gradients
- Responsive design

## 📦 Dependencies

- **react**: UI library
- **vite**: Build tool
- **zustand**: State management
- **axios**: HTTP client
- **ws**: WebSocket
- **three**: 3D graphics
- **@react-three/fiber**: React Three integration
- **@react-three/drei**: 3D utilities

## ⚙️ Configuration

### Vite Config
- React plugin enabled
- Development server on port 5173
- Source maps in development
- Optimized production build

### Zustand Stores
- `useAuthStore` - Authentication state
- `useGameStore` - Game data
- `useBattleStore` - Battle state
- `useUIStore` - UI state

## 🔐 Security

- JWT token authentication
- Secure API calls with Axios
- WebSocket connection validation
- Protected routes
- Input validation

## 📱 Responsive Design

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

Works on all modern browsers.

## 🐛 Troubleshooting

### Build Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Failed
- Ensure backend is running on port 3001
- Check `VITE_WS_URL` in `.env`
- Check firewall settings

### 3D Canvas Not Rendering
- Ensure WebGL is enabled
- Check browser console for errors
- Try updating graphics drivers

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Three.js Documentation](https://threejs.org)
- [Zustand Documentation](https://zustand-demo.vercel.app)

## 📄 License

MIT - Free to use and modify

---

**Happy battling! ⚔️🐉**
