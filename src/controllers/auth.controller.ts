import type { FastifyReply, FastifyRequest } from "fastify";
import { loginBodySchema } from "../schemas/auth.schema";
import type { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = loginBodySchema.parse(request.body);
    const result = await this.authService.login(body);
    reply.code(200).send(result);
  };
}
