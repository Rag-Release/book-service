"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("IsbnCertificates", {
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
        comment: "Associated book ID",
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "User who uploaded the certificate",
      },
      isbn13: {
        type: Sequelize.STRING(17),
        allowNull: false,
        unique: true,
        comment: "ISBN-13 number",
      },
      isbn10: {
        type: Sequelize.STRING(13),
        allowNull: true,
        comment: "ISBN-10 number (if applicable)",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Book title as per certificate",
      },
      authorName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Author name as per certificate",
      },
      publisherName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Publisher name",
      },
      publicationDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Publication date",
      },
      issuingAuthority: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Authority that issued the ISBN",
      },
      countryCode: {
        type: Sequelize.STRING(3),
        allowNull: true,
        comment: "Country of publication",
      },
      language: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Primary language of the book",
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
        comment: "Format of the publication",
      },
      certificateType: {
        type: Sequelize.ENUM("ORIGINAL", "DUPLICATE", "AMENDED", "PROVISIONAL"),
        allowNull: false,
        defaultValue: "ORIGINAL",
        comment: "Type of certificate",
      },
      issueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Date when ISBN was issued",
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Expiry date if applicable",
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Registration number from issuing authority",
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Original filename of uploaded certificate",
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "S3 URL of the certificate file",
      },
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "File size in bytes",
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "MIME type of the uploaded file",
      },
      documentPages: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Number of pages in the document",
      },
      checksum: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "File checksum for integrity verification",
      },
      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "VERIFIED",
          "APPROVED",
          "REJECTED",
          "EXPIRED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
        comment: "Verification status of the certificate",
      },
      verificationMethod: {
        type: Sequelize.ENUM("MANUAL", "API", "OCR", "AUTOMATED"),
        allowNull: true,
        comment: "Method used for verification",
      },
      verifiedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "User who verified the certificate",
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Timestamp of verification",
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Reason for rejection if status is REJECTED",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional notes or comments",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Additional metadata and extracted information",
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Tags for categorization and search",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Whether this certificate is currently active",
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

    // Add indexes for better query performance
    await queryInterface.addIndex("IsbnCertificates", ["bookId"]);
    await queryInterface.addIndex("IsbnCertificates", ["uploadedBy"]);
    await queryInterface.addIndex("IsbnCertificates", ["isbn13"], {
      unique: true,
    });
    await queryInterface.addIndex("IsbnCertificates", ["isbn10"]);
    await queryInterface.addIndex("IsbnCertificates", ["status"]);
    await queryInterface.addIndex("IsbnCertificates", ["issuingAuthority"]);
    await queryInterface.addIndex("IsbnCertificates", ["issueDate"]);
    await queryInterface.addIndex("IsbnCertificates", ["verifiedBy"]);
    await queryInterface.addIndex("IsbnCertificates", ["isActive"]);
    await queryInterface.addIndex("IsbnCertificates", ["createdAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("IsbnCertificates");
  },
};
