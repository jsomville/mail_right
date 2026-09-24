import type { FastifyInstance } from "fastify";
import { env } from "../config/env";
import { CheckController } from "../controllers/check.controller";
import { MailRepository } from "../repositories/mail.repository";
import { UserRepository } from "../repositories/user.repository";
import { CheckService } from "../services/check.service";

export default async function checkRoutes(fastify: FastifyInstance): Promise<void> {
  const mailRepository = new MailRepository(fastify.prisma);
  const userRepository = new UserRepository(fastify.prisma);
  const checkService = new CheckService(mailRepository, userRepository, env.MAX_MAIL_HISTORY);
  const checkController = new CheckController(checkService);

  fastify.get("/check", { preHandler: fastify.authenticate }, checkController.check);
}
