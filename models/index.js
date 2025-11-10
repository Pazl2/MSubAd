const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const { DataTypes } = Sequelize;

const User = require('./user')(sequelize, DataTypes);
const Line = require('./line')(sequelize, DataTypes);
const MetroStation = require('./metroStations')(sequelize, DataTypes);
const AdType = require('./adType')(sequelize, DataTypes);

// Associations
Line.hasMany(MetroStation, { foreignKey: 'lineId' });
MetroStation.belongsTo(Line, { foreignKey: 'lineId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Line,
  MetroStation,
  AdType
};
