import type { FastifyReply, FastifyRequest } from "fastify";
import { checkQuerySchema } from "../schemas/check.schema";
import type { CheckService } from "../services/check.service";

export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  check = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = checkQuerySchema.parse(request.query);
    const result = await this.checkService.check(request.user.sub, query);
    reply.code(200).send(result);
  };
}
