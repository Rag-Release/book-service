"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reviews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      type: {
        type: Sequelize.ENUM("READER", "EDITORIAL"),
        allowNull: false,
        defaultValue: "READER",
      },
      status: {
        type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED", "FLAGGED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      helpfulCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reportCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      moderatorNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      moderatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      moderatedAt: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("Reviews", ["bookId"]);
    await queryInterface.addIndex("Reviews", ["userId"]);
    await queryInterface.addIndex("Reviews", ["rating"]);
    await queryInterface.addIndex("Reviews", ["type"]);
    await queryInterface.addIndex("Reviews", ["status"]);
    await queryInterface.addIndex("Reviews", ["isVerified"]);
    await queryInterface.addIndex("Reviews", ["createdAt"]);
    await queryInterface.addIndex("Reviews", ["userId", "bookId", "type"], {
      unique: true,
      name: "unique_user_book_review",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reviews");
  },
};
