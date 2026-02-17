// backend/utils/characters.js
// Game character definitions and constants

const STARTER_CHARACTERS = [
  {
    id: 1,
    name: 'Flame Knight',
    class: 'Warrior',
    rarity: 'Uncommon',
    hp: 150,
    attack: 25,
    defense: 15,
    speed: 10,
    description: 'A fierce warrior wielding fire magic'
  },
  {
    id: 2,
    name: 'Frost Mage',
    class: 'Mage',
    rarity: 'Uncommon',
    hp: 100,
    attack: 35,
    defense: 8,
    speed: 20,
    description: 'Master of ice and cold spells'
  },
  {
    id: 3,
    name: 'Shadow Rogue',
    class: 'Rogue',
    rarity: 'Common',
    hp: 80,
    attack: 30,
    defense: 5,
    speed: 25,
    description: 'Swift assassin using shadow techniques'
  },
  {
    id: 4,
    name: 'Holy Paladin',
    class: 'Paladin',
    rarity: 'Uncommon',
    hp: 180,
    attack: 20,
    defense: 25,
    speed: 8,
    description: 'Divine protector with healing powers'
  },
  {
    id: 5,
    name: 'Forest Ranger',
    class: 'Ranger',
    rarity: 'Rare',
    hp: 110,
    attack: 28,
    defense: 12,
    speed: 22,
    description: 'Expert archer from the deep forest'
  }
];

const ALL_CHARACTERS = [
  ...STARTER_CHARACTERS,
  {
    id: 6,
    name: 'Death Knight',
    class: 'Necromancer',
    rarity: 'Epic',
    hp: 200,
    attack: 40,
    defense: 20,
    speed: 12,
    description: 'Undead warrior commanding dark forces'
  },
  {
    id: 7,
    name: 'Dragon Lord',
    class: 'Warrior',
    rarity: 'Legendary',
    hp: 300,
    attack: 50,
    defense: 30,
    speed: 15,
    description: 'Ancient dragon in human form'
  },
  {
    id: 8,
    name: 'Arcane Master',
    class: 'Mage',
    rarity: 'Epic',
    hp: 120,
    attack: 50,
    defense: 10,
    speed: 18,
    description: 'Supreme spellcaster of the arcane arts'
  },
  {
    id: 9,
    name: 'Phantom Assassin',
    class: 'Rogue',
    rarity: 'Epic',
    hp: 100,
    attack: 60,
    defense: 8,
    speed: 30,
    description: 'Invisible killer with deadly precision'
  },
  {
    id: 10,
    name: 'Divine Guardian',
    class: 'Paladin',
    rarity: 'Epic',
    hp: 250,
    attack: 30,
    defense: 40,
    speed: 10,
    description: 'Celestial protector of the realm'
  }
];

const RARITY_COLORS = {
  'Common': '#9ca3af',
  'Uncommon': '#10b981',
  'Rare': '#3b82f6',
  'Epic': '#8b5cf6',
  'Legendary': '#f59e0b'
};

const CLASS_COLORS = {
  'Warrior': '#ef4444',
  'Mage': '#3b82f6',
  'Rogue': '#8b5cf6',
  'Paladin': '#fbbf24',
  'Ranger': '#10b981',
  'Necromancer': '#6b7280'
};

// Damage calculation
function calculateDamage(attacker, defender) {
  const baseDamage = attacker.attack - (defender.defense * 0.5);
  const variance = 1 + (Math.random() - 0.5) * 0.2; // ±10%
  const damage = Math.max(1, Math.floor(baseDamage * variance));
  return damage;
}

// Hit chance calculation
function calculateHitChance(attacker, defender) {
  const baseHit = 85;
  const speedBonus = (attacker.speed - defender.speed);
  const hitChance = baseHit + speedBonus;
  return Math.min(99, Math.max(1, hitChance));
}

// Combat simulation
function simulateCombat(team1, team2) {
  const log = [];
  let team1HP = team1.reduce((sum, c) => sum + c.hp, 0);
  let team2HP = team2.reduce((sum, c) => sum + c.hp, 0);
  
  let round = 0;
  while (team1HP > 0 && team2HP > 0 && round < 10) {
    round++;
    
    // Team 1 attacks
    if (Math.random() > 0.5 && team2.length > 0) {
      const attacker = team1[Math.floor(Math.random() * team1.length)];
      const defender = team2[Math.floor(Math.random() * team2.length)];
      const damage = calculateDamage(attacker, defender);
      team2HP -= damage;
      log.push(`Round ${round}: ${attacker.name} attacks ${defender.name} for ${damage} damage`);
    }
    
    // Team 2 attacks
    if (Math.random() > 0.5 && team1.length > 0) {
      const attacker = team2[Math.floor(Math.random() * team2.length)];
      const defender = team1[Math.floor(Math.random() * team1.length)];
      const damage = calculateDamage(attacker, defender);
      team1HP -= damage;
      log.push(`Round ${round}: ${attacker.name} attacks ${defender.name} for ${damage} damage`);
    }
  }
  
  return {
    winner: team1HP > team2HP ? 'team1' : 'team2',
    log,
    team1HP,
    team2HP
  };
}

module.exports = {
  STARTER_CHARACTERS,
  ALL_CHARACTERS,
  RARITY_COLORS,
  CLASS_COLORS,
  calculateDamage,
  calculateHitChance,
  simulateCombat
};
