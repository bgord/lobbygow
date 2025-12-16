import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { z } from "zod/v4";

export const Schema = z
  .object({
    PORT: bg.Port,
    LOGS_LEVEL: bg.LogLevel,
    SMTP_HOST: bg.SmtpHost,
    SMTP_PORT: bg.SmtpPort,
    SMTP_USER: bg.SmtpUser,
    SMTP_PASS: bg.SmtpPass,
    EMAIL_FROM: tools.Email,
    EMAIL_TO: tools.Email,
    TZ: bg.TimezoneUtc,
    BASIC_AUTH_USERNAME: bg.BasicAuthUsername,
    BASIC_AUTH_PASSWORD: bg.BasicAuthPassword,
    API_KEY: tools.ApiKey,
    AXIOM_API_TOKEN: z.string().length(41),
  })
  .strip();

export type EnvironmentType = bg.EnvironmentResultType<typeof Schema>;

const type = bg.NodeEnvironment.parse(process.env.NODE_ENV);

export const EnvironmentLoader = new bg.EnvironmentLoaderProcessAdapter({ type, Schema }, process.env);
