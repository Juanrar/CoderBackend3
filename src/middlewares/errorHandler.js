import { errorResponse } from "../utils/apiResponse.js";
import logger from "../config/logger.js";

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "Error interno en el servidor";

  const detail = `${req.method} ${req.originalUrl} - ${code} - ${message}`;

  if (statusCode >= 500) {
    logger.error(`${detail}\n${error.stack}`);
  } else {
    logger.warning(detail);
  }

  return errorResponse(res, { statusCode, error: code, message });
}