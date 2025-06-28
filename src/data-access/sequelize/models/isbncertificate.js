"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ISBNCertificate extends Model {
    static associate(models) {
      // Belongs to Book (using correct snake_case foreign key)
      ISBNCertificate.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
      });

      // Many-to-One relationship: One user (author/admin) uploads the certificate
      ISBNCertificate.belongsTo(models.User, {
        foreignKey: "uploaded_by",
        as: "uploader",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      // Many-to-One relationship: One user verifies the certificate
      ISBNCertificate.belongsTo(models.User, {
        foreignKey: "verified_by",
        as: "verifier",
      });

      // Has many audit logs
      ISBNCertificate.hasMany(models.ISBNAuditLog, {
        foreignKey: "isbn_certificate_id",
        as: "audit_logs",
      });
    }

    // Instance methods
    isExpired() {
      if (!this.expiry_date) return false;
      return new Date() > new Date(this.expiry_date);
    }

    canBeVerified() {
      return this.verification_status === "PENDING" && !this.isExpired();
    }

    toPublicJSON() {
      return {
        id: this.id,
        book_id: this.book_id,
        isbn13: this.isbn13,
        isbn10: this.isbn10,
        issuing_authority: this.issuing_authority,
        issuing_country: this.issuing_country,
        issue_date: this.issue_date,
        expiry_date: this.expiry_date,
        verification_status: this.verification_status,
        verified_at: this.verified_at,
        is_active: this.is_active,
        created_at: this.created_at,
      };
    }
  }

  ISBNCertificate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isbn13: {
        type: DataTypes.STRING(17),
        allowNull: false,
        unique: true,
        validate: {
          isISBN13(value) {
            if (!/^978-\d{1}-\d{3}-\d{5}-\d{1}$/.test(value)) {
              throw new Error(
                "Invalid ISBN-13 format. Expected: 978-X-XXX-XXXXX-X"
              );
            }
          },
        },
      },
      isbn10: {
        type: DataTypes.STRING(13),
        allowNull: true,
        validate: {
          isISBN10(value) {
            if (value && !/^\d{1}-\d{3}-\d{5}-[\dX]$/.test(value)) {
              throw new Error(
                "Invalid ISBN-10 format. Expected: X-XXX-XXXXX-X"
              );
            }
          },
        },
      },
      certificate_file_url: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      certificate_file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      certificate_file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10485760, // 10MB limit
        },
      },
      certificate_file_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [["application/pdf", "image/jpeg", "image/png", "image/tiff"]],
        },
      },
      issuing_authority: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      issuing_country: {
        type: DataTypes.STRING(3),
        allowNull: false,
        validate: {
          isAlpha: true,
          len: [2, 3],
        },
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString(),
        },
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
          isAfterIssueDate(value) {
            if (
              value &&
              this.issue_date &&
              new Date(value) <= new Date(this.issue_date)
            ) {
              throw new Error("Expiry date must be after issue date");
            }
          },
        },
      },
      registration_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      verification_status: {
        type: DataTypes.ENUM("PENDING", "VERIFIED", "REJECTED", "EXPIRED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        comment: "Timestamp when the record was created",
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        comment: "Timestamp when the record was last updated",
      },
    },
    {
      sequelize,
      modelName: "ISBNCertificate",
      tableName: "isbn_certificates",
      underscored: true,
      timestamps: true,
      hooks: {
        beforeUpdate: async (instance) => {
          // Auto-expire if expiry date is reached
          if (
            instance.expiry_date &&
            new Date() > new Date(instance.expiry_date)
          ) {
            instance.verification_status = "EXPIRED";
          }
        },
      },
    }
  );

  return ISBNCertificate;
};
