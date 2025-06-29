"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Review belongs to a book
      if (models.Book) {
        Review.belongsTo(models.Book, {
          foreignKey: "bookId",
          as: "book",
        });
      }

      // Review belongs to a user
      if (models.User) {
        Review.belongsTo(models.User, {
          foreignKey: "userId",
          as: "reviewer",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        bookId: this.bookId,
        rating: this.rating,
        comment: this.comment,
        type: this.type,
        isVerified: this.isVerified,
        isHelpful: this.helpfulCount > 0,
        helpfulCount: this.helpfulCount,
        createdAt: this.createdAt,
        reviewer: this.User
          ? {
              username: this.User.username,
              firstName: this.User.firstName,
            }
          : null,
      };
    }

    getFullInfo() {
      return {
        id: this.id,
        bookId: this.bookId,
        userId: this.userId,
        rating: this.rating,
        comment: this.comment,
        type: this.type,
        status: this.status,
        isVerified: this.isVerified,
        helpfulCount: this.helpfulCount,
        reportCount: this.reportCount,
        moderatorNotes: this.moderatorNotes,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }

    isEditorial() {
      return this.type === "EDITORIAL";
    }

    isReader() {
      return this.type === "READER";
    }
  }

  Review.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Book ID is required" },
          isInt: { msg: "Book ID must be an integer" },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User ID is required" },
          isInt: { msg: "User ID must be an integer" },
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Rating is required" },
          min: { args: [1], msg: "Rating must be at least 1" },
          max: { args: [5], msg: "Rating cannot exceed 5" },
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 5000],
            msg: "Comment cannot exceed 5000 characters",
          },
        },
      },
      type: {
        type: DataTypes.ENUM("READER", "EDITORIAL"),
        allowNull: false,
        defaultValue: "READER",
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "FLAGGED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether the reviewer purchased the book",
      },
      helpfulCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reportCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      moderatorNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      moderatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Moderated by must be an integer" },
        },
      },
      moderatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Reviews",
      timestamps: true,
      indexes: [
        { fields: ["bookId"] },
        { fields: ["userId"] },
        { fields: ["rating"] },
        { fields: ["type"] },
        { fields: ["status"] },
        { fields: ["isVerified"] },
        { fields: ["createdAt"] },
        // Composite index for unique user-book combination for reader reviews
        {
          fields: ["userId", "bookId", "type"],
          unique: true,
          name: "unique_user_book_review",
        },
      ],
    }
  );

  return Review;
};
