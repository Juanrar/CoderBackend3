import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";

const requester = supertest(app);

const crearUsuario = async (role = "customer") => {
  const { body } = await requester.post("/api/users").send({
    firstName: "Ana",
    lastName: "Gomez",
    email: `ana.${Date.now()}.${Math.random()}@test.com`,
    password: "secreto123",
    role
  });

  return body.payload._id;
};

const crearTienda = async (ownerId) => {
  const { body } = await requester.post("/api/stores").send({
    name: "Kiosco Central",
    address: "Av. Siempreviva 742",
    owner: ownerId
  });

  return body.payload._id;
};

const items = [
  { name: "Teclado", quantity: 2, price: 100 },
  { name: "Mouse", quantity: 1, price: 50 }
];

describe("Testing del modulo Orders", () => {

  let customerId;
  let storeId;

  beforeEach(async () => {
    customerId = await crearUsuario("customer");
    const ownerId = await crearUsuario("store");
    storeId = await crearTienda(ownerId);
  });

  const ordenValida = () => ({
    customer: customerId,
    store: storeId,
    items,
    deliveryAddress: "Calle Falsa 123"
  });

  describe("POST /api/orders", () => {

    it("Debe crear una orden y responder 201", async () => {
      const { status, body } = await requester
        .post("/api/orders")
        .send(ordenValida());

      expect(status).to.equal(201);
      expect(body.payload).to.have.property("_id");
    });

    it("Debe calcular el total a partir de los items", async () => {
      const { body } = await requester
        .post("/api/orders")
        .send(ordenValida());

      expect(body.payload.total).to.equal(250);
    });

    it("Debe ignorar el total enviado por el cliente", async () => {
      const { body } = await requester
        .post("/api/orders")
        .send({ ...ordenValida(), total: 1 });

      expect(body.payload.total).to.equal(250);
    });

    it("Debe iniciar la orden en estado 'created'", async () => {
      const { body } = await requester
        .post("/api/orders")
        .send({ ...ordenValida(), status: "delivered" });

      expect(body.payload.status).to.equal("created");
    });

    it("Debe responder 404 si el customer no existe", async () => {
      const { status, body } = await requester.post("/api/orders").send({
        ...ordenValida(),
        customer: "507f1f77bcf86cd799439011"
      });

      expect(status).to.equal(404);
      expect(body.error).to.equal("USER_NOT_FOUND");
    });

    it("Debe responder 404 si la store no existe", async () => {
      const { status, body } = await requester.post("/api/orders").send({
        ...ordenValida(),
        store: "507f1f77bcf86cd799439011"
      });

      expect(status).to.equal(404);
      expect(body.error).to.equal("STORE_NOT_FOUND");
    });

    it("Debe responder 400 si falta el deliveryAddress", async () => {
      const { deliveryAddress, ...sinDireccion } = ordenValida();

      const { status, body } = await requester
        .post("/api/orders")
        .send(sinDireccion);

      expect(status).to.equal(400);
      expect(body.error).to.equal("VALIDATION_ERROR");
    });
  });

  describe("GET /api/orders/:oid", () => {

    it("Debe devolver la orden con customer y store populados", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      const { status, body } = await requester.get(`/api/orders/${id}`);

      expect(status).to.equal(200);
      expect(body.payload.customer).to.be.an("object");
      expect(body.payload.customer.email).to.be.a("string");
      expect(body.payload.store.name).to.equal("Kiosco Central");
    });

    it("Debe responder 404 si la orden no existe", async () => {
      const { status, body } = await requester.get("/api/orders/507f1f77bcf86cd799439011");

      expect(status).to.equal(404);
      expect(body.error).to.equal("ORDER_NOT_FOUND");
    });
  });

  describe("PUT /api/orders/:oid/status", () => {

    it("Debe actualizar el estado y persistirlo", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      const { status, body } = await requester
        .put(`/api/orders/${id}/status`)
        .send({ status: "assigned" });

      expect(status).to.equal(200);
      expect(body.payload.status).to.equal("assigned");

      const { body: verificacion } = await requester.get(`/api/orders/${id}`);
      expect(verificacion.payload.status).to.equal("assigned");
    });

    it("Debe rechazar un salto de estado no permitido", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      // created -> delivered saltea assigned, picked_up e in_transit.
      const { status, body } = await requester
        .put(`/api/orders/${id}/status`)
        .send({ status: "delivered" });

      expect(status).to.equal(400);
      expect(body.error).to.equal("INVALID_STATUS");
      expect(body.message).to.include("No se puede pasar de 'created' a 'delivered'");
    });

    it("Debe rechazar cambios sobre un pedido en estado final", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      await requester.put(`/api/orders/${id}/status`).send({ status: "cancelled" });

      const { status, body } = await requester
        .put(`/api/orders/${id}/status`)
        .send({ status: "assigned" });

      expect(status).to.equal(400);
      expect(body.message).to.include("estado final");
    });

    it("Debe rechazar repetir el estado actual", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      const { status, body } = await requester
        .put(`/api/orders/${id}/status`)
        .send({ status: "created" });

      expect(status).to.equal(400);
      expect(body.message).to.include("ya se encuentra en estado");
    });

    it("Debe ir registrando el historial de estados", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      await requester.put(`/api/orders/${id}/status`).send({ status: "assigned" });
      await requester.put(`/api/orders/${id}/status`).send({ status: "picked_up" });

      const { body } = await requester.get(`/api/orders/${id}/tracking`);

      expect(body.payload.currentStatus).to.equal("picked_up");
      expect(body.payload.history.map((entrada) => entrada.status))
        .to.deep.equal(["created", "assigned", "picked_up"]);
    });

    it("Debe responder 400 si no se envia el status", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      const { status, body } = await requester
        .put(`/api/orders/${id}/status`)
        .send({});

      expect(status).to.equal(400);
      expect(body.error).to.equal("INVALID_STATUS");
    });

    it("Debe rechazar con 400 un status que no esta en el enum", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      const { status, body } = await requester
        .put(`/api/orders/${id}/status`)
        .send({ status: "volando" });

      expect(status).to.equal(400);
      expect(body.error).to.equal("INVALID_STATUS");
    });
  });

  describe("DELETE /api/orders/:oid", () => {

    it("Debe eliminar la orden", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      const { status } = await requester.delete(`/api/orders/${id}`);
      expect(status).to.equal(200);

      const { status: statusPosterior } = await requester.get(`/api/orders/${id}`);
      expect(statusPosterior).to.equal(404);
    });
  });

  describe("GET /api/orders/:oid/tracking", () => {

    it("Debe devolver el seguimiento del pedido recien creado", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      const { status, body } = await requester.get(`/api/orders/${id}/tracking`);

      expect(status).to.equal(200);
      expect(body.payload.currentStatus).to.equal("created");
      expect(body.payload.isFinal).to.equal(false);
      expect(body.payload.hasProof).to.equal(false);
      expect(body.payload.nextStatuses).to.have.members(["assigned", "cancelled"]);
      expect(body.payload.history).to.have.lengthOf(1);
    });

    it("Debe marcar como final un pedido cancelado", async () => {
      const creada = await requester.post("/api/orders").send(ordenValida());
      const id = creada.body.payload._id;

      await requester.put(`/api/orders/${id}/status`).send({ status: "cancelled" });

      const { body } = await requester.get(`/api/orders/${id}/tracking`);

      expect(body.payload.isFinal).to.equal(true);
      expect(body.payload.nextStatuses).to.have.lengthOf(0);
    });

    it("Debe responder 404 si el pedido no existe", async () => {
      const { status, body } = await requester
        .get("/api/orders/000000000000000000000000/tracking");

      expect(status).to.equal(404);
      expect(body.error).to.equal("ORDER_NOT_FOUND");
    });
  });

  describe("Prioridad del pedido", () => {

    it("Debe respetar la prioridad enviada por el cliente", async () => {
      const { body } = await requester
        .post("/api/orders")
        .send({ ...ordenValida(), priority: "high" });

      expect(body.payload.priority).to.equal("high");
    });

    it("Debe usar 'normal' si no se envia prioridad", async () => {
      const { body } = await requester.post("/api/orders").send(ordenValida());

      expect(body.payload.priority).to.equal("normal");
    });

    it("Debe responder 400 si la prioridad no es valida", async () => {
      const { status, body } = await requester
        .post("/api/orders")
        .send({ ...ordenValida(), priority: "urgentisima" });

      expect(status).to.equal(400);
      expect(body.error).to.equal("VALIDATION_ERROR");
    });
  });
});
