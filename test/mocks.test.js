import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";

const requester = supertest(app);

describe("Testing del modulo Mocks", () => {

  describe("GET /api/mocks/mockingusers", () => {

    it("Debe responder 200 con 10 usuarios simulados", async () => {
      const { status, body } = await requester.get("/api/mocks/mockingusers");

      expect(status).to.equal(200);
      expect(body.status).to.equal("success");
      expect(body.payload).to.be.an("array").with.lengthOf(10);
    });

    it("Cada usuario debe tener la estructura esperada", async () => {
      const { body } = await requester.get("/api/mocks/mockingusers");
      const usuario = body.payload[0];

      expect(usuario).to.have.property("firstName").that.is.a("string");
      expect(usuario).to.have.property("lastName").that.is.a("string");
      expect(usuario).to.have.property("email").that.includes("@");
      expect(usuario).to.have.property("role").that.equals("customer");
    });
  });

  describe("GET /api/mocks/mockingorders", () => {

    it("Debe responder 200 con 10 ordenes simuladas", async () => {
      const { status, body } = await requester.get("/api/mocks/mockingorders");

      expect(status).to.equal(200);
      expect(body.payload).to.be.an("array").with.lengthOf(10);
    });

    it("El total de cada orden debe coincidir con sus items", async () => {
      const { body } = await requester.get("/api/mocks/mockingorders");
      const orden = body.payload[0];

      const totalEsperado = orden.items.reduce(
        (acumulado, item) => acumulado + item.price * item.quantity,
        0
      );

      expect(orden.total).to.equal(totalEsperado);
      expect(orden.status).to.equal("created");
    });
  });

  describe("POST /api/mocks/generateMockUsers", () => {

    it("Debe generar la cantidad pedida", async () => {
      const { status, body } = await requester
        .post("/api/mocks/generateMockUsers")
        .send({ users: 5 });

      expect(status).to.equal(201);
      expect(body.payload).to.be.an("array").with.lengthOf(5);
    });

    it("Debe responder 400 si 'users' no es un numero", async () => {
      const { status, body } = await requester
        .post("/api/mocks/generateMockUsers")
        .send({ users: "cinco" });

      expect(status).to.equal(400);
      expect(body.status).to.equal("error");
    });
  });

  describe("POST /api/mocks/generateMockOrders", () => {

    it("Debe generar la cantidad pedida", async () => {
      const { status, body } = await requester
        .post("/api/mocks/generateMockOrders")
        .send({ orders: 3 });

      expect(status).to.equal(201);
      expect(body.payload).to.be.an("array").with.lengthOf(3);
    });
  });
});
