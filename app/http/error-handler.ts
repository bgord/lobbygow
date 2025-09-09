import * as bg from "@bgord/bun";
import type hono from "hono";
import { HTTPException } from "hono/http-exception";
import z from "zod/v4";
import { Logger } from "+infra/logger.adapter";

export class ErrorHandler {
  static handle: hono.ErrorHandler = async (error, c) => {
    const url = c.req.url;
    const correlationId = c.get("requestId") as bg.CorrelationIdType;

    if (error instanceof HTTPException) {
      if (error.message === "request_timeout_error") {
        return c.json({ message: "request_timeout_error", _known: true }, 408);
      }

      if (error.message === bg.AccessDeniedApiKeyError.message) {
        return c.json(
          { message: bg.AccessDeniedApiKeyError.message, _known: true },
          bg.AccessDeniedApiKeyError.status,
        );
      }

      if (error.message === bg.TooManyRequestsError.message) {
        return c.json(
          { message: bg.TooManyRequestsError.message, _known: true },
          bg.TooManyRequestsError.status,
        );
      }

      return error.getResponse();
    }

    if (error instanceof z.ZodError) {
      Logger.error({
        message: "Invalid payload",
        component: "http",
        operation: "invalid_payload",
        correlationId,
        metadata: { url, body: await bg.safeParseBody(c) },
        error: bg.formatError(error),
      });

      return c.json({ message: "payload.invalid.error", _known: true }, 400);
    }

    Logger.error({
      message: "Unknown error",
      component: "http",
      operation: "unknown_error",
      correlationId,
      error: bg.formatError(error),
    });

    return c.json({ message: "general.unknown" }, 500);
  };
}
