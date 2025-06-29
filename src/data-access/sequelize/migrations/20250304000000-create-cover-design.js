"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CoverDesigns", {
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
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "ID of the user who uploaded the cover design",
      },
      designerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "ID of the designer (can be different from uploader)",
      },
      designerName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Name of the cover designer",
      },
      designerEmail: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Contact email of the designer",
      },
      designerPortfolio: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Portfolio or website URL of the designer",
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Original filename of the uploaded cover",
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "S3 URL of the cover image",
      },
      thumbnailUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "S3 URL of the thumbnail version",
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
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Image dimensions {width, height}",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Title/name of the cover design",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Detailed description of the cover design",
      },
      designConcept: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Concept and inspiration behind the design",
      },
      colorScheme: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Primary color scheme used",
      },
      style: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Design style (e.g., minimalist, vintage, modern)",
      },
      targetAudience: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Intended target audience for the design",
      },
      designNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional design notes and considerations",
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Version number of the design",
      },
      status: {
        type: Sequelize.ENUM(
          "DRAFT",
          "SUBMITTED",
          "APPROVED",
          "REJECTED",
          "ACTIVE"
        ),
        allowNull: false,
        defaultValue: "DRAFT",
        comment: "Current status of the cover design",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether this is the active cover for the book",
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "ID of the user who approved the design",
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Timestamp when the design was approved",
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Reason for rejection if status is REJECTED",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Additional metadata and technical information",
      },
      requestId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment:
          "ID of the related cover design request (will be linked later)",
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
    await queryInterface.addIndex("CoverDesigns", ["bookId"]);
    await queryInterface.addIndex("CoverDesigns", ["uploadedBy"]);
    await queryInterface.addIndex("CoverDesigns", ["designerId"]);
    await queryInterface.addIndex("CoverDesigns", ["status"]);
    await queryInterface.addIndex("CoverDesigns", ["isActive"]);
    await queryInterface.addIndex("CoverDesigns", ["approvedBy"]);
    await queryInterface.addIndex("CoverDesigns", ["createdAt"]);
    await queryInterface.addIndex("CoverDesigns", ["requestId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CoverDesigns");
  },
};
