import type { FastifyInstance } from "fastify";
import { AdminController } from "../controllers/admin.controller";
import { MailRepository } from "../repositories/mail.repository";
import { AdminService } from "../services/admin.service";

export default async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  const mailRepository = new MailRepository(fastify.prisma);
  const adminService = new AdminService(mailRepository);
  const adminController = new AdminController(adminService);

  fastify.get(
    "/mails",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    adminController.getMailHistory,
  );
}
