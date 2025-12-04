import * as bg from "@bgord/bun";
import { Env } from "./env";
import { Logger } from "./logger.adapter";

export const Mailer = {
  [bg.NodeEnvironmentEnum.local]: new bg.MailerNoopAdapter(Logger),
  [bg.NodeEnvironmentEnum.test]: new bg.MailerNoopAdapter(Logger),
  [bg.NodeEnvironmentEnum.staging]: new bg.MailerNoopAdapter(Logger),
  [bg.NodeEnvironmentEnum.production]: new bg.MailerSmtpAdapter({
    SMTP_HOST: Env.SMTP_HOST,
    SMTP_PORT: Env.SMTP_PORT,
    SMTP_USER: Env.SMTP_USER,
    SMTP_PASS: Env.SMTP_PASS,
  }),
}[Env.type];
