import * as bg from "@bgord/node";
import express from "express";
import z from "zod";

import * as infra from "../../infra";

export class ErrorHandler {
  static handle: express.ErrorRequestHandler = async (
    error,
    request,
    response,
    next,
  ) => {
    const url = request.url;

    if (error instanceof bg.Errors.InvalidCredentialsError) {
      infra.logger.error({
        message: "Invalid credentials",
        operation: "invalid_credentials_error",
        correlationId: request.requestId,
        metadata: { url },
      });
      response
        .status(429)
        .send({ message: "app.credentials.invalid.error", _known: true });
      return;
    }

    if (error instanceof bg.Errors.AccessDeniedError) {
      infra.logger.error({
        message: "Access denied",
        operation: "access_denied_error",
        correlationId: request.requestId,
        metadata: { reason: error.reason, message: error.message, url },
      });
      response
        .status(403)
        .send({ message: "app.access.denied.error", _known: true });
      return;
    }

    if (error instanceof bg.Errors.TooManyRequestsError) {
      infra.logger.error({
        message: "Too many requests",
        operation: "too_many_requests",
        correlationId: request.requestId,
        metadata: { remainingMs: error.remainingMs, url },
      });

      response
        .status(429)
        .send({ message: "app.too_many_requests", _known: true });
      return;
    }

    if (error instanceof bg.Errors.RequestTimeoutError) {
      infra.logger.error({
        message: "Request timeout error",
        operation: "request_timeout_error",
        correlationId: request.requestId,
        metadata: { timeoutMs: error.ms, url },
      });

      response
        .status(408)
        .send({ message: "request_timeout_error", _known: true });
      return;
    }

    if (error instanceof z.ZodError) {
      infra.logger.error({
        message: "Invalid payload",
        operation: "invalid_payload",
        correlationId: request.requestId,
        metadata: { url, body: request.body },
      });

      response
        .status(400)
        .send({ message: "payload.invalid.error", _known: true });
      return;
    }

    infra.logger.error({
      message: "Unknown error",
      operation: "unknown_error",
      correlationId: request.requestId,
      metadata: infra.logger.formatError(error),
    });

    return next(error);
  };
}
