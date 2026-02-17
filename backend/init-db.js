#!/usr/bin/env node

/**
 * Auto Database Initialization Script
 * Creates and seeds SQLite database for Auto Battler
 * 
 * Usage:
 *   npm run init-db                # Initialize database
 *   npm run init-db -- --reset     # Reset database (delete and recreate)
 *   npm run init-db -- --seed      # Seed with test data
 */

const path = require('path');
const fs = require('fs');
const { sequelize, User, Character, Match } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

// Parse command line arguments
const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');
const shouldSeed = args.includes('--seed');

async function deleteDatabase() {
  const dbPath = path.join(__dirname, 'auto-battler.db');
  
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      log.success(`Database deleted: ${dbPath}`);
    } catch (error) {
      log.error(`Could not delete database: ${error.message}`);
      throw error;
    }
  }
}

async function initializeDatabase() {
  try {
    log.section('DATABASE INITIALIZATION STARTED');

    // Step 1: Delete database if --reset flag
    if (shouldReset) {
      log.info('Reset flag detected - deleting existing database...');
      await deleteDatabase();
    }

    // Step 2: Authenticate
    log.info('Connecting to SQLite database...');
    await sequelize.authenticate();
    log.success('SQLite database connection established');

    // Step 3: Sync models
    log.info('Syncing database schema...');
    await sequelize.sync({ force: shouldReset });
    log.success('Database models synced successfully');

    // Step 4: Seed database if --seed flag or if empty
    const userCount = await User.count();
    
    if (shouldSeed && userCount > 0) {
      log.warn('Database already contains data. Use --reset --seed to recreate.');
    } else if (shouldSeed || (userCount === 0 && (shouldReset || userCount === 0))) {
      log.section('SEEDING TEST DATA');
      
      // Test users
      const testUsers = [
        {
          id: uuidv4(),
          username: 'player1',
          email: 'player1@test.com',
          password: 'password123',
          wins: 5,
          losses: 2
        },
        {
          id: uuidv4(),
          username: 'player2',
          email: 'player2@test.com',
          password: 'password123',
          wins: 3,
          losses: 4
        },
        {
          id: uuidv4(),
          username: 'testadmin',
          email: 'admin@test.com',
          password: 'admin123',
          wins: 10,
          losses: 0
        }
      ];

      // Hash passwords and create users
      for (const userData of testUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await User.create({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          wins: userData.wins,
          losses: userData.losses
        });
        log.success(`Created test user: ${userData.username}`);

        // Create 5 starter characters for each user
        const starterCharacters = [1, 2, 3, 4, 5];
        const characterData = [
          { id: 1, name: 'Flame Knight', class: 'Warrior', rarity: 'Uncommon', hp: 150, attack: 25, defense: 15, speed: 10 },
          { id: 2, name: 'Frost Mage', class: 'Mage', rarity: 'Uncommon', hp: 100, attack: 35, defense: 8, speed: 20 },
          { id: 3, name: 'Shadow Rogue', class: 'Rogue', rarity: 'Uncommon', hp: 80, attack: 30, defense: 5, speed: 25 },
          { id: 4, name: 'Holy Paladin', class: 'Paladin', rarity: 'Uncommon', hp: 180, attack: 20, defense: 25, speed: 8 },
          { id: 5, name: 'Forest Ranger', class: 'Ranger', rarity: 'Uncommon', hp: 110, attack: 28, defense: 12, speed: 22 }
        ];

        for (const charId of starterCharacters) {
          const char = characterData.find(c => c.id === charId);
          await Character.create({
            userId: user.id,
            characterId: charId,
            name: char.name,
            class: char.class,
            rarity: char.rarity,
            hp: char.hp,
            attack: char.attack,
            defense: char.defense,
            speed: char.speed,
            level: 1,
            experience: 0
          });
        }
        log.success(`Created 5 starter characters for: ${userData.username}`);
      }

      // Create a test match
      const match = await Match.create({
        id: uuidv4(),
        player1Id: testUsers[0].id,
        player2Id: testUsers[1].id,
        status: 'completed',
        winner: testUsers[0].id,
        player1Team: JSON.stringify([1, 2, 3]),
        player2Team: JSON.stringify([4, 5, 1]),
        battleLog: JSON.stringify([
          { turn: 1, event: 'Player 1 attacked!' },
          { turn: 2, event: 'Player 2 defended!' }
        ])
      });
      log.success('Created test match');
    }

    log.section('INITIALIZATION COMPLETE');
    
    // Summary
    const finalUserCount = await User.count();
    const finalCharCount = await Character.count();
    const finalMatchCount = await Match.count();
    
    console.log(`
${colors.cyan}📊 Database Summary:${colors.reset}
   • Total Users: ${finalUserCount}
   • Total Characters: ${finalCharCount}
   • Total Matches: ${finalMatchCount}
${colors.green}✅ Database is ready to use!${colors.reset}

${colors.yellow}📖 Next Steps:${colors.reset}
   1. npm start         # Start the server
   2. npm run dev       # Start frontend (in another terminal)
   3. http://localhost:5173  # Open in browser

${colors.cyan}🔐 Test Accounts (if seeded):${colors.reset}
   • player1@test.com / password123
   • player2@test.com / password123
   • admin@test.com / admin123
    `);

    process.exit(0);

  } catch (error) {
    log.error(`Database initialization failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
