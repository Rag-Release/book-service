"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM(
          "READER",
          "AUTHOR",
          "DESIGNER",
          "EDITOR",
          "PUBLISHER",
          "ADMIN"
        ),
        allowNull: false,
        defaultValue: "READER",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastLoginAt: {
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

    // Add indexes only if they don't exist
    try {
      await queryInterface.addIndex("Users", ["email"], {
        unique: true,
        name: "users_email_unique",
      });
    } catch (error) {
      console.log("Index users_email_unique already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Users", ["username"], {
        unique: true,
        name: "users_username_unique",
      });
    } catch (error) {
      console.log("Index users_username_unique already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Users", ["role"]);
    } catch (error) {
      console.log("Index on role already exists, skipping...");
    }

    try {
      await queryInterface.addIndex("Users", ["isActive"]);
    } catch (error) {
      console.log("Index on isActive already exists, skipping...");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
