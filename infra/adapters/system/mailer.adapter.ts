import * as bg from "@bgord/bun";
import type { z } from "zod/v4";
import type { EnvironmentSchema } from "+infra/env";

export function createMailer(
  Env: ReturnType<bg.EnvironmentValidator<z.infer<typeof EnvironmentSchema>>["load"]>,
  deps: { Logger: bg.LoggerPort },
): bg.MailerPort {
  return {
    [bg.NodeEnvironmentEnum.local]: new bg.MailerNoopAdapter(deps),
    [bg.NodeEnvironmentEnum.test]: new bg.MailerNoopAdapter(deps),
    [bg.NodeEnvironmentEnum.staging]: new bg.MailerNoopAdapter(deps),
    [bg.NodeEnvironmentEnum.production]: new bg.MailerSmtpAdapter({
      SMTP_HOST: Env.SMTP_HOST,
      SMTP_PORT: Env.SMTP_PORT,
      SMTP_USER: Env.SMTP_USER,
      SMTP_PASS: Env.SMTP_PASS,
    }),
  }[Env.type];
}
