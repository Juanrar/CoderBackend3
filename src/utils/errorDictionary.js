export const ERROR_DICTIONARY = {
    VALIDATION_ERROR: {
        statusCode: 400,
        message: "Datos invalidos o incompletos"
    },
    USER_NOT_FOUND: {
        statusCode: 404,
        message: "Usuario no encontrado"
    },
    INVALID_USER_ROLE:{
        statusCode: 400,
        message: "Rol de usuario invalido"
    },
    ROUTA_NOT_FOUND: {
        statusCode: 404,
        message: "Ruta no encontrada"
    },
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: "Error interno en el servidor"
    }
}