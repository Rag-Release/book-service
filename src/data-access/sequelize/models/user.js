"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many books as author
      User.hasMany(models.Book, {
        foreignKey: "author_id",
        as: "authored_books",
      });

      // User has many reviews
      User.hasMany(models.Review, {
        foreignKey: "user_id",
        as: "reviews",
      });

      // User has many payment records
      User.hasMany(models.PaymentRecord, {
        foreignKey: "user_id",
        as: "payments",
      });

      // User has many uploaded book files
      User.hasMany(models.BookFile, {
        foreignKey: "uploaded_by",
        as: "uploaded_files",
      });

      // User has many uploaded ISBN certificates
      User.hasMany(models.ISBNCertificate, {
        foreignKey: "uploaded_by",
        as: "uploaded_certificates",
      });

      // User has many verified ISBN certificates
      User.hasMany(models.ISBNCertificate, {
        foreignKey: "verified_by",
        as: "verified_certificates",
      });

      // User has many audit log actions
      User.hasMany(models.ISBNAuditLog, {
        foreignKey: "performed_by",
        as: "audit_actions",
      });
    }

    // Instance methods
    isAuthor() {
      return this.role === "AUTHOR";
    }

    isReviewer() {
      return this.role === "REVIEWER";
    }

    isAdmin() {
      return this.role === "ADMIN";
    }

    canPublish() {
      return ["AUTHOR", "ADMIN", "PUBLISHER"].includes(this.role);
    }

    canReview() {
      return ["REVIEWER", "ADMIN"].includes(this.role);
    }

    canVerifyISBN() {
      return ["ADMIN"].includes(this.role);
    }

    getFullName() {
      return (
        `${this.first_name || ""} ${this.last_name || ""}`.trim() ||
        this.username
      );
    }

    toPublicJSON() {
      return {
        id: this.id,
        username: this.username,
        first_name: this.first_name,
        last_name: this.last_name,
        role: this.role,
        profile_image_url: this.profile_image_url,
        bio: this.bio,
        created_at: this.created_at,
      };
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      external_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
        },
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 100],
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 100],
        },
      },
      role: {
        type: DataTypes.ENUM(
          "AUTHOR",
          "REVIEWER",
          "ADMIN",
          "READER",
          "PUBLISHER"
        ),
        allowNull: false,
        defaultValue: "READER",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      profile_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000],
        },
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
