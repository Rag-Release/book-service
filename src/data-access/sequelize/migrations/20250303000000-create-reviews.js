"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("reviews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "books",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      review_type: {
        type: Sequelize.ENUM("EDITORIAL", "READER", "PROFESSIONAL"),
        defaultValue: "READER",
      },
      status: {
        type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING",
      },
      verified_purchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      helpful_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.addIndex("reviews", ["book_id"]);
    await queryInterface.addIndex("reviews", ["user_id"]);
    await queryInterface.addIndex("reviews", ["review_type"]);
    await queryInterface.addIndex("reviews", ["rating"]);
    await queryInterface.addIndex("reviews", ["verified_purchase"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("reviews");
  },
};
