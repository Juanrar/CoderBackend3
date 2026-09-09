import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";

const requester = supertest(app);

describe("Testing del servidor", () => {
    it("GET / debe responder con status 200 y un mensaje de bienvenida", async () => {
        const response = await requester.get("/");

        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
    });

    it("GET /health debe responder con status 200", async () => {
        const response = await requester.get("/health");

        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
    });

    it("Ruta inexistente debe responder con status 404", async () => {
        const response = await requester.get("/ruta-inexistente");

        expect(response.status).to.equal(404);
        expect(response.body.status).to.equal("error");
    })
})