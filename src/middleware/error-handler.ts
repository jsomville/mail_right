import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Central error handler: normalizes Zod validation errors and unexpected errors
 * into a consistent JSON shape. Never leaks internal error details for 5xx errors.
 */
export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    const body: ErrorResponseBody = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.flatten(),
      },
    };
    reply.code(400).send(body);
    return;
  }

  const fastifyError = error as FastifyError;
  if (fastifyError.statusCode && fastifyError.statusCode < 500) {
    const body: ErrorResponseBody = {
      error: {
        code: fastifyError.code ?? "BAD_REQUEST",
        message: fastifyError.message,
      },
    };
    reply.code(fastifyError.statusCode).send(body);
    return;
  }

  request.log.error({ err: error }, "Unhandled error");
  const body: ErrorResponseBody = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  };
  reply.code(500).send(body);
}
