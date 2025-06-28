"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("payment_records", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "books",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: "USD",
      },
      stripe_payment_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      stripe_session_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
        defaultValue: "PENDING",
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      format: {
        type: Sequelize.ENUM("DIGITAL", "PRINT", "BOTH"),
        defaultValue: "DIGITAL",
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes
    await queryInterface.addIndex("payment_records", ["user_id"]);
    await queryInterface.addIndex("payment_records", ["book_id"]);
    await queryInterface.addIndex("payment_records", ["stripe_payment_id"]);
    await queryInterface.addIndex("payment_records", ["status"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("payment_records");
  },
};
