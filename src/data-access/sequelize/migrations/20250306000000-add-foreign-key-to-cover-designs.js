"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint to requestId in CoverDesigns table
    await queryInterface.addConstraint("CoverDesigns", {
      fields: ["requestId"],
      type: "foreign key",
      name: "fk_cover_designs_request_id",
      references: {
        table: "CoverDesignRequests",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraint
    await queryInterface.removeConstraint(
      "CoverDesigns",
      "fk_cover_designs_request_id"
    );
  },
};
