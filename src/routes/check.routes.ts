import type { FastifyInstance } from "fastify";
import { checkQuerySchema } from "../schemas/check.schema";
import { CheckService } from "../services/check.service";

export default async function checkRoutes(fastify: FastifyInstance): Promise<void> {
  const checkService = new CheckService();

  fastify.get("/check", async (request, reply) => {
    const query = checkQuerySchema.parse(request.query);
    const result = await checkService.check(query);
    reply.code(200).send(result);
  });
}
