module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    table_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    operation: {
      type: DataTypes.ENUM('INSERT', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    freezeTableName: true
  });

  return AuditLog;
};
