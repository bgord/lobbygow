import * as bg from "@bgord/bun";
import type hono from "hono";
import { HTTPException } from "hono/http-exception";
import z from "zod/v4";

type Dependencies = { Logger: bg.LoggerPort };

export class ErrorHandler {
  static handle: (deps: Dependencies) => hono.ErrorHandler = (deps) => async (error, c) => {
    const url = c.req.url;
    const correlationId = c.get("requestId") as bg.CorrelationIdType;

    if (error instanceof HTTPException) {
      if (error.message === "request_timeout_error") {
        return c.json({ message: "request_timeout_error", _known: true }, 408);
      }

      if (error.message === bg.ShieldApiKeyError.message) {
        return c.json({ message: bg.ShieldApiKeyError.message, _known: true }, bg.ShieldApiKeyError.status);
      }

      if (error.message === bg.ShieldRateLimitError.message) {
        return c.json(
          { message: bg.ShieldRateLimitError.message, _known: true },
          bg.ShieldRateLimitError.status,
        );
      }

      return error.getResponse();
    }

    if (error instanceof z.ZodError) {
      deps.Logger.error({
        message: "Invalid payload",
        component: "http",
        operation: "invalid_payload",
        correlationId,
        metadata: { url },
        error,
      });

      return c.json({ message: "payload.invalid.error", _known: true }, 400);
    }

    deps.Logger.error({
      message: "Unknown error",
      component: "http",
      operation: "unknown_error",
      correlationId,
      error,
    });

    return c.json({ message: "general.unknown" }, 500);
  };
}
