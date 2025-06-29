"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentRecord extends Model {
    static associate(models) {
      // Payment belongs to a user
      if (models.User) {
        PaymentRecord.belongsTo(models.User, {
          foreignKey: "userId",
          as: "buyer",
        });
      }

      // Payment belongs to a book
      if (models.Book) {
        PaymentRecord.belongsTo(models.Book, {
          foreignKey: "bookId",
          as: "book",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        amount: this.amount,
        currency: this.currency,
        status: this.status,
        format: this.format,
        createdAt: this.createdAt,
      };
    }

    getFullInfo() {
      return {
        id: this.id,
        userId: this.userId,
        bookId: this.bookId,
        amount: this.amount,
        currency: this.currency,
        stripePaymentId: this.stripePaymentId,
        stripeSessionId: this.stripeSessionId,
        status: this.status,
        format: this.format,
        refundAmount: this.refundAmount,
        refundReason: this.refundReason,
        metadata: this.metadata,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }

    isSuccessful() {
      return this.status === "COMPLETED";
    }

    isPending() {
      return this.status === "PENDING";
    }

    isRefunded() {
      return this.status === "REFUNDED";
    }

    canRefund() {
      return this.status === "COMPLETED" && !this.refundAmount;
    }
  }

  PaymentRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User ID is required" },
          isInt: { msg: "User ID must be an integer" },
        },
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Book ID is required" },
          isInt: { msg: "Book ID must be an integer" },
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: "Amount is required" },
          min: { args: [0], msg: "Amount must be non-negative" },
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "USD",
        validate: {
          len: { args: [3, 3], msg: "Currency must be 3 characters" },
        },
      },
      stripePaymentId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      stripeSessionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "PROCESSING",
          "COMPLETED",
          "FAILED",
          "CANCELLED",
          "REFUNDED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
      format: {
        type: DataTypes.ENUM("DIGITAL", "PRINT", "BOTH"),
        allowNull: false,
        defaultValue: "DIGITAL",
      },
      refundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: { args: [0], msg: "Refund amount must be non-negative" },
        },
      },
      refundReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      refundedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional payment metadata from Stripe",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PaymentRecord",
      tableName: "PaymentRecords",
      timestamps: true,
      indexes: [
        { fields: ["userId"] },
        { fields: ["bookId"] },
        { fields: ["status"] },
        { fields: ["stripePaymentId"], unique: true },
        { fields: ["createdAt"] },
        { fields: ["amount"] },
      ],
    }
  );

  return PaymentRecord;
};
