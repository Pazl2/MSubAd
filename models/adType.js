// models/adType.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AdType', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    width: { type: DataTypes.INTEGER, allowNull: false },
    height: { type: DataTypes.INTEGER, allowNull: false },
    location: { type: DataTypes.BOOLEAN, allowNull: false },
    base_price: { type: DataTypes.DOUBLE, allowNull: false }
  }, {
    tableName: 'ad_types',
    timestamps: false
  });
};