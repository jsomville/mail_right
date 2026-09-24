import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";

export default async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const userRepository = new UserRepository(fastify.prisma);
  const authService = new AuthService(userRepository, fastify.jwt.sign.bind(fastify.jwt));
  const authController = new AuthController(authService);

  fastify.post("/login", authController.login);
}
