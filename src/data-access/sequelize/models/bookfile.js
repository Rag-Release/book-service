"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BookFile extends Model {
    static associate(models) {
      BookFile.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
      });
      BookFile.belongsTo(models.ISBNCertificate, {
        foreignKey: "isbn_certificate_id",
        as: "isbn_certificate",
      });
      BookFile.belongsTo(models.User, {
        foreignKey: "uploaded_by",
        as: "uploader",
      });
    }

    // Instance methods
    isImage() {
      return this.mime_type && this.mime_type.startsWith("image/");
    }

    isPDF() {
      return this.mime_type === "application/pdf";
    }

    getFileExtension() {
      return this.file_name.split(".").pop().toLowerCase();
    }

    toPublicJSON() {
      return {
        id: this.id,
        file_type: this.file_type,
        file_name: this.file_name,
        file_url: this.file_url,
        description: this.description,
        uploaded_at: this.uploaded_at,
      };
    }
  }

  BookFile.init(
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
      isbn_certificate_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      file_type: {
        type: DataTypes.ENUM("COVER", "ISBN_CERTIFICATE", "ADDITIONAL_DOC"),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mime_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BookFile",
      tableName: "book_files",
      underscored: true,
      timestamps: true,
    }
  );

  return BookFile;
};
