import type { FastifyReply, FastifyRequest } from "fastify";
import type { HomeService } from "../services/home.service";

export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  getHome = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = await this.homeService.getHomeData(request.user.sub);
    reply.code(200).send(result);
  };
}
