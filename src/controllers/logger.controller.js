import logger from "../config/logger.js";
import { envConfig } from "../config/env.js";
import { successResponse } from "../utils/apiResponse.js";

const LEVELS = ["fatal", "error", "warning", "info", "http", "debug"];

export const testLogger = (req, res, next) => {
  try {
    LEVELS.forEach((level) => {
      logger[level](`Prueba del logger en nivel '${level}'`);
    });

    successResponse(res, {
      message: "Logs de prueba emitidos",
      payload: {
        environment: envConfig.nodeEnv,
        activeLevel: envConfig.logLevel,
        emittedLevels: LEVELS,
        recordedLevels: LEVELS.slice(0, LEVELS.indexOf(envConfig.logLevel) + 1),
        files: ["logs/error.log", "logs/combined.log"]
      }
    });
  } catch (error) {
    next(error);
  }
};
