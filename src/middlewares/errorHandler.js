import { errorResponse } from "../utils/apiResponse.js";
import logger from "../config/logger.js";

export const errorHandler = (error, req, res, next) => {
  let statusCode = error?.statusCode || 500;
  let code = typeof error?.code === "string"
    ? error.code
    : "INTERNAL_SERVER_ERROR";
  let message = error?.message || "Error interno en el servidor";

  if (error?.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Datos invalidos o incompletos";
  } else if (error?.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = `El id '${error.value}' no tiene un formato valido`;
  } else if (error?.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    message = "Ya existe un registro con ese valor unico";
  }

  const detail = `${req.method} ${req.originalUrl} - ${code} - ${message}`;

  if (statusCode >= 500) {
    logger.error(`${detail}\n${error?.stack || "Sin stack disponible"}`);
  } else {
    logger.warning(detail);
  }

  return errorResponse(res, { statusCode, error: code, message });
};
