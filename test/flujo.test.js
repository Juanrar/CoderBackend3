import { expect } from "chai";
import supertest from "supertest";
import fs from "node:fs";
import app from "../src/app.js";
import OrderModel from "../src/models/order.model.js";
import { ORDER_STATUS } from "../src/constants/order.constants.js";

const requester = supertest(app);

describe("Testing del flujo principal de un pedido", () => {

  const archivosGenerados = [];

  after(() => {
    archivosGenerados.forEach((ruta) => {
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    });
  });

  it("Debe recorrer el ciclo completo: usuario, tienda, pedido, estados y comprobante", async () => {
    const { status: statusCliente, body: cliente } = await requester
      .post("/api/users")
      .send({
        firstName: "Juan",
        lastName: "Lorenzo",
        email: `juan.${Date.now()}@test.com`,
        password: "secreto123"
      });

    expect(statusCliente).to.equal(201);
    expect(cliente.payload.role).to.equal("customer");
    expect(cliente.payload).to.not.have.property("password");

    const { body: dueno } = await requester.post("/api/users").send({
      firstName: "Ana",
      lastName: "Gomez",
      email: `ana.${Date.now()}@test.com`,
      password: "secreto123",
      role: "store"
    });

    const { status: statusTienda, body: tienda } = await requester
      .post("/api/stores")
      .send({
        name: "Kiosco Central",
        address: "Av. Siempreviva 742",
        owner: dueno.payload._id
      });

    expect(statusTienda).to.equal(201);

    const { status: statusPedido, body: pedido } = await requester
      .post("/api/orders")
      .send({
        customer: cliente.payload._id,
        store: tienda.payload._id,
        items: [
          { name: "Teclado", quantity: 2, price: 100 },
          { name: "Mouse", quantity: 1, price: 50 }
        ],
        deliveryAddress: "Calle Falsa 123"
      });

    expect(statusPedido).to.equal(201);
    expect(pedido.payload.total).to.equal(250);
    expect(pedido.payload.status).to.equal(ORDER_STATUS.CREATED);

    const oid = pedido.payload._id;

    const recorrido = [
      ORDER_STATUS.ASSIGNED,
      ORDER_STATUS.PICKED_UP,
      ORDER_STATUS.IN_TRANSIT,
      ORDER_STATUS.DELIVERED
    ];

    for (const estado of recorrido) {
      const { status, body } = await requester
        .put(`/api/orders/${oid}/status`)
        .send({ status: estado });

      expect(status).to.equal(200);
      expect(body.payload.status).to.equal(estado);
    }

    const { status: statusComprobante } = await requester
      .post(`/api/orders/${oid}/proof`)
      .attach("proof", Buffer.alloc(1024, "a"), {
        filename: "entrega.pdf",
        contentType: "application/pdf"
      });

    expect(statusComprobante).to.equal(200);

    const ordenFinal = await OrderModel.findById(oid);
    archivosGenerados.push(ordenFinal.proof.path);

    expect(ordenFinal.status).to.equal(ORDER_STATUS.DELIVERED);
    expect(ordenFinal.proof.originalName).to.equal("entrega.pdf");
    expect(fs.existsSync(ordenFinal.proof.path)).to.equal(true);

    const { body: listado } = await requester
      .get(`/api/orders?customer=${cliente.payload._id}`);

    expect(listado.payload).to.have.lengthOf(1);
    expect(listado.payload[0]._id).to.equal(oid);
  });

  it("Debe rechazar un estado invalido sin alterar el pedido", async () => {
    const { body: cliente } = await requester.post("/api/users").send({
      firstName: "Luis", lastName: "Paz",
      email: `luis.${Date.now()}@test.com`, password: "secreto123"
    });
    const { body: dueno } = await requester.post("/api/users").send({
      firstName: "Eva", lastName: "Rios",
      email: `eva.${Date.now()}@test.com`, password: "secreto123", role: "store"
    });
    const { body: tienda } = await requester.post("/api/stores").send({
      name: "Almacen", address: "Calle 1", owner: dueno.payload._id
    });
    const { body: pedido } = await requester.post("/api/orders").send({
      customer: cliente.payload._id,
      store: tienda.payload._id,
      items: [{ name: "Cable", quantity: 1, price: 10 }],
      deliveryAddress: "Calle 2"
    });

    const { status, body } = await requester
      .put(`/api/orders/${pedido.payload._id}/status`)
      .send({ status: "volando" });

    expect(status).to.equal(400);
    expect(body.error).to.equal("INVALID_STATUS");

    const sinCambios = await OrderModel.findById(pedido.payload._id);
    expect(sinCambios.status).to.equal(ORDER_STATUS.CREATED);
  });
});
