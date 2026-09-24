import { expect } from "chai";
import type { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createTestApp, resetDatabase } from "../helpers/build-app";
import { createTestUser, TEST_USER } from "../helpers/fixtures";

describe("POST /api/auth/login", () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
    await createTestUser(app);
  });

  after(async () => {
    await app.close();
  });

  it("returns a token and a safe user payload for valid credentials", async () => {
    const response = await supertest(app.server)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("token").that.is.a("string");
    expect(response.body.user.email).to.equal(TEST_USER.email);
    expect(response.body.user).to.not.have.property("passwordHash");
  });

  it("returns a generic 401 for an invalid password", async () => {
    const response = await supertest(app.server)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: "wrong-password" });

    expect(response.status).to.equal(401);
    expect(response.body.error.code).to.equal("UNAUTHORIZED");
  });

  it("returns a generic 401 for an unknown email", async () => {
    const response = await supertest(app.server)
      .post("/api/auth/login")
      .send({ email: "unknown@mail-right.com", password: TEST_USER.password });

    expect(response.status).to.equal(401);
  });

  it("returns a 400 validation error for a malformed payload", async () => {
    const response = await supertest(app.server)
      .post("/api/auth/login")
      .send({ email: "not-an-email" });

    expect(response.status).to.equal(400);
    expect(response.body.error.code).to.equal("VALIDATION_ERROR");
  });
});
