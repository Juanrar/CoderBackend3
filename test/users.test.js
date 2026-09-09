import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";

const requester = supertest(app);

const usuarioValido = {
  firstName: "Juan",
  lastName: "Perez",
  email: "juan.perez@test.com",
  password: "secreto123"
};

describe("Testing del modulo Users", () => {

  describe("POST /api/users", () => {

    it("Debe crear un usuario y responder 201", async () => {
      const { status, body } = await requester
        .post("/api/users")
        .send(usuarioValido);

      expect(status).to.equal(201);
      expect(body.status).to.equal("success");
      expect(body.payload).to.have.property("_id");
      expect(body.payload.email).to.equal(usuarioValido.email);
    });

    it("NO debe devolver el password en la respuesta", async () => {
      const { body } = await requester
        .post("/api/users")
        .send(usuarioValido);

      expect(body.payload).to.not.have.property("password");
    });

    it("Debe asignar el rol 'customer' por defecto", async () => {
      const { body } = await requester
        .post("/api/users")
        .send(usuarioValido);

      expect(body.payload.role).to.equal("customer");
    });

    it("Debe responder 400 si falta el email", async () => {
      const { email, ...sinEmail } = usuarioValido;

      const { status, body } = await requester
        .post("/api/users")
        .send(sinEmail);

      expect(status).to.equal(400);
      expect(body.error).to.equal("VALIDATION_ERROR");
    });

    it("Debe responder 400 si falta el password", async () => {
      const { password, ...sinPassword } = usuarioValido;

      const { status } = await requester
        .post("/api/users")
        .send(sinPassword);

      expect(status).to.equal(400);
    });
  });

  describe("GET /api/users", () => {

    it("Debe devolver un array vacio si no hay usuarios", async () => {
      const { status, body } = await requester.get("/api/users");

      expect(status).to.equal(200);
      expect(body.payload).to.be.an("array").that.is.empty;
    });

    it("Debe devolver los usuarios creados", async () => {
      await requester.post("/api/users").send(usuarioValido);
      await requester.post("/api/users").send({
        ...usuarioValido,
        email: "otro@test.com"
      });

      const { body } = await requester.get("/api/users");

      expect(body.payload).to.have.lengthOf(2);
    });
  });

  describe("GET /api/users/:uid", () => {

    it("Debe devolver el usuario correcto", async () => {
      const creado = await requester.post("/api/users").send(usuarioValido);
      const id = creado.body.payload._id;

      const { status, body } = await requester.get(`/api/users/${id}`);

      expect(status).to.equal(200);
      expect(body.payload._id).to.equal(id);
    });

    it("Debe responder 404 si el usuario no existe", async () => {
      const idInexistente = "507f1f77bcf86cd799439011";

      const { status, body } = await requester.get(`/api/users/${idInexistente}`);

      expect(status).to.equal(404);
      expect(body.error).to.equal("USER_NOT_FOUND");
    });
  });

  describe("PUT /api/users/:uid", () => {

    it("Debe modificar el usuario y persistir el cambio", async () => {
      const creado = await requester.post("/api/users").send(usuarioValido);
      const id = creado.body.payload._id;

      const { status, body } = await requester
        .put(`/api/users/${id}`)
        .send({ firstName: "Pedro" });

      expect(status).to.equal(200);
      expect(body.payload.firstName).to.equal("Pedro");

      const { body: verificacion } = await requester.get(`/api/users/${id}`);
      expect(verificacion.payload.firstName).to.equal("Pedro");
    });

    it("Debe responder 404 si el usuario no existe", async () => {
      const { status } = await requester
        .put("/api/users/507f1f77bcf86cd799439011")
        .send({ firstName: "Pedro" });

      expect(status).to.equal(404);
    });
  });

  describe("DELETE /api/users/:uid", () => {

    it("Debe eliminar el usuario", async () => {
      const creado = await requester.post("/api/users").send(usuarioValido);
      const id = creado.body.payload._id;

      const { status } = await requester.delete(`/api/users/${id}`);
      expect(status).to.equal(200);

      const { status: statusPosterior } = await requester.get(`/api/users/${id}`);
      expect(statusPosterior).to.equal(404);
    });

    it("Debe responder 404 si el usuario no existe", async () => {
      const { status } = await requester.delete("/api/users/507f1f77bcf86cd799439011");

      expect(status).to.equal(404);
    });
  });
});
