// Character rarities and their probabilities
export const RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
}

// Character classes and their bonuses
export const CHARACTER_CLASSES = {
  WARRIOR: 'warrior',
  MAGE: 'mage',
  ROGUE: 'rogue',
  PALADIN: 'paladin',
  RANGER: 'ranger',
  NECROMANCER: 'necromancer'
}

// Initial characters for new players (5 per account, 10 account bonus)
export const STARTER_CHARACTERS = [
  {
    id: 1,
    name: 'Flame Knight',
    class: CHARACTER_CLASSES.WARRIOR,
    rarity: RARITIES.UNCOMMON,
    hp: 150,
    attack: 25,
    defense: 15,
    speed: 10,
    skills: ['slash', 'fire_burst']
  },
  {
    id: 2,
    name: 'Frost Mage',
    class: CHARACTER_CLASSES.MAGE,
    rarity: RARITIES.UNCOMMON,
    hp: 100,
    attack: 35,
    defense: 8,
    speed: 20,
    skills: ['frost_bolt', 'blizzard']
  },
  {
    id: 3,
    name: 'Shadow Rogue',
    class: CHARACTER_CLASSES.ROGUE,
    rarity: RARITIES.COMMON,
    hp: 80,
    attack: 30,
    defense: 5,
    speed: 25,
    skills: ['backstab', 'shadow_clone']
  },
  {
    id: 4,
    name: 'Holy Paladin',
    class: CHARACTER_CLASSES.PALADIN,
    rarity: RARITIES.UNCOMMON,
    hp: 180,
    attack: 20,
    defense: 25,
    speed: 8,
    skills: ['shield_bash', 'heal']
  },
  {
    id: 5,
    name: 'Forest Ranger',
    class: CHARACTER_CLASSES.RANGER,
    rarity: RARITIES.RARE,
    hp: 110,
    attack: 28,
    defense: 12,
    speed: 22,
    skills: ['arrow_shot', 'multi_shot']
  }
]

export const ALL_CHARACTERS = [
  ...STARTER_CHARACTERS,
  {
    id: 6,
    name: 'Death Knight',
    class: CHARACTER_CLASSES.NECROMANCER,
    rarity: RARITIES.EPIC,
    hp: 200,
    attack: 40,
    defense: 20,
    speed: 12,
    skills: ['death_mark', 'life_drain']
  },
  {
    id: 7,
    name: 'Dragon Lord',
    class: CHARACTER_CLASSES.WARRIOR,
    rarity: RARITIES.LEGENDARY,
    hp: 300,
    attack: 50,
    defense: 30,
    speed: 15,
    skills: ['dragon_breath', 'tail_swing']
  },
  {
    id: 8,
    name: 'Arcane Master',
    class: CHARACTER_CLASSES.MAGE,
    rarity: RARITIES.EPIC,
    hp: 120,
    attack: 50,
    defense: 10,
    speed: 18,
    skills: ['meteor_storm', 'time_warp']
  },
  {
    id: 9,
    name: 'Phantom Assassin',
    class: CHARACTER_CLASSES.ROGUE,
    rarity: RARITIES.EPIC,
    hp: 100,
    attack: 60,
    defense: 8,
    speed: 30,
    skills: ['instant_kill', 'smoke_bomb']
  },
  {
    id: 10,
    name: 'Divine Guardian',
    class: CHARACTER_CLASSES.PALADIN,
    rarity: RARITIES.EPIC,
    hp: 250,
    attack: 30,
    defense: 40,
    speed: 10,
    skills: ['divine_shield', 'mass_heal']
  }
]

// Position indices for 3x3 grid
// 0 1 2
// 3 4 5
// 6 7 8

export const GRID_POSITIONS = {
  BACK_LEFT: 0,
  BACK_CENTER: 1,
  BACK_RIGHT: 2,
  MID_LEFT: 3,
  MID_CENTER: 4,
  MID_RIGHT: 5,
  FRONT_LEFT: 6,
  FRONT_CENTER: 7,
  FRONT_RIGHT: 8
}

export const POSITION_NAMES = {
  0: 'Back Left',
  1: 'Back Center',
  2: 'Back Right',
  3: 'Mid Left',
  4: 'Mid Center',
  5: 'Mid Right', 
  6: 'Front Left',
  7: 'Front Center',
  8: 'Front Right'
}

// Battle calculations
export const calculateDamage = (attacker, defender, isSkill = false) => {
  const baseAttack = isSkill ? attacker.attack * 1.5 : attacker.attack
  const defenseReduction = defender.defense * 0.5
  const variance = Math.random() * 0.2 - 0.1 // -10% to +10%
  const damage = Math.max(1, (baseAttack - defenseReduction) * (1 + variance))
  return Math.round(damage)
}

export const calculateHitChance = (attacker, defender) => {
  const baseHit = 0.85
  const speedDiff = (attacker.speed - defender.speed) * 0.01
  return Math.max(0.5, Math.min(1, baseHit + speedDiff))
}

export const getCharacterById = (id) => {
  return ALL_CHARACTERS.find(char => char.id === id)
}

export const getCharacterStats = (character) => {
  return {
    name: character.name,
    class: character.class,
    rarity: character.rarity,
    hp: character.hp,
    attack: character.attack,
    defense: character.defense,
    speed: character.speed,
    skills: character.skills
  }
}

export const RARITY_COLORS = {
  [RARITIES.COMMON]: '#808080',
  [RARITIES.UNCOMMON]: '#4CAF50',
  [RARITIES.RARE]: '#2196F3',
  [RARITIES.EPIC]: '#9C27B0',
  [RARITIES.LEGENDARY]: '#FF6F00'
}

export const CLASS_COLORS = {
  [CHARACTER_CLASSES.WARRIOR]: '#D32F2F',
  [CHARACTER_CLASSES.MAGE]: '#1976D2',
  [CHARACTER_CLASSES.ROGUE]: '#388E3C',
  [CHARACTER_CLASSES.PALADIN]: '#F57C00',
  [CHARACTER_CLASSES.RANGER]: '#7B1FA2',
  [CHARACTER_CLASSES.NECROMANCER]: '#424242'
}
