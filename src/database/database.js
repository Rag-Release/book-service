const { Sequelize } = require("sequelize");
const config = require("../config/config");
const logger = require("../logger/logger");

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully");
    return true;
  } catch (error) {
    logger.error("Unable to connect to database:", error);
    return false;
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info("Database connection closed successfully");
  } catch (error) {
    logger.error("Error closing database connection:", error);
  }
};

module.exports = {
  sequelize,
  authenticate: testConnection,
  close: closeConnection,
};
