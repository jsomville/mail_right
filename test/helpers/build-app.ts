import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";

export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp();
  await app.ready();
  return app;
}

export async function resetDatabase(app: FastifyInstance): Promise<void> {
  await app.prisma.mail.deleteMany();
  await app.prisma.user.deleteMany();
}
