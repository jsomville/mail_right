import type { FastifyInstance } from "fastify";
import { env } from "../config/env";
import { HomeController } from "../controllers/home.controller";
import { MailRepository } from "../repositories/mail.repository";
import { UserRepository } from "../repositories/user.repository";
import { HomeService } from "../services/home.service";

export default async function homeRoutes(fastify: FastifyInstance): Promise<void> {
  const userRepository = new UserRepository(fastify.prisma);
  const mailRepository = new MailRepository(fastify.prisma);
  const homeService = new HomeService(userRepository, mailRepository, env.MAX_MAIL_HISTORY);
  const homeController = new HomeController(homeService);

  fastify.get("/home", { preHandler: fastify.authenticate }, homeController.getHome);
}
