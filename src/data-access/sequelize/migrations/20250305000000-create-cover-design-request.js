"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CoverDesignRequests", {
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
      assignedDesignerId: {
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
        comment: "Title for the cover design request",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Detailed description of the cover requirements",
      },
      preferredDimensions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Preferred dimensions {width, height, aspectRatio}",
      },
      minFileSize: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: "Minimum file size in bytes",
      },
      maxFileSize: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 10485760, // 10MB
        comment: "Maximum file size in bytes",
      },
      preferredFormats: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: ["image/jpeg", "image/png"],
        comment: "Array of preferred MIME types",
      },
      conceptBrief: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Detailed concept and creative brief",
      },
      stylePreferences: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Style preferences {modern, vintage, minimalist, etc.}",
      },
      colorSchemeRequirements: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Color scheme requirements and preferences",
      },
      targetAudience: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Target audience description",
      },
      moodBoard: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Mood board URLs and references",
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Array of relevant tags and keywords",
      },
      inspirationReferences: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Reference images and inspiration URLs",
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "Budget for the cover design",
      },
      deadlineDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Requested completion deadline",
      },
      priority: {
        type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
        allowNull: false,
        defaultValue: "MEDIUM",
      },
      status: {
        type: Sequelize.ENUM(
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "SUBMITTED",
          "APPROVED",
          "COMPLETED",
          "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "OPEN",
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Additional technical and creative requirements",
      },
      deliverables: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Expected deliverables and file formats",
      },
      revisionLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: "Maximum number of revisions allowed",
      },
      currentRevisions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      authorNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional notes from the author",
      },
      designerNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Notes from the assigned designer",
      },
      assignedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.addIndex("CoverDesignRequests", ["bookId"]);
    await queryInterface.addIndex("CoverDesignRequests", ["authorId"]);
    await queryInterface.addIndex("CoverDesignRequests", [
      "assignedDesignerId",
    ]);
    await queryInterface.addIndex("CoverDesignRequests", ["status"]);
    await queryInterface.addIndex("CoverDesignRequests", ["priority"]);
    await queryInterface.addIndex("CoverDesignRequests", ["deadlineDate"]);
    await queryInterface.addIndex("CoverDesignRequests", ["createdAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CoverDesignRequests");
  },
};
