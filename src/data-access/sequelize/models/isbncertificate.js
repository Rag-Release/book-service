"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IsbnCertificate extends Model {
    static associate(models) {
      // Associate with Book model
      if (models.Book) {
        IsbnCertificate.belongsTo(models.Book, {
          foreignKey: "bookId",
          as: "book",
        });
      }

      // Associate with User model for uploader
      if (models.User) {
        IsbnCertificate.belongsTo(models.User, {
          foreignKey: "uploadedBy",
          as: "uploader",
        });
      }

      // Associate with User model for verifier
      if (models.User) {
        IsbnCertificate.belongsTo(models.User, {
          foreignKey: "verifiedBy",
          as: "verifier",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        bookId: this.bookId,
        isbn13: this.isbn13,
        isbn10: this.isbn10,
        title: this.title,
        authorName: this.authorName,
        publisherName: this.publisherName,
        publicationDate: this.publicationDate,
        issuingAuthority: this.issuingAuthority,
        countryCode: this.countryCode,
        language: this.language,
        format: this.format,
        certificateType: this.certificateType,
        issueDate: this.issueDate,
        status: this.status,
        isActive: this.isActive,
        createdAt: this.createdAt,
        tags: this.tags,
      };
    }

    getDetailedInfo() {
      return {
        ...this.getPublicInfo(),
        uploadedBy: this.uploadedBy,
        expiryDate: this.expiryDate,
        registrationNumber: this.registrationNumber,
        fileName: this.fileName,
        fileUrl: this.fileUrl,
        fileSize: this.fileSize,
        mimeType: this.mimeType,
        documentPages: this.documentPages,
        verificationMethod: this.verificationMethod,
        verifiedBy: this.verifiedBy,
        verifiedAt: this.verifiedAt,
        rejectionReason: this.rejectionReason,
        notes: this.notes,
        metadata: this.metadata,
        updatedAt: this.updatedAt,
        uploader: this.uploader
          ? {
              id: this.uploader.id,
              username: this.uploader.username,
              firstName: this.uploader.firstName,
              lastName: this.uploader.lastName,
            }
          : null,
        verifier: this.verifier
          ? {
              id: this.verifier.id,
              username: this.verifier.username,
              firstName: this.verifier.firstName,
              lastName: this.verifier.lastName,
            }
          : null,
      };
    }

    isPending() {
      return this.status === "PENDING";
    }

    isVerified() {
      return this.status === "VERIFIED";
    }

    isApproved() {
      return this.status === "APPROVED";
    }

    isRejected() {
      return this.status === "REJECTED";
    }

    isExpired() {
      return (
        this.status === "EXPIRED" ||
        (this.expiryDate && new Date() > this.expiryDate)
      );
    }

    canBeVerified() {
      return ["PENDING"].includes(this.status);
    }

    canBeApproved() {
      return ["VERIFIED"].includes(this.status);
    }
  }

  IsbnCertificate.init(
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
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Uploaded by user ID is required" },
          isInt: { msg: "Uploaded by user ID must be an integer" },
        },
      },
      isbn13: {
        type: DataTypes.STRING(17),
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: "ISBN-13 is required" },
          notEmpty: { msg: "ISBN-13 cannot be empty" },
          len: {
            args: [13, 17],
            msg: "ISBN-13 must be 13-17 characters including hyphens",
          },
          isValidIsbn13(value) {
            const cleanIsbn = value.replace(/-/g, "");
            if (!/^\d{13}$/.test(cleanIsbn)) {
              throw new Error("ISBN-13 must contain exactly 13 digits");
            }
          },
        },
      },
      isbn10: {
        type: DataTypes.STRING(13),
        allowNull: true,
        validate: {
          len: {
            args: [10, 13],
            msg: "ISBN-10 must be 10-13 characters including hyphens",
          },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Title is required" },
          notEmpty: { msg: "Title cannot be empty" },
          len: {
            args: [1, 500],
            msg: "Title must be between 1 and 500 characters",
          },
        },
      },
      authorName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Author name is required" },
          notEmpty: { msg: "Author name cannot be empty" },
          len: {
            args: [1, 200],
            msg: "Author name must be between 1 and 200 characters",
          },
        },
      },
      publisherName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 200],
            msg: "Publisher name cannot exceed 200 characters",
          },
        },
      },
      publicationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      issuingAuthority: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Issuing authority is required" },
          notEmpty: { msg: "Issuing authority cannot be empty" },
          len: {
            args: [1, 200],
            msg: "Issuing authority must be between 1 and 200 characters",
          },
        },
      },
      countryCode: {
        type: DataTypes.STRING(3),
        allowNull: true,
        validate: {
          len: {
            args: [2, 3],
            msg: "Country code must be 2 or 3 characters",
          },
        },
      },
      language: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: {
            args: [0, 50],
            msg: "Language cannot exceed 50 characters",
          },
        },
      },
      format: {
        type: DataTypes.ENUM(
          "HARDCOVER",
          "PAPERBACK",
          "EBOOK",
          "AUDIOBOOK",
          "OTHER"
        ),
        allowNull: false,
        defaultValue: "PAPERBACK",
      },
      certificateType: {
        type: DataTypes.ENUM("ORIGINAL", "DUPLICATE", "AMENDED", "PROVISIONAL"),
        allowNull: false,
        defaultValue: "ORIGINAL",
      },
      issueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: { msg: "Issue date is required" },
          isDate: { msg: "Must be a valid date" },
        },
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: "Must be a valid date" },
          isAfterIssueDate(value) {
            if (value && this.issueDate && value <= this.issueDate) {
              throw new Error("Expiry date must be after issue date");
            }
          },
        },
      },
      registrationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 100],
            msg: "Registration number cannot exceed 100 characters",
          },
        },
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "File name is required" },
          notEmpty: { msg: "File name cannot be empty" },
        },
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "File URL is required" },
          isUrl: { msg: "Must be a valid URL" },
        },
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: "File size is required" },
          min: { args: [1], msg: "File size must be greater than 0" },
        },
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "MIME type is required" },
          isIn: {
            args: [
              ["application/pdf", "image/jpeg", "image/png", "image/tiff"],
            ],
            msg: "MIME type must be PDF or supported image format",
          },
        },
      },
      documentPages: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: { args: [1], msg: "Document pages must be at least 1" },
        },
      },
      checksum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "VERIFIED",
          "APPROVED",
          "REJECTED",
          "EXPIRED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
      verificationMethod: {
        type: DataTypes.ENUM("MANUAL", "API", "OCR", "AUTOMATED"),
        allowNull: true,
      },
      verifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Verified by must be an integer" },
        },
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 2000],
            msg: "Rejection reason cannot exceed 2000 characters",
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 3000],
            msg: "Notes cannot exceed 3000 characters",
          },
        },
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "IsbnCertificate",
      tableName: "IsbnCertificates",
      timestamps: true,
      indexes: [
        { fields: ["bookId"] },
        { fields: ["uploadedBy"] },
        { fields: ["isbn13"], unique: true },
        { fields: ["isbn10"] },
        { fields: ["status"] },
        { fields: ["issuingAuthority"] },
        { fields: ["issueDate"] },
        { fields: ["verifiedBy"] },
        { fields: ["isActive"] },
        { fields: ["createdAt"] },
      ],
    }
  );

  return IsbnCertificate;
};
