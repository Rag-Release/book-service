"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "isbn_certificates",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          comment: "Unique identifier for ISBN certificate",
        },
        book_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "Foreign key reference to the book",
          references: {
            model: "books",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        uploaded_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "User ID who uploaded the certificate",
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        isbn13: {
          type: Sequelize.STRING(17),
          allowNull: false,
          unique: true,
          comment: "ISBN-13 number in 978-XXXXXXXXX format",
        },
        isbn10: {
          type: Sequelize.STRING(13),
          allowNull: true,
          comment: "ISBN-10 number (legacy format)",
        },
        certificate_file_url: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: "S3 URL where the certificate file is stored",
        },
        certificate_file_name: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: "Original name of the uploaded certificate file",
        },
        certificate_file_size: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "Size of the certificate file in bytes",
        },
        certificate_file_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: "MIME type of the certificate file",
        },
        issuing_authority: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: "Organization that issued the ISBN",
        },
        issuing_country: {
          type: Sequelize.STRING(3),
          allowNull: false,
          comment: "ISO country code where ISBN was issued",
        },
        issue_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: "Date when the ISBN was officially issued",
        },
        expiry_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: "Expiry date of the ISBN (if applicable)",
        },
        registration_number: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: "Additional registration number from issuing authority",
        },
        verification_status: {
          type: Sequelize.ENUM("PENDING", "VERIFIED", "REJECTED", "EXPIRED"),
          allowNull: false,
          defaultValue: "PENDING",
          comment: "Current verification status of the ISBN certificate",
        },
        verified_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "Admin user ID who verified the certificate",
        },
        verified_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: "Timestamp when the certificate was verified",
        },
        rejection_reason: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "Reason for rejection if status is REJECTED",
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
          comment: "Additional metadata about the certificate",
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "Additional notes about the ISBN certificate",
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: "Whether the certificate is currently active",
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          comment: "Timestamp when the record was created",
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          comment: "Timestamp when the record was last updated",
        },
      },
      {
        comment:
          "Table storing ISBN certificates and related metadata for books",
      }
    );

    // Add indexes for better query performance
    await queryInterface.addIndex("isbn_certificates", ["book_id"], {
      name: "idx_isbn_certificates_book_id",
    });

    await queryInterface.addIndex("isbn_certificates", ["uploaded_by"], {
      name: "idx_isbn_certificates_uploaded_by",
    });

    await queryInterface.addIndex("isbn_certificates", ["isbn13"], {
      unique: true,
      name: "idx_isbn_certificates_isbn13_unique",
    });

    await queryInterface.addIndex(
      "isbn_certificates",
      ["verification_status"],
      {
        name: "idx_isbn_certificates_verification_status",
      }
    );

    await queryInterface.addIndex("isbn_certificates", ["issue_date"], {
      name: "idx_isbn_certificates_issue_date",
    });

    await queryInterface.addIndex("isbn_certificates", ["is_active"], {
      name: "idx_isbn_certificates_is_active",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("isbn_certificates");
  },
};
