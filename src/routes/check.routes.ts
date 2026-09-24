import type { FastifyInstance } from "fastify";
import { CheckController } from "../controllers/check.controller";
import { CheckService } from "../services/check.service";

export default async function checkRoutes(fastify: FastifyInstance): Promise<void> {
  const checkService = new CheckService();
  const checkController = new CheckController(checkService);

  fastify.get("/check", { preHandler: fastify.authenticate }, checkController.check);
}
