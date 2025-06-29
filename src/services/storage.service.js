const AWS = require("aws-sdk");
const logger = require("../logger/logger");
const { ErrorHandler } = require("../shared/utils/ErrorHandler");

class StorageService {
  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.bucketName = process.env.S3_BUCKET_NAME || "book-service-files";
  }

  async uploadFile(buffer, key, options = {}) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: options.ContentType || "application/octet-stream",
        Metadata: options.Metadata || {},
        ServerSideEncryption: "AES256",
      };

      const result = await this.s3.upload(params).promise();

      logger.info("File uploaded successfully", {
        bucket: this.bucketName,
        key,
        location: result.Location,
      });

      return result.Location;
    } catch (error) {
      logger.error("File upload failed", {
        bucket: this.bucketName,
        key,
        error: error.message,
      });
      throw new ErrorHandler(500, `File upload failed: ${error.message}`);
    }
  }

  async getSignedUrl(key, expires = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expires,
      };

      const url = await this.s3.getSignedUrlPromise("getObject", params);
      return url;
    } catch (error) {
      logger.error("Failed to generate signed URL", {
        bucket: this.bucketName,
        key,
        error: error.message,
      });
      throw new ErrorHandler(
        500,
        `Failed to generate signed URL: ${error.message}`
      );
    }
  }

  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3.deleteObject(params).promise();

      logger.info("File deleted successfully", {
        bucket: this.bucketName,
        key,
      });

      return true;
    } catch (error) {
      logger.error("File deletion failed", {
        bucket: this.bucketName,
        key,
        error: error.message,
      });
      throw new ErrorHandler(500, `File deletion failed: ${error.message}`);
    }
  }

  async fileExists(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3.headObject(params).promise();
      return true;
    } catch (error) {
      if (error.code === "NotFound") {
        return false;
      }
      throw new ErrorHandler(
        500,
        `Error checking file existence: ${error.message}`
      );
    }
  }

  async copyFile(sourceKey, destinationKey) {
    try {
      const params = {
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destinationKey,
      };

      await this.s3.copyObject(params).promise();

      logger.info("File copied successfully", {
        sourceKey,
        destinationKey,
      });

      return true;
    } catch (error) {
      logger.error("File copy failed", {
        sourceKey,
        destinationKey,
        error: error.message,
      });
      throw new ErrorHandler(500, `File copy failed: ${error.message}`);
    }
  }
}

module.exports = new StorageService();
