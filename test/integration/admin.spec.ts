import { expect } from "chai";
import type { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createTestApp, resetDatabase } from "../helpers/build-app";
import { createTestAdmin, createTestUser } from "../helpers/fixtures";

describe("GET /api/admin/mails", () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  after(async () => {
    await app.close();
  });

  it("returns the full mail history when authenticated as an admin", async () => {
    const admin = await createTestAdmin(app);
    const user = await createTestUser(app);
    await app.prisma.mail.create({
      data: {
        userId: user.id,
        mailInput: "Original mail text",
        mailOutput: "Improved mail text",
        promptTokens: 8,
        completionTokens: 4,
        cost: 0.01,
      },
    });
    const token = app.jwt.sign({ sub: admin.id, email: admin.email, role: "ADMIN" });

    const response = await supertest(app.server)
      .get("/api/admin/mails")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.mails).to.have.length(1);
    expect(response.body.mails[0]).to.include({ promptTokens: 8, completionTokens: 4, cost: 0.01 });
    expect(response.body.mails[0].user.email).to.equal(user.email);
  });

  it("returns 403 when authenticated as a non-admin user", async () => {
    const user = await createTestUser(app);
    const token = app.jwt.sign({ sub: user.id, email: user.email, role: "USER" });

    const response = await supertest(app.server)
      .get("/api/admin/mails")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).to.equal(403);
    expect(response.body.error.code).to.equal("FORBIDDEN");
  });

  it("returns 401 when the token is missing", async () => {
    const response = await supertest(app.server).get("/api/admin/mails");
    expect(response.status).to.equal(401);
  });
});
