import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";

const requester = supertest(app);
const crearUsuario = async (role) => {
  const { body } = await requester.post("/api/users").send({
    firstName: "Ana",
    lastName: "Gomez",
    email: `ana.${Date.now()}.${Math.random()}@test.com`,
    password: "secreto123",
    role
  });

  return body.payload._id;
};

describe("Testing del modulo Stores", () => {

  let ownerId;
  
  beforeEach(async () => {
    ownerId = await crearUsuario("store");
  });

  describe("POST /api/stores", () => {

    it("Debe crear una tienda y responder 201", async () => {
      const { status, body } = await requester.post("/api/stores").send({
        name: "Kiosco Central",
        address: "Av. Siempreviva 742",
        owner: ownerId
      });

      expect(status).to.equal(201);
      expect(body.payload).to.have.property("_id");
      expect(body.payload.name).to.equal("Kiosco Central");
    });

    it("Debe marcar la tienda como activa por defecto", async () => {
      const { body } = await requester.post("/api/stores").send({
        name: "Kiosco Central",
        address: "Av. Siempreviva 742",
        owner: ownerId
      });

      expect(body.payload.isActive).to.equal(true);
    });

    it("Debe responder 400 si falta el address", async () => {
      const { status, body } = await requester.post("/api/stores").send({
        name: "Kiosco Central",
        owner: ownerId
      });

      expect(status).to.equal(400);
      expect(body.error).to.equal("VALIDATION_ERROR");
    });

    it("Debe responder 404 si el owner no existe", async () => {
      const { status, body } = await requester.post("/api/stores").send({
        name: "Kiosco Central",
        address: "Av. Siempreviva 742",
        owner: "507f1f77bcf86cd799439011"
      });

      expect(status).to.equal(404);
      expect(body.error).to.equal("USER_NOT_FOUND");
    });

    it("Debe rechazar con 400 si el owner no tiene rol 'store'", async () => {
      const customerId = await crearUsuario("customer");

      const { status, body } = await requester.post("/api/stores").send({
        name: "Kiosco Central",
        address: "Av. Siempreviva 742",
        owner: customerId
      });

      expect(status).to.equal(400);
      expect(body.error).to.equal("USER_NOT_STORE_ROLE");
    });
  });

  describe("GET /api/stores", () => {

    it("Debe devolver un array vacio si no hay tiendas", async () => {
      const { status, body } = await requester.get("/api/stores");

      expect(status).to.equal(200);
      expect(body.payload).to.be.an("array").that.is.empty;
    });
  });

  describe("GET /api/stores/:sid", () => {

    it("Debe responder 404 si la tienda no existe", async () => {
      const { status, body } = await requester.get("/api/stores/507f1f77bcf86cd799439011");

      expect(status).to.equal(404);
      expect(body.error).to.equal("STORE_NOT_FOUND");
    });
  });

  describe("PUT /api/stores/:sid", () => {

    it("Debe modificar la tienda y persistir el cambio", async () => {
      const creada = await requester.post("/api/stores").send({
        name: "Kiosco Central",
        address: "Av. Siempreviva 742",
        owner: ownerId
      });
      const id = creada.body.payload._id;

      const { status, body } = await requester
        .put(`/api/stores/${id}`)
        .send({ name: "Kiosco Norte" });

      expect(status).to.equal(200);
      expect(body.payload.name).to.equal("Kiosco Norte");

      const { body: verificacion } = await requester.get(`/api/stores/${id}`);
      expect(verificacion.payload.name).to.equal("Kiosco Norte");
    });
  });

  describe("DELETE /api/stores/:sid", () => {

    it("Debe eliminar la tienda", async () => {
      const creada = await requester.post("/api/stores").send({
        name: "Kiosco Central",
        address: "Av. Siempreviva 742",
        owner: ownerId
      });
      const id = creada.body.payload._id;

      const { status } = await requester.delete(`/api/stores/${id}`);
      expect(status).to.equal(200);

      const { status: statusPosterior } = await requester.get(`/api/stores/${id}`);
      expect(statusPosterior).to.equal(404);
    });
  });
});
