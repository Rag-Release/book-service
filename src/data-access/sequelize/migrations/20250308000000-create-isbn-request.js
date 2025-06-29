"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("IsbnRequests", {
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
      publisherId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Book title for ISBN request",
      },
      authorName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Author name as it should appear",
      },
      publisherName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Publisher name for the ISBN",
      },
      format: {
        type: Sequelize.ENUM(
          "HARDCOVER",
          "PAPERBACK",
          "EBOOK",
          "AUDIOBOOK",
          "OTHER"
        ),
        allowNull: false,
        defaultValue: "PAPERBACK",
      },
      publicationDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Expected publication date",
      },
      countryOfPublication: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "USA",
        comment: "Country where book will be published",
      },
      language: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "English",
      },
      genre: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Book description for ISBN application",
      },
      pageCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Estimated number of pages",
      },
      priority: {
        type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
        allowNull: false,
        defaultValue: "MEDIUM",
      },
      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "ASSIGNED",
          "IN_PROGRESS",
          "ACQUIRED",
          "COMPLETED",
          "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
      requestNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Notes from the author",
      },
      publisherNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Notes from the publisher",
      },
      expectedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      assignedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isbnCertificateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "IsbnCertificates",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "ID of the acquired ISBN certificate",
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

    // Add indexes
    await queryInterface.addIndex("IsbnRequests", ["bookId"]);
    await queryInterface.addIndex("IsbnRequests", ["authorId"]);
    await queryInterface.addIndex("IsbnRequests", ["publisherId"]);
    await queryInterface.addIndex("IsbnRequests", ["status"]);
    await queryInterface.addIndex("IsbnRequests", ["priority"]);
    await queryInterface.addIndex("IsbnRequests", ["createdAt"]);
    await queryInterface.addIndex("IsbnRequests", ["isbnCertificateId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("IsbnRequests");
  },
};
