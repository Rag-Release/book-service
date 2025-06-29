"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PaymentRecords", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Books",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "USD",
      },
      stripePaymentId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      stripeSessionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
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
        type: Sequelize.ENUM("DIGITAL", "PRINT", "BOTH"),
        allowNull: false,
        defaultValue: "DIGITAL",
      },
      refundAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      refundReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refundedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("PaymentRecords", ["userId"]);
    await queryInterface.addIndex("PaymentRecords", ["bookId"]);
    await queryInterface.addIndex("PaymentRecords", ["status"]);
    await queryInterface.addIndex("PaymentRecords", ["stripePaymentId"], {
      unique: true,
    });
    await queryInterface.addIndex("PaymentRecords", ["createdAt"]);
    await queryInterface.addIndex("PaymentRecords", ["amount"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PaymentRecords");
  },
};
