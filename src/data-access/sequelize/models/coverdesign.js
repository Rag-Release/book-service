"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CoverDesign extends Model {
    static associate(models) {
      // Associate with Book model
      if (models.Book) {
        CoverDesign.belongsTo(models.Book, {
          foreignKey: "bookId",
          as: "book",
        });
      }

      // Associate with User model for uploader
      if (models.User) {
        CoverDesign.belongsTo(models.User, {
          foreignKey: "uploadedBy",
          as: "uploader",
        });
      }

      // Associate with User model for approver
      if (models.User) {
        CoverDesign.belongsTo(models.User, {
          foreignKey: "approvedBy",
          as: "approver",
        });
      }

      // Associate with CoverDesignRequest model (optional)
      if (models.CoverDesignRequest) {
        CoverDesign.belongsTo(models.CoverDesignRequest, {
          foreignKey: "requestId",
          as: "designRequest",
        });
      }
    }

    // Instance methods
    getPublicInfo() {
      return {
        id: this.id,
        bookId: this.bookId,
        uploadedBy: this.uploadedBy,
        designerName: this.designerName,
        title: this.title,
        description: this.description,
        fileUrl: this.fileUrl,
        thumbnailUrl: this.thumbnailUrl,
        colorScheme: this.colorScheme,
        style: this.style,
        status: this.status,
        version: this.version,
        isActive: this.isActive,
        createdAt: this.createdAt,
        uploader: this.uploader
          ? {
              id: this.uploader.id,
              username: this.uploader.username,
              firstName: this.uploader.firstName,
              lastName: this.uploader.lastName,
            }
          : null,
        approver: this.approver
          ? {
              id: this.approver.id,
              username: this.approver.username,
              firstName: this.approver.firstName,
              lastName: this.approver.lastName,
            }
          : null,
      };
    }

    getDesignerInfo() {
      return {
        designerName: this.designerName,
        designerEmail: this.designerEmail,
        designerPortfolio: this.designerPortfolio,
      };
    }

    getTechnicalInfo() {
      return {
        fileName: this.fileName,
        fileSize: this.fileSize,
        mimeType: this.mimeType,
        dimensions: this.dimensions,
        metadata: this.metadata,
      };
    }
  }

  CoverDesign.init(
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
      designerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Designer ID must be an integer" },
        },
      },
      designerName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Designer name is required" },
          notEmpty: { msg: "Designer name cannot be empty" },
          len: {
            args: [2, 100],
            msg: "Designer name must be between 2 and 100 characters",
          },
        },
      },
      designerEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: { msg: "Must be a valid email address" },
        },
      },
      designerPortfolio: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: "Must be a valid URL" },
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
      thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
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
            args: [["image/jpeg", "image/png", "image/webp", "image/tiff"]],
            msg: "MIME type must be a supported image format",
          },
        },
      },
      dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
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
            args: [0, 2000],
            msg: "Description cannot exceed 2000 characters",
          },
        },
      },
      designConcept: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: "Design concept cannot exceed 1000 characters",
          },
        },
      },
      colorScheme: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 100],
            msg: "Color scheme cannot exceed 100 characters",
          },
        },
      },
      style: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 100],
            msg: "Style cannot exceed 100 characters",
          },
        },
      },
      targetAudience: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 200],
            msg: "Target audience cannot exceed 200 characters",
          },
        },
      },
      designNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1500],
            msg: "Design notes cannot exceed 1500 characters",
          },
        },
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: { args: [1], msg: "Version must be at least 1" },
        },
      },
      status: {
        type: DataTypes.ENUM(
          "DRAFT",
          "SUBMITTED",
          "APPROVED",
          "REJECTED",
          "ACTIVE"
        ),
        allowNull: false,
        defaultValue: "DRAFT",
        validate: {
          isIn: {
            args: [["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ACTIVE"]],
            msg: "Status must be one of: DRAFT, SUBMITTED, APPROVED, REJECTED, ACTIVE",
          },
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Approved by must be an integer" },
        },
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: "Rejection reason cannot exceed 1000 characters",
          },
        },
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      requestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Request ID must be an integer" },
        },
      },
    },
    {
      sequelize,
      modelName: "CoverDesign",
      tableName: "CoverDesigns",
      timestamps: true,
      indexes: [
        { fields: ["bookId"] },
        { fields: ["uploadedBy"] },
        { fields: ["designerId"] },
        { fields: ["status"] },
        { fields: ["isActive"] },
        { fields: ["approvedBy"] },
        { fields: ["createdAt"] },
      ],
    }
  );

  return CoverDesign;
};
