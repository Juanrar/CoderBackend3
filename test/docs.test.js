import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import { swaggerSpec } from "../src/docs/swagger.config.js";

const requester = supertest(app);

describe("Testing de documentacion y observabilidad", () => {

  describe("Swagger en /api/docs", () => {

    it("Debe servir la documentacion interactiva", async () => {
      // swagger-ui-express redirige la ruta sin barra final.
      const { status, text } = await requester.get("/api/docs/");

      expect(status).to.equal(200);
      expect(text).to.include("swagger-ui");
    });

    it("Debe estar disponible tambien en produccion", async () => {
      // La documentacion se monta fuera de cualquier condicional de entorno.
      const { status } = await requester.get("/api/docs/");

      expect(status).to.equal(200);
    });

    it("Debe documentar los endpoints principales", async () => {
      const documentados = Object.keys(swaggerSpec.paths);

      const esperados = [
        "/health",
        "/api/users",
        "/api/users/{uid}",
        "/api/users/{uid}/documents",
        "/api/stores",
        "/api/orders",
        "/api/orders/{oid}",
        "/api/orders/{oid}/status",
        "/api/orders/{oid}/tracking",
        "/api/orders/{oid}/proof",
        "/api/mocks/mockingusers",
        "/api/mocks/generateData",
        "/api/loggerTest"
      ];

      esperados.forEach((ruta) => {
        expect(documentados, `falta documentar ${ruta}`).to.include(ruta);
      });
    });

    it("Debe definir los schemas de Usuario, Pedido y Error", async () => {
      const schemas = Object.keys(swaggerSpec.components.schemas);

      expect(schemas).to.include.members(["User", "Order", "ApiError", "ApiSuccess"]);
    });

    it("No debe tener referencias rotas", async () => {
      const rotas = [];

      const recorrer = (nodo) => {
        if (!nodo || typeof nodo !== "object") return;
        if (Array.isArray(nodo)) return nodo.forEach(recorrer);

        for (const [clave, valor] of Object.entries(nodo)) {
          if (clave === "$ref" && typeof valor === "string") {
            const destino = valor
              .replace("#/", "")
              .split("/")
              .reduce((actual, tramo) => actual?.[tramo], swaggerSpec);

            if (destino === undefined) rotas.push(valor);
          } else {
            recorrer(valor);
          }
        }
      };

      recorrer(swaggerSpec);

      expect(rotas, `referencias rotas: ${rotas.join(", ")}`).to.have.lengthOf(0);
    });
  });

  describe("GET /api/loggerTest", () => {

    it("Debe emitir los logs de prueba y responder 200", async () => {
      const { status, body } = await requester.get("/api/loggerTest");

      expect(status).to.equal(200);
      expect(body.status).to.equal("success");
      expect(body.payload.emittedLevels).to.have.members([
        "fatal", "error", "warning", "info", "http", "debug"
      ]);
    });

    it("Debe informar el entorno y el nivel activo", async () => {
      const { body } = await requester.get("/api/loggerTest");

      expect(body.payload.environment).to.equal("test");
      expect(body.payload.recordedLevels).to.be.an("array");
    });
  });
});
