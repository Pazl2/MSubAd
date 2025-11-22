// models/adSpace.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('adSpace', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    station_id: { type: DataTypes.BIGINT, allowNull: true },
    train_id: { type: DataTypes.BIGINT, allowNull: true },
    type_id: { type: DataTypes.BIGINT, allowNull: false },
    availability: { type: DataTypes.BOOLEAN, allowNull: false }

  }, {
    tableName: 'ad_space',
    timestamps: false
  });
};