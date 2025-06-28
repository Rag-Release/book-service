"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentRecord extends Model {
    static associate(models) {
      PaymentRecord.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
      });

      PaymentRecord.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "buyer",
      });
    }
  }

  PaymentRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        defaultValue: "USD",
      },
      stripe_payment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      stripe_session_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
        defaultValue: "PENDING",
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      format: {
        type: DataTypes.ENUM("DIGITAL", "PRINT", "BOTH"),
        defaultValue: "DIGITAL",
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: "PaymentRecord",
      tableName: "payment_records",
      underscored: true,
      timestamps: true,
    }
  );

  return PaymentRecord;
};
