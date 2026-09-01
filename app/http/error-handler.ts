import * as bg from "@bgord/bun";
import type hono from "hono";

type Dependencies = { Logger: bg.LoggerPort };

const validation = new bg.ErrorClassifierValidationStrategy([
  bg.MailerSubjectError,
  bg.MailerContentHtmlError,
]);

export class ErrorHandler {
  static handle: (deps: Dependencies) => hono.ErrorHandler = (deps) =>
    new bg.ErrorHonoHandler(
      [
        new bg.ErrorClassifierHttpExceptionHonoStrategy([bg.HttpExceptionErrors]),
        new bg.ErrorClassifierWithLoggerStrategy({ operation: "validation" }, { inner: validation, ...deps }),
      ],
      deps,
    ).handle();
}
