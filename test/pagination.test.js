import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import { MAX_LIMIT, DEFAULT_LIMIT } from "../src/utils/pagination.js";

const requester = supertest(app);

const crearUsuarios = async (cantidad) => {
  for (let i = 0; i < cantidad; i++) {
    await requester.post("/api/users").send({
      firstName: `Usuario${i}`,
      lastName: "Test",
      email: `usuario${i}@test.com`,
      password: "secreto123",
      role: i % 2 === 0 ? "customer" : "store"
    });
  }
};

describe("Testing de paginacion y filtros", () => {

  describe("GET /api/users con paginacion", () => {

    it("Debe limitar el listado al default aunque haya mas documentos", async () => {
      await crearUsuarios(DEFAULT_LIMIT + 5);

      const { status, body } = await requester.get("/api/users");

      expect(status).to.equal(200);
      expect(body.payload).to.have.lengthOf(DEFAULT_LIMIT);
      expect(body.pagination.totalDocs).to.equal(DEFAULT_LIMIT + 5);
      expect(body.pagination.hasNextPage).to.equal(true);
    });

    it("Debe devolver la pagina solicitada sin repetir documentos", async () => {
      await crearUsuarios(5);

      const primera = await requester.get("/api/users?page=1&limit=2");
      const segunda = await requester.get("/api/users?page=2&limit=2");

      expect(primera.body.payload).to.have.lengthOf(2);
      expect(segunda.body.payload).to.have.lengthOf(2);
      expect(segunda.body.pagination.page).to.equal(2);
      expect(segunda.body.pagination.hasPrevPage).to.equal(true);

      const idsPrimera = primera.body.payload.map((u) => u._id);
      const idsSegunda = segunda.body.payload.map((u) => u._id);
      expect(idsPrimera).to.not.have.members(idsSegunda);
    });

    it("No debe permitir superar el limite maximo", async () => {
      await crearUsuarios(3);

      const { body } = await requester.get(`/api/users?limit=${MAX_LIMIT + 500}`);

      expect(body.pagination.limit).to.equal(MAX_LIMIT);
    });

    it("Debe responder 400 si la pagina no es un entero positivo", async () => {
      const { status } = await requester.get("/api/users?page=-3");

      expect(status).to.equal(400);
    });

    it("No debe exponer el password en el listado paginado", async () => {
      await crearUsuarios(2);

      const { body } = await requester.get("/api/users");

      body.payload.forEach((usuario) => {
        expect(usuario).to.not.have.property("password");
      });
    });

    it("Debe filtrar por rol", async () => {
      await crearUsuarios(4);

      const { body } = await requester.get("/api/users?role=store");

      expect(body.pagination.totalDocs).to.equal(2);
      body.payload.forEach((usuario) => {
        expect(usuario.role).to.equal("store");
      });
    });

    it("Debe responder 400 si el rol no es valido", async () => {
      const { status } = await requester.get("/api/users?role=inexistente");

      expect(status).to.equal(400);
    });

    it("Debe ordenar por un campo permitido", async () => {
      await crearUsuarios(3);

      const { body } = await requester.get("/api/users?sort=email:asc");
      const emails = body.payload.map((u) => u.email);

      expect(emails).to.deep.equal([...emails].sort());
    });

    it("Debe responder 400 si se intenta ordenar por un campo no permitido", async () => {
      const { status } = await requester.get("/api/users?sort=password:desc");

      expect(status).to.equal(400);
    });
  });

  describe("GET /api/stores y /api/orders con paginacion", () => {

    it("Debe devolver metadata de paginacion en tiendas", async () => {
      const { status, body } = await requester.get("/api/stores");

      expect(status).to.equal(200);
      expect(body.payload).to.be.an("array");
      expect(body.pagination).to.include.keys("totalDocs", "limit", "page", "totalPages");
    });

    it("Debe devolver metadata de paginacion en pedidos", async () => {
      const { status, body } = await requester.get("/api/orders");

      expect(status).to.equal(200);
      expect(body.payload).to.be.an("array");
      expect(body.pagination.limit).to.equal(DEFAULT_LIMIT);
    });

    it("Debe responder 400 si el status del pedido no es valido", async () => {
      const { status } = await requester.get("/api/orders?status=volando");

      expect(status).to.equal(400);
    });

    it("Debe responder 400 si isActive no es booleano", async () => {
      const { status } = await requester.get("/api/stores?isActive=quizas");

      expect(status).to.equal(400);
    });
  });
});
