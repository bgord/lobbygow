import * as bg from "@bgord/bun";
import type hono from "hono";
import { HTTPException } from "hono/http-exception";
import * as v from "valibot";

type Dependencies = { Logger: bg.LoggerPort };

const validationErrors = [bg.MailerSubjectError.Invalid, bg.MailerContentHtmlError.Invalid] as Array<string>;

export class ErrorHandler {
  static handle: (deps: Dependencies) => hono.ErrorHandler = (deps) => async (error, c) => {
    const url = c.req.url;
    const correlationId = c.get("requestId") as bg.CorrelationIdType;

    if (error instanceof HTTPException) {
      if (error.message === "request_timeout_error") {
        return c.json({ message: "request_timeout_error", _known: true }, 408);
      }

      if (error.message === bg.ShieldApiKeyStrategyError.Rejected) {
        return c.json({ message: bg.ShieldApiKeyStrategyError.Rejected, _known: true }, 403);
      }

      if (error.message === bg.ShieldRateLimitStrategyError.Rejected) {
        return c.json({ message: bg.ShieldRateLimitStrategyError.Rejected, _known: true }, 429);
      }

      return error.getResponse();
    }

    if (error instanceof v.ValiError) {
      const validationError = error.issues.find((issue) => validationErrors.includes(issue.message));

      if (validationError) {
        deps.Logger.error({
          message: "Expected validation error",
          component: "http",
          operation: "validation",
          correlationId,
          metadata: { url, error: validationError },
          error,
        });

        return c.json({ message: validationError.message, _known: true }, 400);
      }

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
