const {
  CoverDesignRequest,
  Book,
  User,
  CoverDesign,
  sequelize,
} = require("../data-access/sequelize/models");
const { Op } = require("sequelize");

class CoverDesignRequestRepository {
  async create(requestData) {
    try {
      const request = await CoverDesignRequest.create(requestData);
      return await this.findById(request.id);
    } catch (error) {
      throw new Error(
        `Failed to create cover design request: ${error.message}`
      );
    }
  }

  async findById(id) {
    try {
      const request = await CoverDesignRequest.findByPk(id, {
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "genre", "synopsis"],
          },
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "firstName", "lastName", "email"],
          },
          {
            model: User,
            as: "assignedDesigner",
            attributes: ["id", "username", "firstName", "lastName", "email"],
          },
          {
            model: CoverDesign,
            as: "submissions",
            attributes: [
              "id",
              "title",
              "status",
              "version",
              "fileUrl",
              "createdAt",
            ],
          },
        ],
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to find cover design request: ${error.message}`);
    }
  }

  async findByAuthorId(authorId, options = {}) {
    try {
      const { status, limit, offset, priority } = options;

      const whereClause = { authorId };
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "genre"],
          },
          {
            model: User,
            as: "assignedDesigner",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const requests = await CoverDesignRequest.findAll(queryOptions);
      return requests;
    } catch (error) {
      throw new Error(`Failed to find requests by author: ${error.message}`);
    }
  }

  async findByDesignerId(designerId, options = {}) {
    try {
      const { status, limit, offset } = options;

      const whereClause = { assignedDesignerId: designerId };
      if (status) whereClause.status = status;

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "genre"],
          },
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
        order: [
          ["deadlineDate", "ASC"],
          ["priority", "DESC"],
        ],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const requests = await CoverDesignRequest.findAll(queryOptions);
      return requests;
    } catch (error) {
      throw new Error(`Failed to find requests by designer: ${error.message}`);
    }
  }

  async findOpenRequests(options = {}) {
    try {
      const { limit, offset, priority, budget } = options;

      const whereClause = { status: "OPEN" };
      if (priority) whereClause.priority = priority;
      if (budget) {
        whereClause.budget = { [Op.gte]: budget };
      }

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "genre", "synopsis"],
          },
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "firstName", "lastName"],
          },
        ],
        order: [
          ["priority", "DESC"],
          ["deadlineDate", "ASC"],
          ["createdAt", "DESC"],
        ],
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const requests = await CoverDesignRequest.findAll(queryOptions);
      return requests;
    } catch (error) {
      throw new Error(`Failed to find open requests: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await CoverDesignRequest.update(updateData, {
        where: { id },
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to update cover design request: ${error.message}`
      );
    }
  }

  async assignDesigner(id, designerId) {
    try {
      const updateData = {
        assignedDesignerId: designerId,
        status: "ASSIGNED",
        assignedAt: new Date(),
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to assign designer: ${error.message}`);
    }
  }

  async markCompleted(id) {
    try {
      const updateData = {
        status: "COMPLETED",
        completedAt: new Date(),
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to mark request as completed: ${error.message}`);
    }
  }

  async incrementRevision(id) {
    try {
      const request = await this.findById(id);
      if (!request) {
        throw new Error("Request not found");
      }

      if (request.hasReachedRevisionLimit()) {
        throw new Error("Revision limit reached");
      }

      const updateData = {
        currentRevisions: request.currentRevisions + 1,
      };

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to increment revision: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deletedRowsCount = await CoverDesignRequest.destroy({
        where: { id },
      });
      return deletedRowsCount > 0;
    } catch (error) {
      throw new Error(
        `Failed to delete cover design request: ${error.message}`
      );
    }
  }

  async getStatsByAuthor(authorId) {
    try {
      const stats = await CoverDesignRequest.findAll({
        where: { authorId },
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
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = new CoverDesignRequestRepository();
