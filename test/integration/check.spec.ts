import { expect } from "chai";
import type { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createTestApp } from "../helpers/build-app";

describe("GET /api/check", () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  it("returns a message with valid parameters", async () => {
    const response = await supertest(app.server)
      .get("/api/check")
      .query({ mail_input: "Please review the report", style: "formal" });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("message").that.is.a("string");
  });

  it("returns 400 when required parameters are missing", async () => {
    const response = await supertest(app.server).get("/api/check");

    expect(response.status).to.equal(400);
    expect(response.body.error.code).to.equal("VALIDATION_ERROR");
  });
});
