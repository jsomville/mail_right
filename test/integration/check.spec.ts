import { expect } from "chai";
import type { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createTestApp, resetDatabase } from "../helpers/build-app";
import { createTestUser } from "../helpers/fixtures";

describe("GET /api/check", () => {
  let app: FastifyInstance;
  let token: string;

  before(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
    const user = await createTestUser(app);
    token = app.jwt.sign({ sub: user.id, email: user.email });
  });

  after(async () => {
    await app.close();
  });

  it("returns a greeting message when authenticated with valid parameters", async () => {
    const response = await supertest(app.server)
      .get("/api/check")
      .query({ mail_input: "Please review the report", style: "formal" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("message").that.is.a("string");
  });

  it("returns 400 when required parameters are missing", async () => {
    const response = await supertest(app.server)
      .get("/api/check")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).to.equal(400);
    expect(response.body.error.code).to.equal("VALIDATION_ERROR");
  });

  it("returns 401 when the token is missing", async () => {
    const response = await supertest(app.server)
      .get("/api/check")
      .query({ mail_input: "Hello", style: "formal" });

    expect(response.status).to.equal(401);
  });
});
