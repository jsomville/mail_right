import jwt from "@fastify/jwt";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env";
import { authenticate } from "../middleware/authenticate";

export default fp(async function jwtPlugin(fastify: FastifyInstance) {
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  fastify.decorate("authenticate", authenticate);
});
