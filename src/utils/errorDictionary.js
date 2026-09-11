export const ERROR_DICTIONARY = {
    VALIDATION_ERROR: {
        statusCode: 400,
        message: "Datos invalidos o incompletos"
    },
    USER_NOT_FOUND: {
        statusCode: 404,
        message: "Usuario no encontrado"
    },
    STORE_NOT_FOUND: {
        statusCode: 404,
        message: "Tienda no encontrada"
    },
    ORDER_NOT_FOUND: {
        statusCode: 404,
        message: "Orden no encontrado"
    },
    INVALID_USER_ROLE:{
        statusCode: 400,
        message: "Rol de usuario invalido"
    },
    ROUTE_NOT_FOUND: {
        statusCode: 404,
        message: "Ruta no encontrada"
    },
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: "Error interno en el servidor"
    },
    USER_NOT_STORE_ROLE: {
        statusCode: 400,
        message: "El usuario debe tener rol 'store' para ser dueño de una tienda"
    },
    FILE_REQUIRED:{
        statusCode: 400,
        message: "Se requiere un archivo para subir"
    },
    INVALID_FILE_TYPE: {
        statusCode: 400,
        message: "Tipo de archivo no permitido. Formatos aceptados: PDF, JPEG, PNG, WEBP"
    },
    INVALID_DOCUMENT_TYPE: {
        statusCode: 400,
        message: "Tipo de documento invalido"
    },
    FILE_TOO_LARGE: {
        statusCode: 400,
        message: "El archivo supera el tamano maximo permitido (5MB)"
    },
    INVALID_FILE_FIELD: {
        statusCode: 400,
        message: "Campo de archivo inesperado"
    },
    TOO_MANY_FILES: {
        statusCode: 400,
        message: "Se enviaron mas archivos de los permitidos"
    },
    INVALID_STATUS: {
        statusCode: 400,
        message: "Estado de pedido invalido"
    },
    INVALID_MOCK_QUANTITY: {
        statusCode: 400,
        message: "Cantidad de mocks invalida"
    }
}