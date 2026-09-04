import { errorResponse } from "../utils/apiResponse.js";

export const errorHandler = (error, req, res, next) => {
  return errorResponse(res,{
    statusCode: error.statusCode || 500,
    error: error.code || "INTERNAL_SERVER_ERROR",
    message: error.message || "Error interno en el servidor"
  })
}