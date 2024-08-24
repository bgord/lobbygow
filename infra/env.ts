import * as bg from "@bgord/node";
import { z } from "zod";

const EnvironmentSchema = z
  .object({
    PORT: bg.Schema.Port,
    LOGS_LEVEL: bg.Schema.LogLevel,
    SMTP_HOST: bg.Schema.SmtpHost,
    SMTP_PORT: bg.Schema.SmtpPort,
    SMTP_USER: bg.Schema.SmtpUser,
    SMTP_PASS: bg.Schema.SmtpPass,
    EMAIL_FROM: bg.Schema.Email,
    EMAIL_TO: bg.Schema.EmailTo,
    TZ: bg.Schema.TimezoneUTC,
    BASIC_AUTH_USERNAME: bg.Schema.BasicAuthUsername,
    BASIC_AUTH_PASSWORD: bg.Schema.BasicAuthPassword,
    API_KEY: bg.Schema.ApiKey,
  })
  .strip();
type EnvironmentSchemaType = z.infer<typeof EnvironmentSchema>;

export const Env = new bg.EnvironmentValidator<EnvironmentSchemaType>({
  type: process.env.NODE_ENV,
  schema: EnvironmentSchema,
}).load();
