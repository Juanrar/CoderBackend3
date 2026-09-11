import { expect } from "chai";
import supertest from "supertest";
import fs from "node:fs";
import path from "node:path";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";
import OrderModel from "../src/models/order.model.js";

const requester = supertest(app);

const ID_INEXISTENTE = "000000000000000000000000";

const pdf = (kb = 1) => Buffer.alloc(kb * 1024, "a");

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

const crearOrden = async () => {
  const customer = await crearUsuario("customer");
  const owner = await crearUsuario("store");

  const { body: tienda } = await requester.post("/api/stores").send({
    name: "Kiosco Central",
    address: "Av. Siempreviva 742",
    owner
  });

  const { body: orden } = await requester.post("/api/orders").send({
    customer,
    store: tienda.payload._id,
    items: [{ name: "Teclado", quantity: 2, price: 100 }],
    deliveryAddress: "Calle Falsa 123"
  });

  return orden.payload._id;
};

describe("Testing de carga de archivos (Multer)", () => {

  const archivosGenerados = [];

  const registrar = (rutaArchivo) => {
    if (rutaArchivo) archivosGenerados.push(rutaArchivo);
  };

  after(() => {
    archivosGenerados.forEach((rutaArchivo) => {
      if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);
    });
  });

  describe("POST /api/users/:uid/documents", () => {

    it("Debe subir el documento y guardar la metadata en la base", async () => {
      const uid = await crearUsuario();

      const { status, body } = await requester
        .post(`/api/users/${uid}/documents`)
        .field("type", "user_document")
        .attach("document", pdf(), { filename: "dni.pdf", contentType: "application/pdf" });

      expect(status).to.equal(200);
      expect(body.status).to.equal("success");

      const usuario = await UserModel.findById(uid);
      expect(usuario.documents).to.have.lengthOf(1);

      const documento = usuario.documents[0];
      registrar(documento.path);

      expect(documento.originalName).to.equal("dni.pdf");
      expect(documento.mimeType).to.equal("application/pdf");
      expect(documento.type).to.equal("user_document");
      expect(documento.size).to.be.a("number").that.is.greaterThan(0);

      expect(fs.existsSync(documento.path)).to.equal(true);
      expect(path.basename(documento.path)).to.not.equal("dni.pdf");
    });

    it("Debe acumular documentos sin pisar los anteriores", async () => {
      const uid = await crearUsuario();

      for (const nombre of ["uno.pdf", "dos.pdf"]) {
        await requester
          .post(`/api/users/${uid}/documents`)
          .field("type", "user_document")
          .attach("document", pdf(), { filename: nombre, contentType: "application/pdf" });
      }

      const usuario = await UserModel.findById(uid);
      usuario.documents.forEach((documento) => registrar(documento.path));

      expect(usuario.documents).to.have.lengthOf(2);
    });

    it("Debe responder 400 y no guardar nada si no se envia archivo", async () => {
      const uid = await crearUsuario();

      const { status, body } = await requester
        .post(`/api/users/${uid}/documents`)
        .field("type", "user_document");

      expect(status).to.equal(400);
      expect(body.error).to.equal("FILE_REQUIRED");

      const usuario = await UserModel.findById(uid);
      expect(usuario.documents).to.have.lengthOf(0);
    });

    it("Debe responder 400 si el tipo de archivo no esta permitido", async () => {
      const uid = await crearUsuario();

      const { status, body } = await requester
        .post(`/api/users/${uid}/documents`)
        .field("type", "user_document")
        .attach("document", Buffer.from("MZ"), {
          filename: "virus.exe",
          contentType: "application/x-msdownload"
        });

      expect(status).to.equal(400);
      expect(body.error).to.equal("INVALID_FILE_TYPE");
    });

    it("Debe responder 400 si el archivo supera el limite de 5MB", async () => {
      const uid = await crearUsuario();

      const { status, body } = await requester
        .post(`/api/users/${uid}/documents`)
        .field("type", "user_document")
        .attach("document", pdf(6 * 1024), {
          filename: "grande.pdf",
          contentType: "application/pdf"
        });

      expect(status).to.equal(400);
      expect(body.error).to.equal("FILE_TOO_LARGE");
    });

    it("Debe responder 400 si el campo del archivo no es el esperado", async () => {
      const uid = await crearUsuario();

      const { status, body } = await requester
        .post(`/api/users/${uid}/documents`)
        .attach("otroCampo", pdf(), {
          filename: "dni.pdf",
          contentType: "application/pdf"
        });

      expect(status).to.equal(400);
      expect(body.error).to.equal("INVALID_FILE_FIELD");
    });

    it("Debe responder 400 si el tipo de documento no esta en el enum", async () => {
      const uid = await crearUsuario();

      const { status, body } = await requester
        .post(`/api/users/${uid}/documents`)
        .field("type", "pasaporte_intergalactico")
        .attach("document", pdf(), { filename: "dni.pdf", contentType: "application/pdf" });

      expect(status).to.equal(400);
      expect(body.error).to.equal("INVALID_DOCUMENT_TYPE");
    });

    it("Debe responder 404 si el usuario no existe", async () => {
      const { status, body } = await requester
        .post(`/api/users/${ID_INEXISTENTE}/documents`)
        .field("type", "user_document")
        .attach("document", pdf(), { filename: "dni.pdf", contentType: "application/pdf" });

      expect(status).to.equal(404);
      expect(body.error).to.equal("USER_NOT_FOUND");
    });
  });

  describe("POST /api/orders/:oid/proof", () => {

    it("Debe subir el comprobante y asociarlo al pedido", async () => {
      const oid = await crearOrden();

      const { status, body } = await requester
        .post(`/api/orders/${oid}/proof`)
        .attach("proof", pdf(), {
          filename: "entrega.pdf",
          contentType: "application/pdf"
        });

      expect(status).to.equal(200);
      expect(body.status).to.equal("success");

      const orden = await OrderModel.findById(oid);
      registrar(orden.proof.path);

      expect(orden.proof.originalName).to.equal("entrega.pdf");
      expect(orden.proof.mimeType).to.equal("application/pdf");
      expect(fs.existsSync(orden.proof.path)).to.equal(true);
    });

    it("Debe responder 400 si no se envia comprobante", async () => {
      const oid = await crearOrden();

      const { status, body } = await requester.post(`/api/orders/${oid}/proof`).send();

      expect(status).to.equal(400);
      expect(body.error).to.equal("FILE_REQUIRED");
    });

    it("Debe responder 400 si el tipo de archivo no esta permitido", async () => {
      const oid = await crearOrden();

      const { status, body } = await requester
        .post(`/api/orders/${oid}/proof`)
        .attach("proof", Buffer.from("<html>"), {
          filename: "pagina.html",
          contentType: "text/html"
        });

      expect(status).to.equal(400);
      expect(body.error).to.equal("INVALID_FILE_TYPE");
    });

    it("Debe responder 404 si el pedido no existe", async () => {
      const { status, body } = await requester
        .post(`/api/orders/${ID_INEXISTENTE}/proof`)
        .attach("proof", pdf(), {
          filename: "entrega.pdf",
          contentType: "application/pdf"
        });

      expect(status).to.equal(404);
      expect(body.error).to.equal("ORDER_NOT_FOUND");
    });
  });
});
