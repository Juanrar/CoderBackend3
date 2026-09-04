import { createError } from "../utils/apiResponse.js";

export function notFoundHandler(req, res, next) {
    next(createError(404, "Ruta no encontrada", "NOT_FOUND"));
}