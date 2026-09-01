import * as bg from "@bgord/bun";
import type hono from "hono";

type Dependencies = { Logger: bg.LoggerPort };

const validation = new bg.ErrorClassifierValidationStrategy([
  bg.MailerSubjectError,
  bg.MailerContentHtmlError,
]);

const http = new bg.ErrorClassifierHttpExceptionHonoStrategy([bg.HttpExceptionErrors]);

export class ErrorHandler {
  static handle: (deps: Dependencies) => hono.ErrorHandler = (deps) =>
    new bg.ErrorHonoHandler(
      [
        http,
        new bg.ErrorClassifierWithLoggerStrategy({ operation: "validation" }, { inner: validation, ...deps }),
      ],
      deps,
    ).handle();
}
