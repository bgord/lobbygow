import * as bg from "@bgord/bun";
import type hono from "hono";
import { HTTPException } from "hono/http-exception";
import * as v from "valibot";

type Dependencies = { Logger: bg.LoggerPort };

const validationErrors = [bg.MailerSubjectError.Invalid, bg.MailerContentHtmlError.Invalid];

const knownShieldErrors: ReadonlyArray<string> = [
  bg.ShieldApiKeyStrategyError.Rejected,
  bg.ShieldRateLimitStrategyError.Rejected,
];

// Stryker disable all
export class ErrorHandler {
  static handle: (deps: Dependencies) => hono.ErrorHandler = (deps) => async (error, c) => {
    const url = c.req.url;
    const correlationId = c.get("correlationId");

    if (error instanceof HTTPException) {
      if (knownShieldErrors.includes(error.message)) {
        return Response.json({ message: error.message, _known: true }, { status: error.status });
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

        return Response.json({ message: validationError.message, _known: true }, { status: 400 });
      }

      deps.Logger.error({
        message: "Invalid payload",
        component: "http",
        operation: "invalid_payload",
        correlationId,
        metadata: { url },
        error,
      });

      return Response.json({ message: "payload.invalid.error", _known: true }, { status: 400 });
    }

    deps.Logger.error({
      message: "Unknown error",
      component: "http",
      operation: "unknown_error",
      correlationId,
      error,
    });

    return Response.json({ message: "general.unknown" }, { status: 500 });
  };
}
// Stryker restore all
