import type { FastifyReply, FastifyRequest } from "fastify";
import type { AdminService } from "../services/admin.service";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  getMailHistory = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = await this.adminService.getMailHistory();
    reply.code(200).send(result);
  };
}
