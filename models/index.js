const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const { DataTypes } = Sequelize;

const User = require('./user')(sequelize, DataTypes);
const Line = require('./line')(sequelize, DataTypes);
const MetroStation = require('./metroStations')(sequelize, DataTypes);
const AdType = require('./adType')(sequelize, DataTypes);
const Train = require('./trains')(sequelize, DataTypes);
const AdSpace = require('./adSpace')(sequelize, DataTypes);
const Template = require('./template')(sequelize, DataTypes);

// Associations
Line.hasMany(MetroStation, { foreignKey: 'line_id' });
MetroStation.belongsTo(Line, { foreignKey: 'line_id' });

Line.hasMany(Train, { foreignKey: 'line_id' });
Train.belongsTo(Line, { foreignKey: 'line_id' });

MetroStation.hasMany(AdSpace, { foreignKey: 'station_id' });
AdSpace.belongsTo(MetroStation, { foreignKey: 'station_id' });

Train.hasMany(AdSpace, { foreignKey: 'train_id' });
AdSpace.belongsTo(Train, { foreignKey: 'train_id' });

AdType.hasMany(AdSpace, { foreignKey: 'type_id' });
AdSpace.belongsTo(AdType, { foreignKey: 'type_id' });

// Template associations
Template.belongsTo(AdType, { foreignKey: 'type_id', as: 'AdType' });
AdType.hasMany(Template, { foreignKey: 'type_id' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Line,
  MetroStation,
  AdType,
  Train,
  AdSpace,
  Template
};
