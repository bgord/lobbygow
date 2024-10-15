import * as bgn from "@bgord/node";
import * as bgb from "@bgord/bun";
import hono from "hono";
import z from "zod";
import { HTTPException } from "hono/http-exception";

import * as infra from "../../infra";

export class ErrorHandler {
  static handle: hono.ErrorHandler = async (error, c) => {
    const url = c.req.url;
    const correlationId = c.get("requestId") as bgn.Schema.CorrelationIdType;

    if (error instanceof HTTPException) {
      if (error.message === "request_timeout_error") {
        return c.json({ message: "request_timeout_error", _known: true }, 408);
      }

      if (error.message === bgb.AccessDeniedApiKeyError.message) {
        return c.json(
          { message: bgb.AccessDeniedApiKeyError.message, _known: true },
          bgb.AccessDeniedApiKeyError.status,
        );
      }

      if (error.message === bgb.TooManyRequestsError.message) {
        return c.json(
          { message: bgb.TooManyRequestsError.message, _known: true },
          bgb.TooManyRequestsError.status,
        );
      }

      return error.getResponse();
    }

    if (error instanceof z.ZodError) {
      infra.logger.error({
        message: "Invalid payload",
        operation: "invalid_payload",
        correlationId,
        metadata: { url, body: await c.req.json() },
      });

      return c.json({ message: "payload.invalid.error", _known: true }, 400);
    }

    infra.logger.error({
      message: "Unknown error",
      operation: "unknown_error",
      correlationId,
      metadata: infra.logger.formatError(error),
    });

    return c.json({ message: "general.unknown" }, 500);
  };
}
