// backend/db.js
// SQLite Database Configuration with Sequelize ORM

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'auto-battler.db'),
  logging: false // Set to console.log for debugging
});

// ============ MODELS ============

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: true,
  updatedAt: false
});

// Character Model
const Character = sequelize.define('Character', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  characterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to game character ID (1-10)'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rarity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  attack: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defense: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  speed: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] }
  ]
});

// Match Model
const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  player1Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  player2Id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  player1Team: {
    type: DataTypes.JSON,
    allowNull: true
  },
  player2Team: {
    type: DataTypes.JSON,
    allowNull: true
  },
  winner: {
    type: DataTypes.UUID,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'waiting', // waiting, active, completed
    validate: {
      isIn: [['waiting', 'active', 'completed']]
    }
  },
  battleLog: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: true,
  updatedAt: false
});

// ============ ASSOCIATIONS ============

User.hasMany(Character, { foreignKey: 'userId', onDelete: 'CASCADE' });
Character.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Match, { foreignKey: 'player1Id', as: 'matchesAsPlayer1', onDelete: 'CASCADE' });
User.hasMany(Match, { foreignKey: 'player2Id', as: 'matchesAsPlayer2', onDelete: 'CASCADE' });

// ============ DATABASE INITIALIZATION ============

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established');

    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');

    // Check if we need to seed starter characters
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('📊 Database is empty - ready for data');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// ============ EXPORTS ============

module.exports = {
  sequelize,
  User,
  Character,
  Match,
  initializeDatabase
};
