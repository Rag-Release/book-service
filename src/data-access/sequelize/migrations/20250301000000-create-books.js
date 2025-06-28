"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("books", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      synopsis: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      genre: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "DRAFT",
          "UNDER_REVIEW",
          "APPROVED",
          "PUBLISHED",
          "REJECTED"
        ),
        defaultValue: "DRAFT",
      },
      cover_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      certificate_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isbn: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      publishing_method: {
        type: Sequelize.ENUM("TRADITIONAL", "SELF_PUBLISH", "DIGITAL"),
        defaultValue: "DIGITAL",
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // Add missing ISBN-related fields
      isbn_assigned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      current_isbn: {
        type: Sequelize.STRING(17),
        allowNull: true,
      },
      isbn_status: {
        type: Sequelize.ENUM(
          "NOT_REQUESTED",
          "REQUESTED",
          "ASSIGNED",
          "VERIFIED",
          "PUBLISHED"
        ),
        allowNull: false,
        defaultValue: "NOT_REQUESTED",
      },
      requires_isbn: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.addIndex("books", ["author_id"]);
    await queryInterface.addIndex("books", ["status"]);
    await queryInterface.addIndex("books", ["genre"]);
    await queryInterface.addIndex("books", ["isbn"]);
    await queryInterface.addIndex("books", ["published_at"]);
    // Add indexes for new fields
    await queryInterface.addIndex("books", ["isbn_assigned"]);
    await queryInterface.addIndex("books", ["current_isbn"]);
    await queryInterface.addIndex("books", ["isbn_status"]);
    await queryInterface.addIndex("books", ["requires_isbn"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("books");
  },
};
