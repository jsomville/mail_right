import type { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";

/**
 * Verifies the Bearer JWT on the request and populates `request.user`.
 * Used as a `preHandler` on protected routes via `fastify.authenticate`.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    const error = new UnauthorizedError("Invalid or missing authentication token");
    reply.code(error.statusCode);
    throw error;
  }
}

/**
 * Restricts a route to admins. Must run after `authenticate` so `request.user` is populated.
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (request.user.role !== "ADMIN") {
    const error = new ForbiddenError("Admin access required");
    reply.code(error.statusCode);
    throw error;
  }
}
