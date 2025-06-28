"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Book belongs to User (author)
      Book.belongsTo(models.User, {
        foreignKey: "author_id",
        as: "author",
      });

      // Define associations with snake_case foreign keys to match database
      Book.hasMany(models.BookFile, {
        foreignKey: "book_id",
        as: "files",
      });

      Book.hasMany(models.Review, {
        foreignKey: "book_id",
        as: "reviews",
      });

      Book.hasMany(models.PaymentRecord, {
        foreignKey: "book_id",
        as: "purchases",
      });

      Book.hasMany(models.ISBNCertificate, {
        foreignKey: "book_id",
        as: "isbn_certificates",
      });
    }

    // Instance methods
    async getCoverFile() {
      const BookFile = sequelize.models.BookFile;
      return await BookFile.findOne({
        where: {
          book_id: this.id,
          file_type: "COVER",
        },
      });
    }

    async getCertificateFile() {
      const BookFile = sequelize.models.BookFile;
      return await BookFile.findOne({
        where: {
          book_id: this.id,
          file_type: "ISBN_CERTIFICATE",
        },
      });
    }

    async getActiveISBNCertificate() {
      const ISBNCertificate = sequelize.models.ISBNCertificate;
      return await ISBNCertificate.findOne({
        where: {
          book_id: this.id,
          is_active: true,
          verification_status: "VERIFIED",
        },
        order: [["created_at", "DESC"]],
      });
    }

    async getAverageRating() {
      const Review = sequelize.models.Review;
      const result = await Review.findOne({
        where: { book_id: this.id },
        attributes: [
          [sequelize.fn("AVG", sequelize.col("rating")), "average"],
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        ],
        raw: true,
      });

      return {
        average: parseFloat(result.average) || 0,
        total: parseInt(result.total) || 0,
      };
    }

    hasValidISBN() {
      return this.isbn && this.isbn_assigned;
    }

    canBePublished() {
      return (
        this.status === "APPROVED" &&
        this.content &&
        this.title &&
        (!this.requires_isbn || this.hasValidISBN())
      );
    }

    toPublicJSON() {
      const publicData = {
        id: this.id,
        title: this.title,
        synopsis: this.synopsis,
        genre: this.genre,
        status: this.status,
        cover_url: this.cover_url,
        isbn: this.isbn,
        price: this.price,
        publishing_method: this.publishing_method,
        published_at: this.published_at,
      };

      // Only include content excerpt for published books
      if (this.status === "PUBLISHED" && this.content) {
        publicData.excerpt = this.content.substring(0, 500) + "...";
      }

      return publicData;
    }
  }

  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
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
          len: [0, 1000],
        },
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "DRAFT",
          "UNDER_REVIEW",
          "APPROVED",
          "PUBLISHED",
          "REJECTED"
        ),
        defaultValue: "DRAFT",
      },
      cover_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      certificate_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 9999.99,
        },
      },
      publishing_method: {
        type: DataTypes.ENUM("TRADITIONAL", "SELF_PUBLISH", "DIGITAL"),
        defaultValue: "DIGITAL",
      },
      published_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Add missing ISBN-related fields
      isbn_assigned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether an ISBN has been assigned to this book",
      },
      current_isbn: {
        type: DataTypes.STRING(17),
        allowNull: true,
        comment: "Current active ISBN for the book (ISBN-13 format)",
      },
      isbn_status: {
        type: DataTypes.ENUM(
          "NOT_REQUESTED",
          "REQUESTED",
          "ASSIGNED",
          "VERIFIED",
          "PUBLISHED"
        ),
        allowNull: false,
        defaultValue: "NOT_REQUESTED",
        comment: "Current status of ISBN for this book",
      },
      requires_isbn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Whether this book requires an ISBN for publication",
      },
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "books",
      underscored: true,
      timestamps: true,
    }
  );

  return Book;
};
