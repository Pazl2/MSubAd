// models/trains.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Trains', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    number: { type: DataTypes.STRING, allowNull: false, unique: true },
    line_id: { type: DataTypes.BIGINT, allowNull: true }
  }, {
    tableName: 'trains',
    timestamps: false
  });
};