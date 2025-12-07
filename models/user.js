const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    father_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    registration_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    is_moder: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 }
  }, {
    tableName: 'users',
    timestamps: false
  });
};
