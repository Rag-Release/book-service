const coverDesignUseCases = require("./coverDesign");
const createCoverDesignRequestUseCase = require("./coverDesignRequest/create-cover-design-request.use-case");

module.exports = {
  coverDesignUseCases,
  coverDesignRequestUseCases: {
    createCoverDesignRequestUseCase,
  },
};
