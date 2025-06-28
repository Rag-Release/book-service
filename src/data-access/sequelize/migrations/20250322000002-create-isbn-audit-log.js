"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "isbn_audit_logs",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          comment: "Unique identifier for audit log entry",
        },
        isbn_certificate_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "Foreign key reference to ISBN certificate",
          references: {
            model: "isbn_certificates",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        performed_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "User ID who performed the action",
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        action: {
          type: Sequelize.ENUM(
            "CREATED",
            "UPDATED",
            "VERIFIED",
            "REJECTED",
            "EXPIRED",
            "REACTIVATED",
            "DEACTIVATED"
          ),
          allowNull: false,
          comment: "Type of action performed on the ISBN certificate",
        },
        previous_values: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
          comment: "Previous values before the change",
        },
        new_values: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
          comment: "New values after the change",
        },
        reason: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "Reason for the action",
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true,
          comment: "IP address from which the action was performed",
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "User agent string of the client",
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          comment: "Timestamp when the audit log entry was created",
        },
      },
      {
        comment: "Audit trail for all actions performed on ISBN certificates",
      }
    );

    // Add indexes for better query performance
    await queryInterface.addIndex("isbn_audit_logs", ["isbn_certificate_id"], {
      name: "idx_isbn_audit_logs_certificate_id",
    });

    await queryInterface.addIndex("isbn_audit_logs", ["performed_by"], {
      name: "idx_isbn_audit_logs_performed_by",
    });

    await queryInterface.addIndex("isbn_audit_logs", ["action"], {
      name: "idx_isbn_audit_logs_action",
    });

    await queryInterface.addIndex("isbn_audit_logs", ["created_at"], {
      name: "idx_isbn_audit_logs_created_at",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("isbn_audit_logs");
  },
};
