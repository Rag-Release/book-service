const { CoverDesign, Book, User } = require("../data-access/sequelize/models");
const { Op } = require("sequelize");

class CoverDesignRepository {
  async create(coverDesignData) {
    try {
      const coverDesign = await CoverDesign.create(coverDesignData);
      return await this.findById(coverDesign.id);
    } catch (error) {
      throw new Error(`Failed to create cover design: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const coverDesign = await CoverDesign.findByPk(id, {
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "authorId"],
          },
          {
            model: User,
            as: "uploader",
            attributes: ["id", "username", "firstName", "lastName", "email"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
      });
      return coverDesign;
    } catch (error) {
      throw new Error(`Failed to find cover design: ${error.message}`);
    }
  }

  async findByBookId(bookId, options = {}) {
    try {
      const { includeInactive = false, limit, offset } = options;

      const whereClause = { bookId };
      if (!includeInactive) {
        whereClause.status = { [Op.not]: "REJECTED" };
      }

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "authorId"],
          },
          {
            model: User,
            as: "uploader",
            attributes: ["id", "username", "firstName", "lastName"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
        order: [
          ["version", "DESC"],
          ["createdAt", "DESC"],
        ],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const coverDesigns = await CoverDesign.findAll(queryOptions);
      return coverDesigns;
    } catch (error) {
      if (error.message.includes('relation "CoverDesigns" does not exist')) {
        throw new Error(
          "CoverDesigns table not found. Please run database migrations."
        );
      }
      throw new Error(
        `Failed to find cover designs by book ID: ${error.message}`
      );
    }
  }

  async findActiveByBookId(bookId) {
    try {
      const activeCover = await CoverDesign.findOne({
        where: {
          bookId,
          isActive: true,
          status: "ACTIVE",
        },
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "authorId"],
          },
        ],
      });
      return activeCover;
    } catch (error) {
      throw new Error(`Failed to find active cover design: ${error.message}`);
    }
  }

  async findByUploaderId(uploaderId, options = {}) {
    try {
      const { limit, offset, status } = options;

      const whereClause = { uploadedBy: uploaderId };
      if (status) {
        whereClause.status = status;
      }

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "authorId"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const coverDesigns = await CoverDesign.findAll(queryOptions);
      return coverDesigns;
    } catch (error) {
      throw new Error(
        `Failed to find cover designs by uploader ID: ${error.message}`
      );
    }
  }

  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await CoverDesign.update(updateData, {
        where: { id },
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update cover design: ${error.message}`);
    }
  }

  async setAsActive(id, bookId) {
    try {
      // First, deactivate all other covers for this book
      await CoverDesign.update(
        { isActive: false },
        { where: { bookId, isActive: true } }
      );

      // Then activate the specified cover
      const [updatedRowsCount] = await CoverDesign.update(
        {
          isActive: true,
          status: "ACTIVE",
          approvedAt: new Date(),
        },
        { where: { id, bookId } }
      );

      if (updatedRowsCount === 0) {
        throw new Error(
          "Cover design not found or does not belong to the specified book"
        );
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to set cover as active: ${error.message}`);
    }
  }

  async approve(id, approvedBy) {
    try {
      const updateData = {
        status: "APPROVED",
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: null,
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to approve cover design: ${error.message}`);
    }
  }

  async reject(id, rejectionReason, rejectedBy) {
    try {
      const updateData = {
        status: "REJECTED",
        rejectionReason,
        isActive: false,
        approvedBy: rejectedBy,
        approvedAt: new Date(),
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to reject cover design: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deletedRowsCount = await CoverDesign.destroy({
        where: { id },
      });
      return deletedRowsCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete cover design: ${error.message}`);
    }
  }

  async findByStatus(status, options = {}) {
    try {
      const { limit, offset } = options;

      const queryOptions = {
        where: { status },
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "authorId"],
          },
        ],
        order: [["createdAt", "DESC"]],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const coverDesigns = await CoverDesign.findAll(queryOptions);
      return coverDesigns;
    } catch (error) {
      throw new Error(
        `Failed to find cover designs by status: ${error.message}`
      );
    }
  }

  async getVersionHistory(bookId) {
    try {
      const versions = await CoverDesign.findAll({
        where: { bookId },
        order: [
          ["version", "ASC"],
          ["createdAt", "ASC"],
        ],
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title"],
          },
        ],
      });
      return versions;
    } catch (error) {
      throw new Error(`Failed to get version history: ${error.message}`);
    }
  }

  async getNextVersion(bookId) {
    try {
      const latestVersion = await CoverDesign.findOne({
        where: { bookId },
        order: [["version", "DESC"]],
        attributes: ["version"],
      });

      return latestVersion ? latestVersion.version + 1 : 1;
    } catch (error) {
      throw new Error(`Failed to get next version number: ${error.message}`);
    }
  }
}

module.exports = new CoverDesignRepository();
