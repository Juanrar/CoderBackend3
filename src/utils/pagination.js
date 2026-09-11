import { createError } from "./apiResponse.js";

// Tope duro: ningún cliente puede pedir más documentos que esto en una sola
// request, aunque mande ?limit=10000.
export const MAX_LIMIT = 100;
export const DEFAULT_LIMIT = 10;

const parsePositiveInt = (value, fallback, fieldName) => {
  if (value === undefined || value === "") return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw createError(
      "VALIDATION_ERROR",
      `El parámetro '${fieldName}' debe ser un número entero mayor a 0`
    );
  }

  return parsed;
};

// Convierte ?sort=createdAt:desc,total:asc en { createdAt: -1, total: 1 }
const parseSort = (sort, allowedSortFields) => {
  if (!sort) return { createdAt: -1 };

  return sort.split(",").reduce((accumulator, part) => {
    const [field, direction = "asc"] = part.trim().split(":");

    if (!allowedSortFields.includes(field)) {
      throw createError(
        "VALIDATION_ERROR",
        `No se puede ordenar por '${field}'. Campos permitidos: ${allowedSortFields.join(", ")}`
      );
    }

    if (!["asc", "desc"].includes(direction)) {
      throw createError(
        "VALIDATION_ERROR",
        `Dirección de orden inválida en '${part}'. Usar 'asc' o 'desc'`
      );
    }

    accumulator[field] = direction === "desc" ? -1 : 1;
    return accumulator;
  }, {});
};

/**
 * Traduce la query string a opciones de mongoose-paginate-v2.
 * Acepta ?page, ?limit y ?sort=campo:asc|desc
 */
export const buildPaginationOptions = (query = {}, { allowedSortFields = ["createdAt"] } = {}) => {
  const page = parsePositiveInt(query.page, 1, "page");
  const limit = Math.min(parsePositiveInt(query.limit, DEFAULT_LIMIT, "limit"), MAX_LIMIT);

  return {
    page,
    limit,
    sort: parseSort(query.sort, allowedSortFields),
    lean: true,
    leanWithId: false,
    customLabels: { docs: "docs", totalDocs: "totalDocs" }
  };
};

/**
 * Separa el resultado de paginate() en el payload (los documentos) y la
 * metadata, para que la forma de `payload` siga siendo un array.
 */
export const formatPaginated = (result) => {
  const { docs, ...meta } = result;

  return {
    payload: docs,
    pagination: {
      totalDocs: meta.totalDocs,
      limit: meta.limit,
      totalPages: meta.totalPages,
      page: meta.page,
      hasPrevPage: meta.hasPrevPage,
      hasNextPage: meta.hasNextPage,
      prevPage: meta.prevPage,
      nextPage: meta.nextPage
    }
  };
};
