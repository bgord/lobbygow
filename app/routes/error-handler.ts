import * as bg from "@bgord/node";
import express from "express";
import z from "zod";

import * as infra from "../../infra";

export class ErrorHandler {
  /* eslint-disable max-params */
  static handle: express.ErrorRequestHandler = async (
    error,
    request,
    response,
    next,
  ) => {
    if (error instanceof bg.Errors.InvalidCredentialsError) {
      infra.logger.error({
        message: "Invalid credentials",
        operation: "invalid_credentials_error",
        correlationId: request.requestId,
      });
      return response.redirect("/");
    }

    if (error instanceof bg.Errors.AccessDeniedError) {
      infra.logger.error({
        message: "Access denied",
        operation: "access_denied_error",
        correlationId: request.requestId,
      });
      return response.redirect("/");
    }

    if (error instanceof bg.Errors.FileNotFoundError) {
      infra.logger.error({
        message: "File not found",
        operation: "file_not_found_error",
        correlationId: request.requestId,
      });

      return response.status(404).send("File not found");
    }

    if (error instanceof bg.Errors.TooManyRequestsError) {
      infra.logger.error({
        message: "Too many requests",
        operation: "too_many_requests",
        correlationId: request.requestId,
        metadata: { remainingMs: error.remainingMs },
      });

      return response
        .status(429)
        .send({ message: "app.too_many_requests", _known: true });
    }

    if (error instanceof bg.Errors.RequestTimeoutError) {
      infra.logger.error({
        message: "Request timeout error",
        operation: "request_timeout_error",
        correlationId: request.requestId,
        metadata: { timeoutMs: error.ms },
      });

      return response
        .status(408)
        .send({ message: "request_timeout_error", _known: true });
    }

    if (error instanceof bg.Errors.InvalidRevisionError) {
      infra.logger.error({
        message: "Invalid revision",
        operation: "revision_invalid_error",
        correlationId: request.requestId,
        metadata: { url: request.url },
      });

      return response
        .status(400)
        .send({ message: "revision.invalid.error", _known: true });
    }

    if (error instanceof bg.Errors.RevisionMismatchError) {
      infra.logger.error({
        message: "Revision mismatch",
        operation: "revision_mismatch_error",
        correlationId: request.requestId,
        metadata: { url: request.url },
      });

      return response
        .status(412)
        .send({ message: "revision.mismatch.error", _known: true });
    }

    if (error instanceof z.ZodError) {
      infra.logger.error({
        message: "Invalid payload",
        operation: "invalid_payload",
        correlationId: request.requestId,
        metadata: { url: request.url, body: request.body },
      });

      return response
        .status(400)
        .send({ message: "payload.invalid.error", _known: true });
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
