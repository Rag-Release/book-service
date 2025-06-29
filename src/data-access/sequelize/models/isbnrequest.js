"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IsbnRequest extends Model {
    static associate(models) {
      // Associate with Book model
      if (models.Book) {
        IsbnRequest.belongsTo(models.Book, {
          foreignKey: "bookId",
          as: "book",
        });
      }

      // Associate with User model for author
      if (models.User) {
        IsbnRequest.belongsTo(models.User, {
          foreignKey: "authorId",
          as: "author",
        });
      }

      // Associate with User model for publisher
      if (models.User) {
        IsbnRequest.belongsTo(models.User, {
          foreignKey: "publisherId",
          as: "publisher",
        });
      }

      // Associate with IsbnCertificate model
      if (models.IsbnCertificate) {
        IsbnRequest.belongsTo(models.IsbnCertificate, {
          foreignKey: "isbnCertificateId",
          as: "isbnCertificate",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        bookId: this.bookId,
        title: this.title,
        authorName: this.authorName,
        publisherName: this.publisherName,
        format: this.format,
        publicationDate: this.publicationDate,
        countryOfPublication: this.countryOfPublication,
        language: this.language,
        genre: this.genre,
        priority: this.priority,
        status: this.status,
        expectedDeliveryDate: this.expectedDeliveryDate,
        createdAt: this.createdAt,
      };
    }

    getDetailedInfo() {
      return {
        ...this.getPublicInfo(),
        authorId: this.authorId,
        publisherId: this.publisherId,
        description: this.description,
        pageCount: this.pageCount,
        requestNotes: this.requestNotes,
        publisherNotes: this.publisherNotes,
        assignedAt: this.assignedAt,
        completedAt: this.completedAt,
        isbnCertificateId: this.isbnCertificateId,
        updatedAt: this.updatedAt,
        author: this.author
          ? {
              id: this.author.id,
              username: this.author.username,
              firstName: this.author.firstName,
              lastName: this.author.lastName,
            }
          : null,
        publisher: this.publisher
          ? {
              id: this.publisher.id,
              username: this.publisher.username,
              firstName: this.publisher.firstName,
              lastName: this.publisher.lastName,
            }
          : null,
      };
    }

    isPending() {
      return this.status === "PENDING";
    }

    isAssigned() {
      return this.status === "ASSIGNED";
    }

    isCompleted() {
      return this.status === "COMPLETED";
    }

    canBeAssigned() {
      return ["PENDING"].includes(this.status);
    }

    canBeCompleted() {
      return ["IN_PROGRESS", "ACQUIRED"].includes(this.status);
    }
  }

  IsbnRequest.init(
    {
      // ...existing code...
    },
    {
      sequelize,
      modelName: "IsbnRequest",
      tableName: "IsbnRequests",
      timestamps: true,
      indexes: [
        { fields: ["bookId"] },
        { fields: ["authorId"] },
        { fields: ["publisherId"] },
        { fields: ["status"] },
        { fields: ["priority"] },
        { fields: ["createdAt"] },
        { fields: ["isbnCertificateId"] },
      ],
    }
  );

  return IsbnRequest;
};
