import type { FastifyInstance } from "fastify";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import checkRoutes from "./check.routes";
import homeRoutes from "./home.routes";

export default async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(homeRoutes, { prefix: "/api" });
  await fastify.register(checkRoutes, { prefix: "/api" });
  await fastify.register(adminRoutes, { prefix: "/api/admin" });
}
