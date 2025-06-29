"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CoverDesignRequest extends Model {
    static associate(models) {
      // Associate with Book model
      if (models.Book) {
        CoverDesignRequest.belongsTo(models.Book, {
          foreignKey: "bookId",
          as: "book",
        });
      }

      // Associate with User model for author
      if (models.User) {
        CoverDesignRequest.belongsTo(models.User, {
          foreignKey: "authorId",
          as: "author",
        });
      }

      // Associate with User model for assigned designer
      if (models.User) {
        CoverDesignRequest.belongsTo(models.User, {
          foreignKey: "assignedDesignerId",
          as: "assignedDesigner",
        });
      }

      // Associate with CoverDesign model
      if (models.CoverDesign) {
        CoverDesignRequest.hasMany(models.CoverDesign, {
          foreignKey: "requestId",
          as: "submissions",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        bookId: this.bookId,
        title: this.title,
        description: this.description,
        preferredDimensions: this.preferredDimensions,
        stylePreferences: this.stylePreferences,
        colorSchemeRequirements: this.colorSchemeRequirements,
        targetAudience: this.targetAudience,
        tags: this.tags,
        budget: this.budget,
        deadlineDate: this.deadlineDate,
        priority: this.priority,
        status: this.status,
        revisionLimit: this.revisionLimit,
        currentRevisions: this.currentRevisions,
        createdAt: this.createdAt,
        author: this.author
          ? {
              id: this.author.id,
              username: this.author.username,
              firstName: this.author.firstName,
              lastName: this.author.lastName,
            }
          : null,
        assignedDesigner: this.assignedDesigner
          ? {
              id: this.assignedDesigner.id,
              username: this.assignedDesigner.username,
              firstName: this.assignedDesigner.firstName,
              lastName: this.assignedDesigner.lastName,
            }
          : null,
      };
    }

    getDetailedInfo() {
      return {
        ...this.getPublicInfo(),
        conceptBrief: this.conceptBrief,
        moodBoard: this.moodBoard,
        inspirationReferences: this.inspirationReferences,
        requirements: this.requirements,
        deliverables: this.deliverables,
        authorNotes: this.authorNotes,
        designerNotes: this.designerNotes,
        preferredFormats: this.preferredFormats,
        minFileSize: this.minFileSize,
        maxFileSize: this.maxFileSize,
        assignedAt: this.assignedAt,
        completedAt: this.completedAt,
        updatedAt: this.updatedAt,
      };
    }

    isOpen() {
      return this.status === "OPEN";
    }

    isAssigned() {
      return this.status === "ASSIGNED";
    }

    isCompleted() {
      return this.status === "COMPLETED";
    }

    canBeAssigned() {
      return ["OPEN", "ASSIGNED"].includes(this.status);
    }

    canAcceptSubmissions() {
      return ["ASSIGNED", "IN_PROGRESS", "SUBMITTED"].includes(this.status);
    }

    hasReachedRevisionLimit() {
      return this.currentRevisions >= this.revisionLimit;
    }
  }

  CoverDesignRequest.init(
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
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Author ID is required" },
          isInt: { msg: "Author ID must be an integer" },
        },
      },
      assignedDesignerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Assigned designer ID must be an integer" },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Title is required" },
          notEmpty: { msg: "Title cannot be empty" },
          len: {
            args: [3, 200],
            msg: "Title must be between 3 and 200 characters",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 3000],
            msg: "Description cannot exceed 3000 characters",
          },
        },
      },
      preferredDimensions: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      minFileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
          min: { args: [1024], msg: "Minimum file size must be at least 1KB" },
        },
      },
      maxFileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 10485760, // 10MB
        validate: {
          max: {
            args: [52428800],
            msg: "Maximum file size cannot exceed 50MB",
          },
        },
      },
      preferredFormats: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: ["image/jpeg", "image/png"],
      },
      conceptBrief: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 5000],
            msg: "Concept brief cannot exceed 5000 characters",
          },
        },
      },
      stylePreferences: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      colorSchemeRequirements: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: "Color scheme requirements cannot exceed 1000 characters",
          },
        },
      },
      targetAudience: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 300],
            msg: "Target audience cannot exceed 300 characters",
          },
        },
      },
      moodBoard: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      inspirationReferences: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: { args: [0], msg: "Budget must be non-negative" },
        },
      },
      deadlineDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isAfter: {
            args: new Date().toISOString(),
            msg: "Deadline must be in the future",
          },
        },
      },
      priority: {
        type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
        allowNull: false,
        defaultValue: "MEDIUM",
      },
      status: {
        type: DataTypes.ENUM(
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
        type: DataTypes.JSON,
        allowNull: true,
      },
      deliverables: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      revisionLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
          min: { args: [0], msg: "Revision limit must be non-negative" },
          max: { args: [10], msg: "Revision limit cannot exceed 10" },
        },
      },
      currentRevisions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Current revisions must be non-negative" },
        },
      },
      authorNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 2000],
            msg: "Author notes cannot exceed 2000 characters",
          },
        },
      },
      designerNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 2000],
            msg: "Designer notes cannot exceed 2000 characters",
          },
        },
      },
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CoverDesignRequest",
      tableName: "CoverDesignRequests",
      timestamps: true,
      indexes: [
        { fields: ["bookId"] },
        { fields: ["authorId"] },
        { fields: ["assignedDesignerId"] },
        { fields: ["status"] },
        { fields: ["priority"] },
        { fields: ["deadlineDate"] },
        { fields: ["createdAt"] },
      ],
    }
  );

  return CoverDesignRequest;
};
