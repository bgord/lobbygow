import * as bg from "@bgord/bun";
import type { EnvironmentSchemaType } from "+infra/env";

export function createMailer(
  type: bg.NodeEnvironmentEnum,
  Env: EnvironmentSchemaType,
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
  }[type];
}
