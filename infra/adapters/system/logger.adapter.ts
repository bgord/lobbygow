import * as bg from "@bgord/bun";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";

export function createLogger(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
): bg.LoggerPort {
  const app = "lobbygow";
  const redactor = new bg.RedactorCompositeAdapter([
    new bg.RedactorCompactArrayAdapter(),
    new bg.RedactorMaskAdapter(bg.RedactorMaskAdapter.DEFAULT_KEYS),
  ]);
  const LoggerWinstonLocalAdapter = new bg.LoggerWinstonLocalAdapter({ app, redactor }).create(
    Env.LOGS_LEVEL,
  );
  const LoggerWinstonProductionAdapter = new bg.LoggerWinstonProductionAdapter({
    app,
    AXIOM_API_TOKEN: Env.AXIOM_API_TOKEN,
    redactor,
  });

  return {
    [bg.NodeEnvironmentEnum.local]: LoggerWinstonLocalAdapter,
    [bg.NodeEnvironmentEnum.test]: new bg.LoggerNoopAdapter(),
    [bg.NodeEnvironmentEnum.staging]: new bg.LoggerNoopAdapter(),
    [bg.NodeEnvironmentEnum.production]: LoggerWinstonProductionAdapter.create(Env.LOGS_LEVEL),
  }[Env.type];
}
