import * as bg from "@bgord/bun";
import type hono from "hono";

type Dependencies = { Logger: bg.LoggerPort };

const validation = new bg.ErrorClassifierValidationStrategy({
  validationErrors: [bg.MailerSubjectError.Invalid, bg.MailerContentHtmlError.Invalid],
});

const http = new bg.ErrorClassifierHttpExceptionHonoStrategy({
  known: [
    bg.ShieldApiKeyStrategyError.Rejected,
    bg.ShieldRateLimitStrategyError.Rejected,
    bg.ShieldTimeoutStrategyError.Rejected,
    bg.ShieldBasicAuthStrategyError.Rejected,
  ],
});

const unknown = new bg.ErrorClassifierUnknownStrategy();

export class ErrorHandler {
  static handle: (deps: Dependencies) => hono.ErrorHandler = (deps) =>
    new bg.ErrorHonoHandler({
      classifiers: [
        http,
        new bg.ErrorClassifierWithLoggerStrategy({ operation: "validation" }, { inner: validation, ...deps }),
      ],
      fallback: new bg.ErrorClassifierWithLoggerStrategy(
        { operation: "unknown_error" },
        { inner: unknown, ...deps },
      ),
    }).handle();
}
