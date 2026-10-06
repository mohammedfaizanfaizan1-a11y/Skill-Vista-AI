const { sequelize, DataTypes } = require('./db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'student' },
  xp: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Scholarship = sequelize.define('Scholarship', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: DataTypes.STRING,
  provider: DataTypes.STRING,
  amount: DataTypes.INTEGER,
  deadline: DataTypes.DATE,
  eligibility: DataTypes.TEXT,
  location: DataTypes.STRING,
  category: DataTypes.STRING,
  education_level: DataTypes.STRING,
  application_link: DataTypes.STRING,
  verified: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const WellnessLog = sequelize.define('WellnessLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  mood: DataTypes.STRING,
  stress_level: DataTypes.INTEGER,
  date: DataTypes.DATE
});

const CareerPath = sequelize.define('CareerPath', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  resources: DataTypes.JSON
});

// Relationships
User.hasMany(WellnessLog);
WellnessLog.belongsTo(User);

User.hasMany(CareerPath);
CareerPath.belongsTo(User);

module.exports = { User, Scholarship, WellnessLog, CareerPath };
