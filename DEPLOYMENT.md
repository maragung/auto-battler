# 🚀 Deployment Guide - Auto Battler

Production deployment instructions for Auto Battler frontend and backend.

## Frontend Deployment

### Option 1: Vercel (Recommended - Free Tier Available)

**Benefits:** Zero-config, auto-deploys from Git, free HTTPS

```bash
# Install Vercel CLI
npm install -g vercel

# From frontend directory
vercel

# Follow prompts, project will deploy to [name].vercel.app
```

**Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_WS_URL": "@ws_url"
  }
}
```

### Option 2: Netlify

**Benefits:** Easy deployment, good performance, free SSL

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Or connect Git repository for auto-deploy
netlify init
```

**Environment variables:**
1. Go to Site Settings > Build & Deploy > Environment
2. Add:
   - `VITE_API_URL=https://api.yourdomain.com`
   - `VITE_WS_URL=wss://api.yourdomain.com`

### Option 3: AWS S3 + CloudFront

```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 4: GitHub Pages

```bash
# Update vite.config.js
export default {
  base: '/auto-battler/',
  // ... rest of config
}

# Build and deploy
npm run build
gh-pages -d dist
```

---

## Backend Deployment

### Option 1: Heroku (Easiest - Credit Card Required)

```bash
# Create Heroku app
heroku create your-app-name

# Add environment variables
heroku config:set JWT_SECRET=your-random-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

**Procfile (create in backend directory):**
```
web: node server.js
```

### Option 2: DigitalOcean App Platform

1. Connect GitHub repository
2. Create new app from `BACKEND_STARTER.js`
3. Set environment variables in dashboard
4. Deploy

**Cost:** $5/month

### Option 3: AWS EC2

```bash
# SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <repo-url>
cd auto-battler-backend

# Install PM2 for process management
npm install -g pm2

# Start server with PM2
PM2_HOME="~/.pm2" pm2 start server.js --name "auto-battler"
pm2 startup
pm2 save

# Set up Nginx as reverse proxy
sudo apt-get install nginx
# Edit /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Railway

1. Sign up at railway.app
2. Create new project
3. Connect GitHub
4. Add environment variables
5. Deploy

**Cost:** Pay-as-you-go (free tier available)

### Option 5: Render

```bash
# Create render.yaml in root
# Connect GitHub repository
# Render auto-deploys on push
```

---

## Database Setup (Production)

### MongoDB Atlas (Cloud)

```bash
# Sign up at mongodb.com/cloud

# Get connection string
mongodb+srv://username:password@cluster.mongodb.net/auto-battler?retryWrites=true&w=majority

# Update backend environment
export DATABASE_URL="mongodb+srv://..."
```

### PostgreSQL + Sequelize

```bash
npm install sequelize pg pg-hstore

# Create models
npx sequelize-cli init
```

**User Model Example:**
```javascript
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    characters: DataTypes.JSON,
    wins: DataTypes.INTEGER,
    losses: DataTypes.INTEGER,
  });
  return User;
};
```

---

## SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
# Using Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

### CloudFlare (Easy)

1. Add domain to CloudFlare
2. Update DNS nameservers
3. Enable SSL (automatic with free tier)

---

## Environment Variables (Production)

**.env.production**
```env
# Server
PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# Database
DATABASE_URL=mongodb+srv://user:pass@host/db

# Authentication
JWT_SECRET=generate-strong-random-secret-here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# CORS
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id
```

---

## Performance Optimization

### Frontend

```bash
# Analyze bundle size
npm run build
npm install -D rollup-plugin-visualizer

# Optimize images
npm install -D imagemin-webpack-plugin

# Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'))
```

### Backend

```javascript
// Add caching
const redis = require('redis');
const client = redis.createClient();

// Compression
const compression = require('compression');
app.use(compression());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Connection pooling
const pool = new Pool({
  max: 20,
  min: 5,
  idle: 30000,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});
```

---

## Monitoring & Logging

### Server Logs

```bash
# View production logs
heroku logs --tail  # Heroku
pm2 logs            # Local/EC2
docker logs -f app  # Docker
```

### Error Tracking (Sentry)

```bash
npm install @sentry/node

# In server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

### Analytics

```javascript
// Frontend - Track user actions
const trackEvent = (name, data) => {
  fetch('https://analytics.yourdomain.com/track', {
    method: 'POST',
    body: JSON.stringify({ name, data, timestamp: Date.now() })
  });
};
```

---

## Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS/WSS (SSL certificates)
- [ ] Set secure CORS headers
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Enable CSRF protection
- [ ] Use security headers (helmet.js)
- [ ] Regular security patches and updates
- [ ] Database backups (daily minimum)
- [ ] Monitor for vulnerabilities

### Helmet.js Setup

```javascript
const helmet = require('helmet');
app.use(helmet());

// Custom security headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
}));
```

---

## Scaling

### Horizontal Scaling (Multiple Servers)

1. **Load Balancer** (Nginx, HAProxy, or AWS ELB)
   - Distribute traffic across multiple backend servers
   
2. **Session Management**
   ```javascript
   // Use Redis for session storage
   const RedisStore = require("connect-redis").default
   const store = new RedisStore({ client: redis })
   ```

3. **WebSocket Scaling**
   ```javascript
   // With Socket.IO adapter for clustering
   const Redis = require("socket.io-redis");
   io.adapter(Redis({ host: "localhost", port: 6379 }));
   ```

### Database Scaling

```javascript
// Read replicas for read-heavy operations
const readDB = sequelize.replica()
```

---

## Continuous Deployment

### GitHub Actions Example

**.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          npm install
          npm run build
          npm run deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

---

## Rollback Plan

1. Keep previous version tagged
   ```bash
   git tag v1.0.0
   git tag v1.0.1
   ```

2. Quick rollback
   ```bash
   git checkout v1.0.0
   npm run build
   npm run deploy
   ```

3. Database migration rollback
   ```bash
   npm run migrate:down
   ```

---

## Cost Optimization

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Frontend) | Free | Generous free tier |
| Heroku (Backend) | $7/month+ | Was free, now paid |
| DigitalOcean | $5/month+ | Cheapest reliable option |
| MongoDB Atlas | Free | 512MB cloud database |
| CloudFlare | Free | DDoS protection, caching |
| **Total** | **$12-15/month** | For full stack |

---

## Traffic Estimation

- **Peak Users:** 1,000 CCU
- **Backend CPU:** t2.micro (512 MB) for up to 200 users
- **Database:** MongoDB free tier (512 MB) for up to 10,000 records
- **Bandwidth:** ~50 GB/month for 1M API requests

---

## Maintenance

### Daily
- Monitor error logs
- Check server health
- Verify WebSocket connections

### Weekly
- Database backups
- Security updates check
- Performance metrics review

### Monthly
- Database optimization
- Code dependencies update
- Scaling assessment

---

## Support & Troubleshooting

- **High CPU:** Add more server instances
- **Memory leak:** Restart server with PM2
- **Database slow:** Add indexes, optimize queries
- **WebSocket disconnections:** Increase heartbeat timeout
- **CORS issues:** Check frontend/backend domains

---

**Deployment Checklist:**
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and running
- [ ] WebSocket working (test in console)
- [ ] Emails/notifications working
- [ ] Database backups automated
- [ ] Monitoring/logging active
- [ ] SSL certificates valid
- [ ] Performance acceptable
- [ ] Security headers set
- [ ] Documentation updated

---

For support and updates, check the GitHub repository regularly! 🚀
