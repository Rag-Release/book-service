"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User can create many books as author
      if (models.Book) {
        User.hasMany(models.Book, {
          foreignKey: "authorId",
          as: "authoredBooks",
        });
      }

      // User can create many cover designs as designer
      if (models.CoverDesign) {
        User.hasMany(models.CoverDesign, {
          foreignKey: "designerId",
          as: "designedCovers",
        });
      }

      // User can upload many cover designs
      if (models.CoverDesign) {
        User.hasMany(models.CoverDesign, {
          foreignKey: "uploadedBy",
          as: "uploadedCoverDesigns",
        });

        // User can approve many cover designs
        User.hasMany(models.CoverDesign, {
          foreignKey: "approvedBy",
          as: "approvedCoverDesigns",
        });
      }

      // User can write many reviews
      if (models.Review) {
        User.hasMany(models.Review, {
          foreignKey: "userId",
          as: "reviews",
        });
      }

      // User can make many payments
      if (models.PaymentRecord) {
        User.hasMany(models.PaymentRecord, {
          foreignKey: "userId",
          as: "payments",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        username: this.username,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,
        isActive: this.isActive,
        createdAt: this.createdAt,
      };
    }

    getFullName() {
      return `${this.firstName} ${this.lastName}`.trim();
    }

    isAuthor() {
      return this.role === "AUTHOR";
    }

    isDesigner() {
      return this.role === "DESIGNER";
    }

    isAdmin() {
      return this.role === "ADMIN";
    }

    canApproveCovers() {
      return ["ADMIN", "PUBLISHER", "EDITOR"].includes(this.role);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: "Username is required" },
          notEmpty: { msg: "Username cannot be empty" },
          len: {
            args: [3, 50],
            msg: "Username must be between 3 and 50 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: "Email is required" },
          isEmail: { msg: "Must be a valid email address" },
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "First name is required" },
          notEmpty: { msg: "First name cannot be empty" },
          len: {
            args: [1, 50],
            msg: "First name must be between 1 and 50 characters",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Last name is required" },
          notEmpty: { msg: "Last name cannot be empty" },
          len: {
            args: [1, 50],
            msg: "Last name must be between 1 and 50 characters",
          },
        },
      },
      role: {
        type: DataTypes.ENUM(
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
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: "Profile image must be a valid URL" },
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: "Bio cannot exceed 1000 characters",
          },
        },
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: "Website must be a valid URL" },
        },
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
      indexes: [
        { fields: ["email"], unique: true },
        { fields: ["username"], unique: true },
        { fields: ["role"] },
        { fields: ["isActive"] },
      ],
    }
  );

  return User;
};
