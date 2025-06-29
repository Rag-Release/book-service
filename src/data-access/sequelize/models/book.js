"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // Book belongs to an author (User)
      if (models.User) {
        Book.belongsTo(models.User, {
          foreignKey: "authorId",
          as: "author",
        });
      }

      // Book has many cover designs
      if (models.CoverDesign) {
        Book.hasMany(models.CoverDesign, {
          foreignKey: "bookId",
          as: "coverDesigns",
        });
      }

      // Book has many reviews
      if (models.Review) {
        Book.hasMany(models.Review, {
          foreignKey: "bookId",
          as: "reviews",
        });
      }

      // Book has many payment records
      if (models.PaymentRecord) {
        Book.hasMany(models.PaymentRecord, {
          foreignKey: "bookId",
          as: "paymentRecords",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        title: this.title,
        synopsis: this.synopsis,
        genre: this.genre,
        status: this.status,
        price: this.price,
        publishingMethod: this.publishingMethod,
        publishedAt: this.publishedAt,
        averageRating: this.averageRating,
        totalReviews: this.totalReviews,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }

    getFullInfo() {
      return {
        id: this.id,
        authorId: this.authorId,
        title: this.title,
        content: this.content,
        synopsis: this.synopsis,
        genre: this.genre,
        status: this.status,
        coverUrl: this.coverUrl,
        certificateUrl: this.certificateUrl,
        isbn: this.isbn,
        price: this.price,
        publishingMethod: this.publishingMethod,
        publishedAt: this.publishedAt,
        averageRating: this.averageRating,
        totalReviews: this.totalReviews,
        totalSales: this.totalSales,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }

    isPublished() {
      return this.status === "PUBLISHED";
    }

    isDraft() {
      return this.status === "DRAFT";
    }

    canBeEdited() {
      return ["DRAFT", "REJECTED"].includes(this.status);
    }
  }

  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Author ID is required" },
          isInt: { msg: "Author ID must be an integer" },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Title is required" },
          notEmpty: { msg: "Title cannot be empty" },
          len: {
            args: [1, 255],
            msg: "Title must be between 1 and 255 characters",
          },
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      synopsis: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 2000],
            msg: "Synopsis cannot exceed 2000 characters",
          },
        },
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 100],
            msg: "Genre cannot exceed 100 characters",
          },
        },
      },
      status: {
        type: DataTypes.ENUM(
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
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: "Cover URL must be a valid URL" },
        },
      },
      certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: "Certificate URL must be a valid URL" },
        },
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: {
            args: [10, 17],
            msg: "ISBN must be between 10 and 17 characters",
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: { args: [0], msg: "Price must be non-negative" },
        },
      },
      publishingMethod: {
        type: DataTypes.ENUM("TRADITIONAL", "SELF_PUBLISHED", "DIGITAL"),
        allowNull: true,
        defaultValue: "DIGITAL",
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Average rating must be non-negative" },
          max: { args: [5], msg: "Average rating cannot exceed 5" },
        },
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Total reviews must be non-negative" },
        },
      },
      totalSales: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Total sales must be non-negative" },
        },
      },
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "Books",
      timestamps: true,
      indexes: [
        { fields: ["authorId"] },
        { fields: ["status"] },
        { fields: ["genre"] },
        { fields: ["publishedAt"] },
        { fields: ["isbn"], unique: true },
        { fields: ["averageRating"] },
        { fields: ["totalSales"] },
      ],
    }
  );

  return Book;
};
