import { ERROR_DICTIONARY } from "./errorDictionary.js";

export function successResponse(res, { statusCode = 200, message, payload, pagination }) {
    return res.status(statusCode).json({
        status: "success",
        message,
        payload,
        // Solo presente en endpoints de listado paginado.
        ...(pagination && { pagination })
    });
}

export function errorResponse(res, { statusCode = 500, error, message="Error interno en el servidor" }) {
    return res.status(statusCode).json({
        status: "error",
        error,
        message
    });
}

export function createError(code, message = null) {
    const errorDefinition = ERROR_DICTIONARY[code];

    if (!errorDefinition) {
        console.warn(
            `[createError] El codigo '${code}' no existe en ERROR_DICTIONARY. ` +
            `Se responde 500 en su lugar. Agregalo en src/utils/errorDictionary.js.`
        );
    }

    const definition = errorDefinition || ERROR_DICTIONARY.INTERNAL_SERVER_ERROR;
    const error = new Error(message || definition.message);
    error.statusCode = definition.statusCode;
    error.code = errorDefinition ? code : "INTERNAL_SERVER_ERROR";
    return error;
}