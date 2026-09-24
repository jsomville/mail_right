import { Prisma } from "@prisma/client";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Central error handler: normalizes Zod validation errors, known AppErrors,
 * Prisma errors, and unexpected errors into a consistent JSON shape.
 * Never leaks internal error details for unexpected/5xx errors.
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

  if (error instanceof AppError) {
    const body: ErrorResponseBody = {
      error: {
        code: error.code,
        message: error.expose ? error.message : "An error occurred",
      },
    };
    reply.code(error.statusCode).send(body);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const body: ErrorResponseBody = {
      error: {
        code: "DATABASE_ERROR",
        message: "A database error occurred",
      },
    };
    reply.code(409).send(body);
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    const body: ErrorResponseBody = {
      error: {
        code: "DATABASE_VALIDATION_ERROR",
        message: "Invalid database query",
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
