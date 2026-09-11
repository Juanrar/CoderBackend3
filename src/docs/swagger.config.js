import swaggerJSDoc from "swagger-jsdoc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const docsDir = path.dirname(fileURLToPath(import.meta.url));

const yamlGlob = path.join(docsDir, "**", "*.yaml").replace(/\\/g, "/");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ShipNow API",
            version: "1.0.0",
            description: "Documentacion de la API de ShipNow",
        },
        servers: [
            {
            url: "http://localhost:8080",
            description: "Servidor local"
            }
        ]
    },
    apis: [yamlGlob]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);