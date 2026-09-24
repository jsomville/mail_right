import type { FastifyInstance } from "fastify";
import authRoutes from "./auth.routes";
import checkRoutes from "./check.routes";
import homeRoutes from "./home.routes";

export default async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(homeRoutes, { prefix: "/api" });
  await fastify.register(checkRoutes, { prefix: "/api" });
}
