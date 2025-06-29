"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Books", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
          "IN_REVIEW",
          "APPROVED",
          "PUBLISHED",
          "REJECTED"
        ),
        allowNull: false,
        defaultValue: "DRAFT",
      },
      coverUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      certificateUrl: {
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
      publishingMethod: {
        type: Sequelize.ENUM("TRADITIONAL", "SELF_PUBLISHED", "DIGITAL"),
        allowNull: true,
        defaultValue: "DIGITAL",
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      averageRating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0,
      },
      totalReviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalSales: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    // Add indexes safely
    try {
      await queryInterface.addIndex("Books", ["authorId"]);
    } catch (error) {
      console.log("Index on authorId already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Books", ["status"]);
    } catch (error) {
      console.log("Index on status already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Books", ["genre"]);
    } catch (error) {
      console.log("Index on genre already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Books", ["publishedAt"]);
    } catch (error) {
      console.log("Index on publishedAt already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Books", ["isbn"], { unique: true });
    } catch (error) {
      console.log("Index on isbn already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Books", ["averageRating"]);
    } catch (error) {
      console.log("Index on averageRating already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Books", ["totalSales"]);
    } catch (error) {
      console.log("Index on totalSales already exists, skipping...");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Books");
  },
};
