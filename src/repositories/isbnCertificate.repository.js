const {
  IsbnCertificate,
  Book,
  User,
  sequelize,
} = require("../data-access/sequelize/models");
const { Op } = require("sequelize");

class IsbnCertificateRepository {
  async create(certificateData) {
    try {
      const certificate = await IsbnCertificate.create(certificateData);
      return await this.findById(certificate.id);
    } catch (error) {
      throw new Error(`Failed to create ISBN certificate: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const certificate = await IsbnCertificate.findByPk(id, {
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "authorId", "genre"],
          },
          {
            model: User,
            as: "uploader",
            attributes: ["id", "username", "firstName", "lastName", "email"],
          },
          {
            model: User,
            as: "verifier",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
      });
      return certificate;
    } catch (error) {
      throw new Error(`Failed to find ISBN certificate: ${error.message}`);
    }
  }

  async findByBookId(bookId, options = {}) {
    try {
      const { includeInactive = false, limit, offset } = options;

      const whereClause = { bookId };
      if (!includeInactive) {
        whereClause.isActive = true;
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
            as: "verifier",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const certificates = await IsbnCertificate.findAll(queryOptions);
      return certificates;
    } catch (error) {
      throw new Error(
        `Failed to find certificates by book ID: ${error.message}`
      );
    }
  }

  async findByIsbn(isbn) {
    try {
      const certificate = await IsbnCertificate.findOne({
        where: {
          [Op.or]: [{ isbn13: isbn }, { isbn10: isbn }],
        },
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
        ],
      });
      return certificate;
    } catch (error) {
      throw new Error(`Failed to find certificate by ISBN: ${error.message}`);
    }
  }

  async findByUploaderId(uploaderId, options = {}) {
    try {
      const { status, limit, offset } = options;

      const whereClause = { uploadedBy: uploaderId };
      if (status) whereClause.status = status;

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
            as: "verifier",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const certificates = await IsbnCertificate.findAll(queryOptions);
      return certificates;
    } catch (error) {
      throw new Error(
        `Failed to find certificates by uploader: ${error.message}`
      );
    }
  }

  async findPendingCertificates(options = {}) {
    try {
      const { limit, offset, issuingAuthority } = options;

      const whereClause = { status: "PENDING", isActive: true };
      if (issuingAuthority) whereClause.issuingAuthority = issuingAuthority;

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
        ],
        order: [["createdAt", "ASC"]],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const certificates = await IsbnCertificate.findAll(queryOptions);
      return certificates;
    } catch (error) {
      throw new Error(`Failed to find pending certificates: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await IsbnCertificate.update(updateData, {
        where: { id },
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update ISBN certificate: ${error.message}`);
    }
  }

  async verify(id, verifierId, verificationMethod = "MANUAL") {
    try {
      const updateData = {
        status: "VERIFIED",
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        verificationMethod,
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  async approve(id, verifierId) {
    try {
      const updateData = {
        status: "APPROVED",
        verifiedBy: verifierId,
        verifiedAt: new Date(),
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to approve certificate: ${error.message}`);
    }
  }

  async reject(id, verifierId, rejectionReason) {
    try {
      const updateData = {
        status: "REJECTED",
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason,
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to reject certificate: ${error.message}`);
    }
  }

  async deactivate(id) {
    try {
      const updateData = {
        isActive: false,
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to deactivate certificate: ${error.message}`);
    }
  }

  async getStatsByStatus() {
    try {
      const stats = await IsbnCertificate.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });

      return stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {});
    } catch (error) {
      throw new Error(`Failed to get certificate stats: ${error.message}`);
    }
  }

  async searchCertificates(searchQuery, options = {}) {
    try {
      const { limit, offset, status, issuingAuthority } = options;

      const whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              { isbn13: { [Op.iLike]: `%${searchQuery}%` } },
              { isbn10: { [Op.iLike]: `%${searchQuery}%` } },
              { title: { [Op.iLike]: `%${searchQuery}%` } },
              { authorName: { [Op.iLike]: `%${searchQuery}%` } },
              { publisherName: { [Op.iLike]: `%${searchQuery}%` } },
            ],
          },
        ],
      };

      if (status) whereClause[Op.and].push({ status });
      if (issuingAuthority) whereClause[Op.and].push({ issuingAuthority });

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
        ],
        order: [["createdAt", "DESC"]],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const certificates = await IsbnCertificate.findAll(queryOptions);
      return certificates;
    } catch (error) {
      throw new Error(`Failed to search certificates: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deletedRowsCount = await IsbnCertificate.destroy({
        where: { id },
      });
      return deletedRowsCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete ISBN certificate: ${error.message}`);
    }
  }
}

module.exports = new IsbnCertificateRepository();
