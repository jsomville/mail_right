import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import path from "node:path";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import jwtPlugin from "./plugins/jwt.plugin";
import prismaPlugin from "./plugins/prisma.plugin";
import securityPlugin from "./plugins/sensible-security.plugin";
import registerRoutes from "./routes/index";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "test" ? "silent" : "info",
      redact: ["req.headers.authorization", "req.body.password"],
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } }
          : undefined,
    },
  });

  // Registered before any plugin/route so all encapsulated child contexts inherit it.
  app.setErrorHandler(errorHandler);

  await app.register(securityPlugin);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  await app.register(fastifyStatic, {
    root: path.join(__dirname, "..", "public"),
    prefix: "/",
  });

  await app.register(registerRoutes);

  return app;
}
