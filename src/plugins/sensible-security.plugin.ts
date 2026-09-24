import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

export default fp(async function securityPlugin(fastify: FastifyInstance) {
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });
});
