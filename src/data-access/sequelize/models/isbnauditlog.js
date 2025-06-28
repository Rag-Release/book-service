"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ISBNAuditLog extends Model {
    static associate(models) {
      ISBNAuditLog.belongsTo(models.ISBNCertificate, {
        foreignKey: "isbn_certificate_id",
        as: "isbn_certificate",
      });

      ISBNAuditLog.belongsTo(models.User, {
        foreignKey: "performed_by",
        as: "performer",
      });
    }

    // Instance methods
    toJSON() {
      return {
        id: this.id,
        isbn_certificate_id: this.isbn_certificate_id,
        performed_by: this.performed_by,
        action: this.action,
        previous_values: this.previous_values,
        new_values: this.new_values,
        reason: this.reason,
        ip_address: this.ip_address,
        user_agent: this.user_agent,
        created_at: this.created_at,
      };
    }
  }

  ISBNAuditLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      isbn_certificate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      performed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: {
        type: DataTypes.ENUM(
          "CREATED",
          "UPDATED",
          "VERIFIED",
          "REJECTED",
          "EXPIRED",
          "REACTIVATED",
          "DEACTIVATED"
        ),
        allowNull: false,
      },
      previous_values: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      new_values: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.INET,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        comment: "Timestamp when the audit log entry was created",
      },
    },
    {
      sequelize,
      modelName: "ISBNAuditLog",
      tableName: "isbn_audit_logs",
      underscored: true,
      timestamps: false,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return ISBNAuditLog;
};
