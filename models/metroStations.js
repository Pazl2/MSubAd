const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MetroStations', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    opening_year: { type: DataTypes.INTEGER, allowNull: false },
    passenger_flow: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    line_id: { type: DataTypes.BIGINT, allowNull: true }
  }, {
    tableName: 'metrostations',
    timestamps: false
  });
};
