import { expect } from "chai";
import type { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createTestApp, resetDatabase } from "../helpers/build-app";
import { createTestUser, TEST_USER } from "../helpers/fixtures";

describe("GET /api/home", () => {
  let app: FastifyInstance;
  let token: string;

  before(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
    const user = await createTestUser(app);
    await app.prisma.mail.create({
      data: {
        userId: user.id,
        mailInput: "Original mail text",
        mailOutput: "Improved mail text",
        cost: 0.01,
      },
    });
    token = app.jwt.sign({ sub: user.id, email: user.email });
  });

  after(async () => {
    await app.close();
  });

  it("returns the current user and their mails when authenticated", async () => {
    const response = await supertest(app.server)
      .get("/api/home")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.user.email).to.equal(TEST_USER.email);
    expect(response.body.user).to.not.have.property("passwordHash");
    expect(response.body.mails).to.have.length(1);
  });

  it("returns 401 when the Authorization header is missing", async () => {
    const response = await supertest(app.server).get("/api/home");
    expect(response.status).to.equal(401);
  });

  it("returns 401 when the JWT is invalid", async () => {
    const response = await supertest(app.server)
      .get("/api/home")
      .set("Authorization", "Bearer this-is-not-a-valid-token");

    expect(response.status).to.equal(401);
  });
});
